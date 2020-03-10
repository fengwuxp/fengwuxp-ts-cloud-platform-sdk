declare module "qiniu-js" {


    export interface QiNiuSubscription {

        /**
         * 通过调用 subscription.unsubscribe() 停止当前文件上传。
         */
        unsubscribe: () => void;
    }

    type QiNiuUploadOnNextFunction = (value: {
        total: {
            //已上传大小，单位为字节。
            loaded: number;
            // 本次上传的总量控制信息，单位为字节，注意这里的 total 跟文件大小并不一致。
            total: number;
            // 当前上传进度，范围：0～100。
            percent: number;
        }
    }) => void;

    type QiNiuUploadOnErrorFunction = (error: {
        // 请求错误状态码，只有在 err.isRequestError 为 true 的时候才有效。可查阅码值对应
        // @doc https://developer.qiniu.com/kodo/api/3928/error-responses
        code: number;
        // xhr请求错误的 X-Reqid。
        reqId?: string;
        // 错误信息，包含错误码，当后端返回提示信息时也会有相应的错误信息
        message?: string,
        //  用于区分是否 xhr 请求错误；当 xhr 请求出现错误并且后端通过 HTTP 状态码返回了错误信息时，该参数为 true；否则为 undefined
        isRequestError?: boolean

    }) => void;

    type QiNiuUploadOnCompleteFunction = (res: any) => void;

    export interface QiNiuObservable {
        subscribe: (onNxt: QiNiuUploadOnNextFunction,
                    onError: QiNiuUploadOnErrorFunction,
                    onComplete: QiNiuUploadOnCompleteFunction) => QiNiuSubscription;
    }


    interface QiNiuObserver {

        /**
         *  接收上传进度信息，res是一个带有 total 字段的 object，包含loaded、total、percent三个属性，提供上传进度信息
         * @param value
         */
        next: QiNiuUploadOnNextFunction;

        /**
         * 传错误后触发；自动重试本身并不会触发该错误，而当重试次数到达上限后则可以触发。当不是 xhr 请求错误时，会把当前错误产生原因直接抛出，诸如 JSON 解析异常等
         * @param error
         */
        error: QiNiuUploadOnErrorFunction;

        /**
         * 接收上传完成后的后端返回信息，具体返回结构取决于后端sdk的配置，可参考上传策略
         * {@see https://developer.qiniu.com/kodo/manual/1206/put-policy}
         */
        complete: QiNiuUploadOnCompleteFunction;

    }


    export interface QiNiuOssUploadExtraOptions {

        //文件原文件名
        fname?: string;
        // 用来放置自定义变量，自定义变量格式请参考文档
        params?: Record<string, any>;
        // 用来限制上传文件类型，为 null 时表示不对文件类型限制；限制类型放到数组里： ["image/png", "image/jpeg", "image/gif"]
        mimeType?: Array<string>;
    }

    /**
     * 七牛云上传配置
     */
    export interface QiNiuOssUploadConfig {


        /**
         * 表示是否使用 cdn 加速域名，为布尔值，true 表示使用，默认为 false。
         */
        useCdnDomain?: boolean;

        /**
         * 是否禁用日志报告，为布尔值，默认为 false。
         */
        disableStatisticsReport?: boolean;

        /**
         * 上传 host，类型为 string， 如果设定该参数则优先使用该参数作为上传地址，默认为 null。
         */
        uphost?: string;

        /**
         * 选择上传域名区域；当为 null 或 undefined 时，自动分析上传域名区域。
         */
        region?: string;

        /**
         * 上传自动重试次数（整体重试次数，而不是某个分片的重试次数）；默认 3 次（即上传失败后最多重试两次）
         */
        retryCount?: number;

        /**
         *  分片上传的并发请求量，number，默认为3；因为浏览器本身也会限制最大并发量，所以最大并发量与浏览器有关
         */
        concurrentRequestLimit?: number;

        /**
         * 是否开启 MD5 校验，为布尔值；在断点续传时，开启 MD5 校验会将已上传的分片与当前分片进行 MD5 值比对，若不一致，则重传该分片，
         * 避免使用错误的分片。读取分片内容并计算 MD5 需要花费一定的时间，因此会稍微增加断点续传时的耗时，默认为 false，不开启。
         */
        checkByMD5?: boolean;

        /**
         * 是否上传全部采用直传方式，为布尔值；为 true 时则上传方式全部为直传 form 方式，禁用断点续传，默认 false。
         */
        forceDirect?: boolean;
    }


    /**
     * 文件上传
     * @param file   对象，上传的文件
     * @param key   文件资源名
     * @param token  上传验证信息，前端通过接口请求后端获得
     * @param putExtra 上传扩展信息
     * @param config 上传配置 {@see QiNiuOssUploadConfig}
     */
    export function upload(file: File | Blob, key: string, token: string, putExtra?: QiNiuOssUploadExtraOptions, config?: QiNiuOssUploadConfig): QiNiuObservable;

}
