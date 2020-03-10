import {QiNiuOssUploadConfig} from "qiniu-js";


//七牛云 os 可选的配置
export type QiNiuYunOssClientOptionalOptions =
    Pick<QiNiuOssUploadConfig, keyof QiNiuOssUploadConfig>
    & { token: string };

/**
 * 获取七牛云 oss配置
 */
export interface QiNiuYunOssUploadConfigurationFactory {


    factory: () => Promise<QiNiuYunOssClientOptionalOptions>;

}
