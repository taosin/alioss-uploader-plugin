/*
 * @Author: iMocco
 * @Date:   2018-11-30 17:16:32
 * @Last Modified by: xin.tao
 * @Last Modified time: 2020-10-16 14:22:288
 */

let OSS = require("ali-oss");
let colors = require("colors");
let _ = require("lodash");
let path = require("path");
let glob = require("glob");
var fs = require("fs");
colors.setTheme({
  info: "green",
  warn: "yellow",
  error: "red",
});
class AliOSSUploaderPlugin {
  constructor(options, fileArray) {
    this.options = _.extend({}, options);
    this.fileArray = fileArray;
  }
  validOptions() {
    if (
      !this.options ||
      !this.options.buildPath ||
      !this.options.region ||
      !this.options.accessKeyId ||
      !this.options.accessKeySecret ||
      !this.options.bucket
    ) {
      throw new Error("Not found necessary params".red);
      return;
    }
  }
  upload() {
    const _this = this;
    _this.validOptions();
    var deleteAll = _this.options.deleteAll || false;
    const { region, accessKeyId, accessKeySecret, bucket, internal = false, buildPath } = _this.options;
    var client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
      internal,
    });
    if (deleteAll) {
      try {
        (async () => {
          var fileList = await client.list();
          var files = [];
          if (fileList.objects) {
            fileList.objects.forEach(function (file) {
              files.push(file.name);
            });
            await client.deleteMulti(files, { quiet: true });
          }
        })();
      } catch (error) {
        console.log(error.red);
      }
    }
    const paths = path.resolve(__dirname, buildPath);
    const eachFileSync = (dir, callback) => {
      // 获取该路径下所有层级文件以及子文件， * 为获取当前层级文件，** 为获取所有层级文件
      glob.sync(`${dir}/**`).map((el) => {
        callback && callback(el);
      });
    };
    //上传oss的新代码
    eachFileSync(paths, (filename) => {
      // 过滤掉文件夹
      if (fs.lstatSync(filename).isFile()) {
        _this.fileArray.push(filename);
      }
    });
    for (let index = 0; index < _this.fileArray.length; index++) {
      const file = _this.fileArray[index];
      const filename = file.split(paths)[1];
      try {
        (async () => {
          let result = await client.put(filename, file);
          console.log("Success: " + result.name.green);
        })();
      } catch (error) {
        console.log("error: " + error.red);
      }
    }
  }
}
module.exports = AliOSSUploaderPlugin;
