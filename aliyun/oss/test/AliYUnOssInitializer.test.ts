import * as log4js from "log4js";
import DefaultALiYunOssInitializer from "../src";
import {ALiYunOssFactory} from "../src/factory/ALiYunOssFactory";

const logger = log4js.getLogger();
logger.level = 'debug';


describe("function test", () => {

    let defaultALiYunOssInitializer: ALiYunOssFactory = new DefaultALiYunOssInitializer({
        getConfigUrl: () => {
            //接口调用
            return Promise.resolve()
        },
        // getStsTokenUrl: () => {
        //     //接口调用
        //     return Promise.resolve()
        // }
        getStsTokenUrl: ""
    });

    test("test", () => {

        defaultALiYunOssInitializer.factory().then((client) => {
            client.multipartUpload("", null, {})
                .then(({res, name, bucket}) => {
                    logger.log("上传成功");
                }).catch((e) => {
                logger.log("上传失败", e);
            })

        })
    })
});
