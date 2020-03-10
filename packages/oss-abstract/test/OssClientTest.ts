import * as log4js from "log4js";
import {OssClientInterface} from "../src/OssClient";
import MockOssClient from "./MockOssClient";

const logger = log4js.getLogger();
logger.level = 'debug';


describe("function test", () => {


    const ossClient: OssClientInterface = new MockOssClient();


    test("test oss client", () => {
        ossClient.multipartUpload(null).progress((percentage) => {
            logger.debug("===percentage=>", percentage)
            // return Promise.resolve();
        }).then((result) => {
            logger.debug(result);
        })

    })
});
