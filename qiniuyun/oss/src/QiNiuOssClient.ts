import {
    MultipartUploadObservable,
    MultipartUploadResult,
    OssClientInterface,
    FileNameGenerator,
    SimpleFileNameGenerator
} from "fengwuxp-oss-abstract";
import {QiNiuOssUploadConfig, QiNiuOssUploadExtraOptions, upload} from "qiniu-js";
import {ConfigurationProvider, QiNiuYunOssClientConfiguration} from "./configuration/ConfigurationProvider";
import StringUtils from "fengwuxp-common-utils/lib/string/StringUtils";

const defaultResultParser = (result: any, config: QiNiuYunOssClientConfiguration) => {

    let domain = config.domain;
    if (!domain.endsWith("/")) {
        domain = `${domain}/`;
    }
    return `${domain}${result.key}`;
};

export default class QiNiuOssClient implements OssClientInterface {


    private configurationProvider: ConfigurationProvider;

    protected fileNameGenerator: FileNameGenerator;

    private parseResult: (result: string, config) => string;


    constructor(configurationProvider: ConfigurationProvider,
                fileNameGenerator: FileNameGenerator = new SimpleFileNameGenerator(),
                parseResult: (result: string, config: QiNiuYunOssClientConfiguration) => string = defaultResultParser) {
        this.configurationProvider = configurationProvider;
        this.fileNameGenerator = fileNameGenerator;
        this.parseResult = defaultResultParser
    }

    multipartUpload = (file: File, name?: string, putExtra?: QiNiuOssUploadExtraOptions, config?: QiNiuOssUploadConfig): MultipartUploadObservable<MultipartUploadResult> => {

        const {configurationProvider, fileNameGenerator, parseResult} = this;

        return new MultipartUploadObservable<MultipartUploadResult>((process) => {
            return configurationProvider.get().then((configuration) => {
                const token = configuration.token;
                return new Promise((resolve, reject) => {
                    const filename = file.name;
                    if (!StringUtils.hasText(name)) {
                        name = fileNameGenerator.gen(filename)
                    }
                    upload(file, name, token, {
                        fname: filename,
                        ...putExtra
                    }, {
                        ...configuration,
                        ...config
                    }).subscribe((value) => {
                        const total = value.total;
                        process(total.percent, total, value)
                    }, reject, resolve)
                }).then((result: any) => {
                    return {
                        url: parseResult(result, configuration),
                        originalResult: result
                    }
                })
            })

        });
    };


}
