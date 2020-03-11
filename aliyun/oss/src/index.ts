import AliOssClient, {MultipartUploadResp, OssClientOptions} from "ali-oss";
import {
    ALiYunOssFactory,
    OssClientOptionalOptions
} from "./factory/ALiYunOssFactory";
import {FeignConfigurationRegistry} from "fengwuxp-typescript-feign";
import StringUtils from "fengwuxp-common-utils/lib/string/StringUtils";
import UUIDUtil from "fengwuxp-common-utils/lib/uuid/UUIDUtil";


type GetConfigFunction = () => Promise<any>;

export interface OakALiYunOssInitializerOptions extends OssClientOptionalOptions {

    //获取配置的url或方法
    getConfigUrl: GetConfigFunction | string;

    //获取配置的url或方法
    getStsTokenUrl?: GetConfigFunction | string;
}


interface OssServerConfig {

    aliyunOssBuckeName: string;

    aliyunOssEndpoint: string;

    aliyunOssPrefix: string;

    aliyunOssStsRoleArn: string;

    aliyunStsAccessKeyId: string;

    aliyunStsAccessKeySecret: string;

    localServer: boolean;

    mode: string;

    oss: boolean;
}

interface AliYunStsTokenInfo {


    /**
     * 授权接入ID
     */
    accessKeyId: string;

    /**
     * 授权接入密钥
     */
    accessKeySecret: string;

    /**
     * 访问token
     */
    securityToken: string;

    /**
     * 访问token有效日期
     */
    expirationTime: number;

    /**
     * 访问token有效秒数
     */
    expirationSeconds: number;
}

const OSS_OTHER_OPTIONS: {
    prefix: string;
} = {
    prefix: ""
};

//生成上传的文件名称
export const genUploadOssKey = (filename: string, extName?: string) => {
    //前缀/年份/月份日期/filename.xxx

    const date = new Date();
    const days = date.getDate();
    if (!StringUtils.hasText(extName)) {
        extName = filename.substring(filename.lastIndexOf(".") + 1, filename.length);
    }
    const name = `${UUIDUtil.guid(16).replace(/-/g, "")}_${date.getTime()}.${extName}`;
    const key = `${OSS_OTHER_OPTIONS.prefix}/${date.getFullYear()}/${date.getMonth() + 1}${days < 10 ? "0" + days : days}/${name}`;
    console.log("上传到oos的key", key);
    return key;
};

/**
 * 解析上传结果
 * @param resp
 */
export const resolveUploadResult = (resp: MultipartUploadResp): string[] => {
    console.log("上传结果", resp);
    const {res} = resp;
    return res.requestUrls.map(url => {
        return url.split("?")[0];
    })
};


const restTemplate = FeignConfigurationRegistry.getDefaultFeignConfiguration().getRestTemplate();

/**
 * 从服务端获取oss配置
 * @param url
 */
function getOssServerConfiguration(url: string | Function) {

    if (typeof url === "function") {
        return url();
    }

    return restTemplate.getForObject<OssServerConfig>(url);
}

export default class DefaultALiYunOssInitializer implements ALiYunOssFactory {


    private options: OakALiYunOssInitializerOptions;

    private aLiYunOssFactory: ALiYunOssFactory;


    constructor(options: OakALiYunOssInitializerOptions) {
        this.options = options;
    }

    factory = (ossClientOptions?: OssClientOptionalOptions) => {
        if (this.aLiYunOssFactory == null) {
            return this.initFactory(this.options).then((factory) => {
                this.aLiYunOssFactory = factory;
                return factory.factory(ossClientOptions);
            });
        } else {
            return this.aLiYunOssFactory.factory(ossClientOptions);
        }
    };


