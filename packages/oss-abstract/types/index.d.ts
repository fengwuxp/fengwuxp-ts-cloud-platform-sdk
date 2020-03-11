declare type ObservableProcessFunction = (percentage: number, ...originalResult: any[]) => Promise<void> | void;
/**
 * 上传的观察者
 */
declare class MultipartUploadObservable<T> {
    private executor;
    constructor(executor: (process: ObservableProcessFunction) => Promise<T>);
    progress: (process: ObservableProcessFunction) => Promise<T>;
    then: (onFulfilled: (value: T) => PromiseLike<T>) => Promise<T>;
}

/**
 * object store client
 */
interface OssClientInterface {
    /**
     * 分片上传结果
     * @param file
     * @param name
     * @param options
     */
    multipartUpload: (file: File | Blob, name?: string, ...options: any[]) => MultipartUploadObservable<MultipartUploadResult>;
}
interface MultipartUploadResult<T = any> {
    url: string;
    originalResult: T;
}

export { MultipartUploadObservable, MultipartUploadResult, ObservableProcessFunction, OssClientInterface };
