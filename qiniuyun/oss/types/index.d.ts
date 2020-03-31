import { QiNiuOssUploadConfig, QiNiuOssUploadExtraOptions } from 'qiniu-js';
import { OssClientInterface, FileNameGenerator, MultipartUploadObservable, MultipartUploadResult } from 'fengwuxp-oss-abstract';

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
    private useCache;
    constructor(getConfigUrl: string | GetConfigurationHandle, useCache?: boolean);
    get: () => Promise<QiNiuYunOssClientConfiguration>;
}

declare class QiNiuOssClient implements OssClientInterface {
    private configurationProvider;
    protected fileNameGenerator: FileNameGenerator;
    private parseResult;
    constructor(configurationProvider: ConfigurationProvider, fileNameGenerator?: FileNameGenerator, parseResult?: (result: string, config: QiNiuYunOssClientConfiguration) => string);
    multipartUpload: (file: File, name?: string, putExtra?: QiNiuOssUploadExtraOptions, config?: QiNiuOssUploadConfig) => MultipartUploadObservable<MultipartUploadResult<any>>;
}

export { ConfigurationProvider, DefaultConfigurationProvider, GetConfigurationHandle, QiNiuOssClient, QiNiuYunOssClientConfiguration };
