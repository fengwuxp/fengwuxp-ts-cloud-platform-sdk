import { QiNiuOssUploadConfig, QiNiuOssUploadExtraOptions } from 'qiniu-js';
import { OssClientInterface, MultipartUploadObservable, MultipartUploadResult } from 'fengwuxp-oss-abstract';

declare type QiNiuYunOssClientConfiguration = Pick<QiNiuOssUploadConfig, keyof QiNiuOssUploadConfig> & {
    token: string;
    domain: string;
};
declare type GetConfigurationHandle = () => Promise<QiNiuYunOssClientConfiguration>;
interface ConfigurationProvider {
    get: () => Promise<QiNiuYunOssClientConfiguration>;
}

declare class DefaultConfigurationProvider implements ConfigurationProvider {
    private getConfigUrl;
    private config;
    constructor(getConfigUrl: string | GetConfigurationHandle);
    get: () => Promise<QiNiuYunOssClientConfiguration>;
}

declare class QiNiuOssClient implements OssClientInterface {
    private configurationProvider;
    private parseResult;
    constructor(configurationProvider: ConfigurationProvider, parseResult?: (result: string, config: QiNiuYunOssClientConfiguration) => string);
    multipartUpload: (file: Blob | File, name?: string, putExtra?: QiNiuOssUploadExtraOptions, config?: QiNiuOssUploadConfig) => MultipartUploadObservable<MultipartUploadResult<any>>;
}

export { ConfigurationProvider, DefaultConfigurationProvider, GetConfigurationHandle, QiNiuOssClient, QiNiuYunOssClientConfiguration };
