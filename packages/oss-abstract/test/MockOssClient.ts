import {MultipartUploadResult, OssClientInterface} from "../src/OssClient";
import MultipartUploadObservable from "../src/MultipartUploadObservable";


const mockUpload = (file, name, process: Function): Promise<MultipartUploadResult> => {

    let percentage = 0;
    while (percentage < 100) {
        process(percentage++)
    }
    return Promise.resolve({
        url: "1111",
        originalResult: null
    });
};

export default class MockOssClient implements OssClientInterface {


    constructor() {
    }

    multipartUpload = <O>(file: (File | Blob), name?: string, options?: O): MultipartUploadObservable<MultipartUploadResult> => {

        return new MultipartUploadObservable<MultipartUploadResult>((process) => {

            return mockUpload(file, name, process);
        });
    };


}
