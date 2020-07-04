import AliOssClient, {OssClientOptions, MultipartUploadResp} from 'ali-oss';


declare type OssClientOptionalOptions = Pick<OssClientOptions, Exclude<keyof OssClientOptions, keyof {
    accessKeyId: string;
    accessKeySecret: string;
}>>;

interface ALiYunOssFactory {
    /**
     * 初始化阿里云oss的代理工厂
     */
    factory: (ossClientOptions?: OssClientOptionalOptions) => Promise<AliOssClient>;
}

declare type GetConfigFunction<T> = () => Promise<T>;

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


interface OakALiYunOssInitializerOptions extends OssClientOptionalOptions {
    //获取配置的url或方法
    getConfigUrl: GetConfigFunction<OssServerConfig> | string;

    //获取配置的url或方法
    getStsTokenUrl?: GetConfigFunction<AliYunStsTokenInfo> | string;
}

declare const genUploadOssKey: (filename: string, extName?: string) => string;
/**
 * 解析上传结果
 * @param resp
 */
declare const resolveUploadResult: (resp: MultipartUploadResp) => string[];

declare class DefaultALiYunOssInitializer implements ALiYunOssFactory {
    private options;
    private aLiYunOssFactory;

    constructor(options: OakALiYunOssInitializerOptions);

    factory: (ossClientOptions?: Pick<OssClientOptions, "internal" | "timeout" | "stsToken" | "bucket" | "endpoint" | "region" | "secure" | "cname" | "isRequestPay" | "useFetch">) => Promise<AliOssClient<any>>;
    private initFactory;
}

export default DefaultALiYunOssInitializer;
export {OakALiYunOssInitializerOptions, genUploadOssKey, resolveUploadResult};
