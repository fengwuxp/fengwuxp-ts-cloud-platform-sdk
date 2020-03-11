import {MultipartUploadObservable, MultipartUploadResult, OssClientInterface} from "fengwuxp-oss-abstract";
import {QiNiuOssUploadConfig, QiNiuOssUploadExtraOptions, upload} from "qiniu-js";
import {ConfigurationProvider, QiNiuYunOssClientConfiguration} from "./configuration/ConfigurationProvider";


const defaultResultParser = (result: any, config: QiNiuYunOssClientConfiguration) => {

    return `${config.domain}${result.saveKey}`
};

export default class QiNiuOssClient implements OssClientInterface {


    private configurationProvider: ConfigurationProvider;

    private parseResult: (result: string, config) => string;


    constructor(configurationProvider: ConfigurationProvider,
                parseResult: (result: string, config: QiNiuYunOssClientConfiguration) => string = defaultResultParser) {
        this.configurationProvider = configurationProvider;
        this.parseResult = defaultResultParser
    }

    multipartUpload = (file: (File | Blob), name?: string, putExtra?: QiNiuOssUploadExtraOptions, config?: QiNiuOssUploadConfig): MultipartUploadObservable<MultipartUploadResult> => {

        const configurationProvider = this.configurationProvider;

        return new MultipartUploadObservable<MultipartUploadResult>((process) => {
            return configurationProvider.get().then((configuration) => {
                const token = configuration.token;
                return new Promise((resolve, reject) => {
                    upload(file, name, token, putExtra, {
                        ...configuration,
                        ...config
                    }).subscribe((value) => {
                        const total = value.total;
                        process(total.percent, total, value)
                    }, reject, resolve)
                }).then((result: any) => {
                    return {
                        url: this.parseResult(result, configuration),
                        originalResult: result
                    }
                })
            })

        });
    };


}
