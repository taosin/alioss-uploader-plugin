# alioss-uploader-plugin

> 可将静态资源上传到阿里云OSS上的插件


## Install

```bash
$ npm install alioss-uploader-plugin --save-dev
```


## Useage

```js
var AliOSSUploaderPlugin = require('alioss-uploader-plugin')
new AliOSSUploaderPlugin(
  {
    buildPath: "your buildPath",
    region: "oss-cn-region",
    accessKeyId: "your accessKeyId",
    accessKeySecret: "your accessKeySecret",
    bucket: "your bucket",
    deleteAll: true,
    generateObjectPath: function (filename) {
      return filename;
    },
  },
  []
).upload();

```