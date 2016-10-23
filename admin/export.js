// export as a module
module.exports = {
	// compile item themes (filename contains '-item.pug' string)
	compileItems: function(itemThemes){
		var fs = require('fs-extra');
		var jade = require('jade');
		var wmd = require('wmd');
		var inkuImport = require('./import');
		var rssJson = {};
		// empty output folder
		fs.emptyDirSync(__dirname + '/../output/');
		// prepare output folder contents
		for(var x = 0, l = itemThemes.length; x < l; x++){
			if(itemThemes[x] !== undefined){
				var name = itemThemes[x].replace('-item.pug', '');
				var itemsPath = __dirname + '/../source/' + name + '/';
				var items = inkuImport.getFiles(itemsPath);
				var outputPath = __dirname + '/../output/' + name + '/';
				var templatePath = __dirname + '/../theme/' + name + '-item.pug';
				var template = inkuImport.getFile(templatePath);
				rssJson[name] = [];
				for(var y = 0, l = items.length; y < l; y++){
					var sourcePath = itemsPath + items[y];
					var sourceContent = inkuImport.getFile(sourcePath);
					var parsedContent = wmd(sourceContent);
					var fn = jade.render(template, parsedContent);
					var slug = module.exports.slugify(parsedContent.metadata.title);
					var outputFolder = outputPath + slug + '/';
					fs.emptyDir(outputFolder);
					var outputFilePath = outputFolder + 'index.html';
					var url = slug + '/';
					var obj = {
						title: parsedContent.metadata.title,
						meta: parsedContent.metadata,
						url: url
					};
					rssJson[name].push(obj);
					fs.outputFileSync(outputFilePath, fn);
					console.log(outputFilePath, ' saved!');
				}
			}
		}
		// save all posts data as RSS in JSON file / format
		var rssPath = __dirname + '/../output/rss.json';
		fs.outputFileSync(rssPath, JSON.stringify(rssJson));
		console.log(rssPath, ' rss file saved!');
	},
	// compile list themes (filename contains '-list.pug' string)
	compileLists: function(listThemes){
		var fs = require('fs-extra');
		var jade = require('jade');
		var inkuImport = require('./import');
		var rssPath = __dirname + '/../output/rss.json';
		var rss = inkuImport.getFile(rssPath);
		rss = JSON.parse(rss);
		for(var x = 0, l = listThemes.length; x < l; x++){
			if(listThemes[x] !== undefined){
				var name = listThemes[x].replace('-list.pug', '');
				if(rss[name] && rss[name].length){
					var outputItemsPath = __dirname + '/../output/' + name + '/';
					var outputListPath = outputItemsPath + 'index.html';
					var listTemplatePath = __dirname + '/../theme/' + name + '-list.pug';
					var listTemplate = inkuImport.getFile(listTemplatePath);
					var items = {};
					items.items = rss[name];
					var fn = jade.render(listTemplate, items);
					fs.outputFileSync(outputListPath, fn);
					console.log(outputListPath, ' list file exported!');
				}
			}
		}
	},
	// compile single page themes (filename contains '-page.pug' string) and home page (index.pug)
	compilePages: function(pageThemes){
		var fs = require('fs-extra');
		var jade = require('jade');
		var wmd = require('wmd');
		var inkuImport = require('./import');
		var rssPath = __dirname + '/../output/rss.json';
		var rss = inkuImport.getFile(rssPath);
		rss = JSON.parse(rss);
		for(var x = 0, l = pageThemes.length; x < l; x++){
			if(pageThemes[x] !== undefined){
				var name = pageThemes[x].replace('-page', '').replace('.pug', ''); // bacause index doesn't have '-page' string in filename
				var templatePath = __dirname + '/../theme/' + pageThemes[x];
				var contentPath = __dirname + '/../source/' + name + '.md';
				var templateFile = inkuImport.getFile(templatePath);
				var contentFile = inkuImport.getFile(contentPath);
				var parsedContent = wmd(contentFile);
				var fn = jade.render(templateFile, parsedContent);
				var slug = module.exports.slugify(name);
				var outputFolder = __dirname + '/../output/' + slug + '/';
				var url = slug + '/';
				// index (home page) will not land in subfolder
				if(name == 'index'){
					outputFolder = __dirname + '/../output/';
					url = '/';
				}else{
					fs.emptyDir(outputFolder);
				}
				var outputFilePath = outputFolder + 'index.html';
				rss[name] = {
					title: parsedContent.metadata.title,
					meta: parsedContent.metadata,
					url: url
				};
				fs.outputFileSync(outputFilePath, fn);
				console.log(outputFilePath, ' saved!');
			}
		}
		// save all new pages data as RSS in JSON file / format
		var rssPath = __dirname + '/../output/rss.json';
		fs.outputFileSync(rssPath, JSON.stringify(rss));
		console.log(rssPath, ' rss file updated!');
	},
	// compile whole content to [root]/output folder
	compileEverything: function(){
		var inkuImport = require('./import');
		// get website theme template files
		var themes = inkuImport.getFiles(__dirname + '/../theme');
		// filter theme files by their types
		var listThemes = themes.filter(function(obj){
			return obj.indexOf('-list.pug') > -1;
		});
		var itemThemes = themes.filter(function(obj){
			return obj.indexOf('-item.pug') > -1;
		});
		var pageThemes = themes.filter(function(obj){
			return obj.indexOf('-page.pug') > -1 || obj === 'index.pug';
		});
		module.exports.compileItems(itemThemes);
		module.exports.compileLists(listThemes);
		module.exports.compilePages(pageThemes);
		module.exports.compileCSS();
		module.exports.compileJS();
		module.exports.compileAssets(__dirname + '/../theme/static/img/', __dirname + '/../output/static/img/');
		module.exports.compileAssets(__dirname + '/../public/', __dirname + '/../output/public/');
	},
	// helper function that convert string to slug
	slugify: function(txt){
		return txt.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_').replace(/[^\w-]+/g,'');
	},
	// helper function that remove (empty) and re-create remote folder via ftp
	prepareFtpFolder: function(callback){
		var inkuImport = require('./import');
		var config = inkuImport.getFile(__dirname + '/../connect.json');
		config = JSON.parse(config);
		var CONFIG = {
			user: config.user,
			pass: config.password,
			host: config.ftp,
			port: 21
		}
		var destinationUrl = config.destination;
		var localUrl = __dirname + "/../output/";
		var fs = require('fs');
		var FTP = require('ftpimp');
		var ftp = FTP.create(CONFIG, false);
		ftp.connect(function(){
			console.log('Connected');
			setTimeout(function(){
				// check if desitnation directory exists by running ls command
				ftp.ls(destinationUrl, function(err, data){
					// if destination directory doesn't exists, create it
					if(err || !data){
						ftp.mkdir(destinationUrl, function (err, created) {
					    	console.log('Destination empty, creating: ', err, created);
					    	setTimeout(function(){
					    		// terminate ftp connection
					    		ftp.quit(function(){
					    			console.log('Disconnected.');
					    			if(callback){
							    		callback();
							    	}
					    		});
					    	}, 0);
						}, true);
					}else{
						// if destination directory exists, remove it (with all its contents)
						ftp.rmdir(destinationUrl, function (err, deleted) {
					    	console.log('Destination exists, removing: ',err, deleted);
					    	if(!err && deleted){
					    		// after removing destination directory, create it without previous contents
					    		setTimeout(function(){
					    			ftp.mkdir(destinationUrl, function (err, created) {
								    	console.log('Destination cleared, creating: ', err, created);
								    	setTimeout(function(){
							    			console.log('1Disconnected.');
							    			if(callback){
										    	callback();
									    	}
								    	}, 0);
									}, true);
					    		}, 0);
					    		
					    	}else{
					    		console.log('Clearing error: ', err, deleted);
					    		// terminate ftp connection
					    		ftp.quit(function(){
					    			console.log('Disconnected.');
					    		});
					    	}
						}, true);
					}
				});
			}, 1000);

		});
	},
	// function that deploys output folder to ftp (based on configuration from connect.json file)
	deployViaFtp: function(callback){
		var inkuImport = require('./import');
		var FtpDeploy = require('ftp-deploy');
		var ftpDeploy = new FtpDeploy();
		var config = inkuImport.getFile(__dirname + '/../connect.json');
		config = JSON.parse(config);

		var config = {
		    username: config.user,
		    password: config.password,
		    host: config.ftp,
		    port: 21,
		    localRoot: __dirname + "/../output/",
		    remoteRoot: config.destination,
		    exclude: ['.git', '.idea', 'tmp/*']
		}

		// first, clean existing folder on ftp
		module.exports.prepareFtpFolder(function(){
			// now, copy all output contents to ftp destination
			ftpDeploy.deploy(config, function(err) {
			    if(err){
			    	console.log(err)
			    }else{
			    	console.log('Finished');
			    }
			    if(callback){
			    	callback();
			    }
			    delete ftpDeploy;
			});
		});
	},
	// function that minify and copy stylesheet files to output folder
	compileCSS: function(){
		var CleanCSS = require('clean-css');
		var sass = require('node-sass');
		var fs = require('fs-extra');
		var inkuImport = require('./import');
		var staticPath = __dirname + '/../theme/static/css/'
		var stylesheets = inkuImport.getFiles(staticPath);
		for(var x = 0, l = stylesheets.length; x < l; x++){
			var filePath = staticPath + stylesheets[x];
			var source = inkuImport.getFile(filePath);
			var fileName = stylesheets[x].split('/');
			fileName = fileName[fileName.length - 1];
			var output = __dirname + '/../output/static/css/' + fileName;
			if(fileName.indexOf('.scss') > -1){
				output = output.replace('.scss', '.css');
				sass.render({
					data: source,
					outputStyle: 'compressed'
				}, function(err, result){
					if(!err){
						fs.outputFileSync(output, result.css);
						console.log(output, ' SCSS file parsed and saved!');
					}else{
						console.log("There was an error during scss file parse: ", filePath);
					}
				})
			}else{
				var minified = new CleanCSS().minify(source).styles;
				fs.outputFileSync(output, minified);
				console.log(output, ' stylesheet file saved!');
			}
		}
	},

	// function that minify and copy javascript static files to output folder
	compileJS: function(){
		var uglifyJS = require("uglify-js");
		var fs = require('fs-extra');
		var inkuImport = require('./import');
		var staticPath = __dirname + '/../theme/static/js/'
		var scripts = inkuImport.getFiles(staticPath);
		for(var x = 0, l = scripts.length; x < l; x++){
			var filePath = staticPath + scripts[x];
			var minified = uglifyJS.minify(filePath);
			var fileName = scripts[x].split('/');
			fileName = fileName[fileName.length - 1];
			var output = __dirname + '/../output/static/js/' + fileName;
			fs.outputFileSync(output, minified.code);
			console.log(output, ' js script file saved!');
		}
	},

	// function that compiles static assets from theme folder to output (static/img/ for theme assets or public/ for article assets)
	compileAssets: function(sourceFolderPath, destinationPath){
		var fs = require('fs-extra');
		var inkuImport = require('./import');
		var list = inkuImport.getFiles(sourceFolderPath);
		for(var x = 0, l = list.length; x < l; x++){
			var fileName = list[x].split('/');
			var output = destinationPath + fileName;
			var source = sourceFolderPath + list[x];
			fs.copySync(source, output);
			console.log('Asset file ', output, ' saved!');
		}
	}
};