    private initFactory = (options: OakALiYunOssInitializerOptions): Promise<ALiYunOssFactory> => {

        const {getConfigUrl, getStsTokenUrl} = options;
        if (getConfigUrl == null || getStsTokenUrl == null) {
            return Promise.resolve({
                factory: (ossClientOptions?: OssClientOptionalOptions) => {
                    return Promise.resolve(new AliOssClient({
                        ...ossClientOptions,
                        ...(options as any)
                    }, {}));
                }
            });
        }

        //获取oos配置
        return getOssServerConfiguration(getConfigUrl).then((resp) => {
            const ossServerConfig: OssServerConfig = resp;
            const enabledOss = (ossServerConfig.oss || ossServerConfig.mode === "oss")
                && StringUtils.hasText(ossServerConfig.aliyunStsAccessKeyId)
                && StringUtils.hasText(ossServerConfig.aliyunStsAccessKeySecret);
            if (!enabledOss) {
                //未启用
                return Promise.reject("oss not enabled");
            }
            OSS_OTHER_OPTIONS.prefix = ossServerConfig.aliyunOssPrefix || "";

            if (getConfigUrl != null) {
                // sts token 模式  https://www.alibabacloud.com/help/zh/doc-detail/32077.htm
                return new DefaultSTSALiYunOssFactory({
                    region: ossServerConfig["region"] || "cn-hangzhou",
                    accessKeyId: null,
                    accessKeySecret: null,
                    bucket: ossServerConfig.aliyunOssBuckeName,
                    endpoint: ossServerConfig.aliyunOssEndpoint
                }, getStsTokenUrl);
            }

            // 普通模式
            return {
                factory: (ossClientOptions?: OssClientOptionalOptions) => {
                    return Promise.resolve(new AliOssClient({
                        ...ossClientOptions,
                        region: ossServerConfig["region"] || "cn-hangzhou",
                        accessKeyId: ossServerConfig.aliyunStsAccessKeyId,
                        accessKeySecret: ossServerConfig.aliyunStsAccessKeySecret,
                        bucket: ossServerConfig.aliyunOssBuckeName,
                        endpoint: ossServerConfig.aliyunOssEndpoint
                    }, {}));
                }
            }

        });

    };


}

/**
 * sts token oss factory
 */
class DefaultSTSALiYunOssFactory implements ALiYunOssFactory {

    //oss 相关的配置
    private ossClientOptions: OssClientOptions;


    // @doc https://www.alibabacloud.com/help/zh/doc-detail/32077.htm
    //使用ststoken模式
    private aliYunStsTokenInfo: AliYunStsTokenInfo;

    //刷新sts token url
    private getStsTokenUrl: GetConfigFunction | string;

    constructor(ossClientOptions: OssClientOptions,
                aliYunStsTokenInfo: GetConfigFunction | string | AliYunStsTokenInfo) {
        this.ossClientOptions = ossClientOptions;
        if (typeof aliYunStsTokenInfo === "object") {
            this.aliYunStsTokenInfo = aliYunStsTokenInfo;
        } else {
            this.getStsTokenUrl = aliYunStsTokenInfo;
        }
    }

    factory = async (ossClientOptions?: OssClientOptionalOptions): Promise<AliOssClient> => {

        const aliYunStsTokenInfo = this.aliYunStsTokenInfo;

        //提前3分钟刷新token
        const needRefreshToken = aliYunStsTokenInfo == null || new Date().getTime() + 3 * 60 * 1000 > aliYunStsTokenInfo.expirationTime;
        if (needRefreshToken) {
            // 刷新token
            await this.refreshStsToken();
        }
        const options: OssClientOptions = {
            ...(ossClientOptions || {}),
            ...this.ossClientOptions
        };
        return new AliOssClient(options, {});
    };

    /**
     * 刷新sts token
     */
    private refreshStsToken = () => {

        return getOssServerConfiguration(this.getStsTokenUrl)
            .then((aliYunStsTokenInfo: AliYunStsTokenInfo) => {
                this.ossClientOptions = {
                    ...this.ossClientOptions,
                    stsToken: aliYunStsTokenInfo.securityToken,
                    accessKeyId: aliYunStsTokenInfo.accessKeyId,
                    accessKeySecret: aliYunStsTokenInfo.accessKeySecret,
                };
                this.aliYunStsTokenInfo = aliYunStsTokenInfo;
            }).catch((e) => {
                console.error(`刷新token失败：${e}`);
                return Promise.reject(e);
            });
    }
}









