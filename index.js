/*
* @Author: iMocco
* @Date:   2018-11-30 17:16:32
* @Last Modified by:   iMocco
* @Last Modified time: 2018-12-03 16:23:24
*/

let co = require('co');
let oss = require('ali-oss');
let colors = require('colors');
let _ = require('lodash');
let path = require('path');
let glob = require("glob");
var fs = require("fs");

function AliOSSUploaderPlugin(options) {
	if (!options || !options.buildPath || !options.region || !options.accessKeyId || !options.accessKeySecret || !options.bucket) {
		throw new Error('Not found necessary params'.red);
		return
	}
	this.fileArray = [];
	this.options = _.extend({
	}, options);
}

AliOSSUploaderPlugin.prototype.apply = function(compiler) {
	var _this = this;
	if (compiler) {
		compiler.plugin("done", function(compilation) {
			_this.oposs();
		});
	} else {
		_this.oposs();
	}
};

AliOSSUploaderPlugin.prototype.oposs = function() {
	var _this = this;
	var deleteAll = _this.options.deleteAll || false;
	var generateObjectPath = _this.options.generateObjectPath || function(fileName) {
		return fileName;
	}
	var getObjectHeaders = _this.options.getObjectHeaders || function() {
		return {};
	}

	co(function*() {
		'use strict';
		var store = oss({
			region: _this.options.region,
			accessKeyId: _this.options.accessKeyId,
			accessKeySecret: _this.options.accessKeySecret,
			bucket: _this.options.bucket,
			internal: _this.options.internal ? true : false,
		});

		//删除oss上代码
		if (deleteAll) {
			var fileList = yield store.list();
			var files = [];
			if (fileList.objects) {
				fileList.objects.forEach(function(file) {
					files.push(file.name);
				})
				var result = yield store.deleteMulti(files, {
					quiet: true
				});
			}
		}

		var eachFileSync = function(dir, callback) {
			glob.sync(dir).map(function(el){
				callback(el);
			});
		}
		//上传oss的新代码
		eachFileSync(_this.options.buildPath, function(filename, stats) {

			// 过滤掉文件夹
			if(fs.lstatSync(filename).isFile()){
				_this.fileArray.push(filename);
			}
		});

		var j = 0;
		for (var i = 0; i < _this.fileArray.length; i++) {
			var file = _this.fileArray[i];
			var fileName = file.split('/').pop();
			var ossFileName = generateObjectPath(file);
			yield store.put(ossFileName, file);
			console.log(file + ' -- upload to ' + ossFileName + ' success'.green);
		}
	}).catch(function(err) {
		console.info(err)
	})
}
module.exports = AliOSSUploaderPlugin;