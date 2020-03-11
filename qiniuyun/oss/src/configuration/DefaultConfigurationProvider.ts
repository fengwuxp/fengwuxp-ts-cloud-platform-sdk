import {ConfigurationProvider, QiNiuYunOssClientConfiguration, GetConfigurationHandle} from "./ConfigurationProvider";


/**
 * 从服务端获取oss配置
 * @param url
 */
function getOssServerConfiguration(url: string | Function) {

    if (typeof url === "function") {
        return url();
    }
    return import('fengwuxp-typescript-feign').then(({FeignConfigurationRegistry}) => {
        const restTemplate = FeignConfigurationRegistry.getDefaultFeignConfiguration().getRestTemplate();
        return restTemplate.getForObject<QiNiuYunOssClientConfiguration>(url);
    })

}

export default class DefaultConfigurationProvider implements ConfigurationProvider {


    private getConfigUrl: string | GetConfigurationHandle;

    private config: QiNiuYunOssClientConfiguration;


    constructor(getConfigUrl: string | GetConfigurationHandle) {
        this.getConfigUrl = getConfigUrl;
    }

    get = (): Promise<QiNiuYunOssClientConfiguration> => {

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
