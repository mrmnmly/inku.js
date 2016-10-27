// export as a module
module.exports = {
	// returns all directories in given path
	getDirectories: function(pathStr){
		var fs = require('fs');
		var path = require('path');
		return fs.readdirSync(pathStr).filter(function (file) {
			return fs.statSync(pathStr+'/'+file).isDirectory();
		});
	},
	// returns file content based on given file path
	getFile: function(pathStr){
		var fs = require('fs');
		var path = require('path');
		return fs.readFileSync(pathStr, 'utf8', function(err, data){
			if(err){
				console.warn(err);
			}else{
				return data;
			}
		})
	},

	// returns image file content based on given file path
	getImageFile: function(pathStr){
		var fs = require('fs');
		var path = require('path');
		return fs.readFileSync(pathStr, 'binary', function(err, data){
			if(err){
				console.warn(err);
			}else{
				return data;
			}
		})
	},

	// returns file list in given path
	getFiles: function(pathStr){
		var fs = require('fs');
		var path = require('path');
		return fs.readdirSync(pathStr).filter(function (file) {
			return !fs.statSync(pathStr+'/'+file).isDirectory();
		});
	},

	// returns complete file list, ready to be displayed in admin section
	getFileList: function(){
		var itemDirs = module.exports.getDirectories(__dirname + '/../source');
		var rootFiles = module.exports.getFiles(__dirname + '/../source');
		var fileList = {};
		if(itemDirs.length){
			var files = [];
			for(var x = 0, l = itemDirs.length; x < l; x++){
				var folder = __dirname + '/../source/' + itemDirs[x];
				var files = module.exports.getFiles(folder);
				var folderName = folder.split('/');
				folderName = folderName[folderName.length - 1];
				fileList[folderName] = [];
				for(var y = 0; y < files.length; y++){
					var fullPath = folder + '/' + files[y];
					var obj = {
						category: folderName,
						file: files[y],
						path: fullPath
					}
					// the rest of the entries in the array entry are paths to files
					fileList[folderName].push(obj);
				}
				fileList[folderName] = fileList[folderName].reverse();
			}
		}
		for(var x = 0, l = rootFiles.length; x < l; x++){
			var obj = {
				title: rootFiles[x].replace('.pug', ''),
				path: '/' + rootFiles[x]
			}
			fileList[obj.title] = obj;
		}
		return fileList;
	},

	// helper function for image decoding
	decodeBase64Image: function(dataString){
		var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
		var response = {};
		if(matches.length !== 3){
			return new Error('Invalid input string');
		}
		response.type = matches[1];
		response.data = new Buffer(matches[2], 'base64');
		return response;
	}
};