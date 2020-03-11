import StringUtils from "fengwuxp-common-utils/lib/string/StringUtils";
import UUIDUtil from "fengwuxp-common-utils/lib/uuid/UUIDUtil";


export interface FileNameGenerator {


    gen: (filename: string, extName?: string) => string;
}


export default class SimpleFileNameGenerator implements FileNameGenerator {


    private prefix: string;


    constructor(prefix?: string) {
        if (prefix == null) {
            this.prefix = '';
        } else {
            this.prefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
        }
    }

    gen = (filename: string, extName?: string) => {

        //前缀/年份/月份日期/filename.xxx

        const date = new Date();
        const days = date.getDate();
        if (!StringUtils.hasText(extName)) {
            extName = filename.substring(filename.lastIndexOf(".") + 1, filename.length);
        }
        const name = `${UUIDUtil.guid(16).replace(/-/g, "")}_${date.getTime()}.${extName}`;
        const key = `${this.prefix}${date.getFullYear()}/${date.getMonth() + 1}${days < 10 ? "0" + days : days}/${name}`;
        console.log("上传到oos的key", key);
        return key;
    };


}


