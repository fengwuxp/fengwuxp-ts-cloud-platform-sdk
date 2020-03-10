export type ObservableProcessFunction = (percentage: number,) => Promise<void> | void;

/**
 * 上传的观察者
 */
export default class MultipartUploadObservable<T> {

    private executor: (process: ObservableProcessFunction) => Promise<T>;


    constructor(executor: (process: ObservableProcessFunction) => Promise<T>) {
        this.executor = executor;
    }

    progress = (process: ObservableProcessFunction): Promise<T> => {
        return this.executor(process);
    };

    then = (onFulfilled: (value: T) => PromiseLike<T>): Promise<T> => {
        return this.progress((percentage) => Promise.resolve()).then(onFulfilled);
    };

}
