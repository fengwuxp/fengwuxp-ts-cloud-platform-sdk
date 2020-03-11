import MultipartUploadObservable from "./MultipartUploadObservable";


/**
 * object store client
 */
export interface OssClientInterface {


    /**
     * 分片上传结果
     * @param file
     * @param name
     * @param options
     */
    multipartUpload: (file: File | Blob, name?: string, ...options: any[]) => MultipartUploadObservable<MultipartUploadResult>

}

export interface MultipartUploadResult<T = any> {

    // 上传结果的url地址
    url: string;

    // 原本的oss平台的返回值
    originalResult: T
}


