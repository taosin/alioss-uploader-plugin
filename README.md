# alioss-uploader-plugin
----

可将静态资源上传到阿里云OSS上。


## Install

----

```bash
$ npm install alioss-uploader-plugin --save-dev
```


## Useage

```js
var AliyunossWebpackPlugin = require('aliyunoss-webpack-plugin')
var webpackConfig = {
  entry: 'index.js',
  output: {
    path: 'dist',
    filename: 'index_bundle.js'
  },
  plugins: [new AliyunossWebpackPlugin({
    buildPath:'your build path',
    region: 'your region',
    accessKeyId: 'your key',
    accessKeySecret: 'your secret',
    bucket: 'your bucket',
    generateObjectPath: function(filename) {
    	return filename
  	},
  })]
}
```