import { QiNiuOssUploadConfig } from 'qiniu-js';

declare type QiNiuYunOssClientOptionalOptions = Pick<QiNiuOssUploadConfig, keyof QiNiuOssUploadConfig> & {
    token: string;
};
/**
 * 获取七牛云 oss配置
 */
interface QiNiuYunOssUploadConfigurationFactory {
    factory: () => Promise<QiNiuYunOssClientOptionalOptions>;
}

declare type GetConfigurationHandle = () => Promise<QiNiuYunOssClientOptionalOptions>;
declare class DefaultQiNiuYunOssUploadConfigurationFactory implements QiNiuYunOssUploadConfigurationFactory {
    private getConfigUrl;
    private config;
    constructor(getConfigUrl: string | GetConfigurationHandle);
    factory: () => Promise<QiNiuYunOssClientOptionalOptions>;
}

export default DefaultQiNiuYunOssUploadConfigurationFactory;
export { GetConfigurationHandle };
