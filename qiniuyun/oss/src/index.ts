import {QiNiuYunOssClientOptionalOptions, QiNiuYunOssUploadConfigurationFactory} from "./factory/QiNiuYunOssFactory";
import {FeignConfigurationRegistry} from "fengwuxp-typescript-feign";
export {QiNiuYunOssClientOptionalOptions,QiNiuYunOssUploadConfigurationFactory} from "./factory/QiNiuYunOssFactory";

const restTemplate = FeignConfigurationRegistry.getDefaultFeignConfiguration().getRestTemplate();

/**
 * 从服务端获取oss配置
 * @param url
 */
function getOssServerConfiguration(url: string | Function) {

    if (typeof url === "function") {
        return url();
    }

    return restTemplate.getForObject<QiNiuYunOssClientOptionalOptions>(url);
}

export type GetConfigurationHandle = () => Promise<QiNiuYunOssClientOptionalOptions>


export default class DefaultQiNiuYunOssUploadConfigurationFactory implements QiNiuYunOssUploadConfigurationFactory {


    private getConfigUrl: string | GetConfigurationHandle;

    private config: QiNiuYunOssClientOptionalOptions;


    constructor(getConfigUrl: string | GetConfigurationHandle) {
        this.getConfigUrl = getConfigUrl;
    }

    factory = (): Promise<QiNiuYunOssClientOptionalOptions> => {

        if (this.config == null) {
            const {getConfigUrl} = this;
            return getOssServerConfiguration(getConfigUrl).then((config) => {
                this.config = config;
                return config;
            });
        } else {
            return Promise.resolve(this.config);
        }

    }


}
