
import {QiNiuOssUploadConfig} from "qiniu-js";

//七牛云 os 可选的配置
export type QiNiuYunOssClientConfiguration =
    Pick<QiNiuOssUploadConfig, keyof QiNiuOssUploadConfig>
    & { token: string;domain:string };

export type GetConfigurationHandle = () => Promise<QiNiuYunOssClientConfiguration>;

export interface ConfigurationProvider {

    get: () => Promise<QiNiuYunOssClientConfiguration>;
}
