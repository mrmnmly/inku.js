// use express
var express = require('express');
// declare main app variable
var app = express();
// use inku import lib
var inkuImport = require('./import');
// use inku export lib
var inkuExport = require('./export');
// use Wanton Markdown lib
var wmd = require("wmd");
// use fs lib
var fs = require('fs');
// use body-parser lib
var bodyParser = require('body-parser');

// support json encoded bodies
app.use(bodyParser.json()); 

// support encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// set view engine
app.set('view engine', 'pug');

//set path to views folder
app.set('views', __dirname);
// set fonts folder path
app.use('/fonts', express.static(__dirname + '/static/fonts'));
// set stylesheets folder path
app.use('/css', express.static(__dirname + '/static/css'));
// set scripts folder path
app.use('/js', express.static(__dirname + '/static/js'));
// set css image path
app.use('/img', express.static(__dirname + '/static/img'));
// set image assets path
app.use('/public', express.static(__dirname + '/../public'));
// set preview url to see generated content
app.use('/preview', express.static(__dirname + '/../output'));

// home route
app.get('/', function(req, res){
	var fileList = inkuImport.getFileList();
	res.render('index', { fileList: fileList, dirname: __dirname });
});

// get list of all files
app.get('/post-list/', function(req, res){
	var fileList = inkuImport.getFileList();
	res.send(fileList);
});

// get single file contents
app.get('/post/:catname/:filename', function(req, res){
	var url = __dirname + '/../source/' + req.params.catname + '/' + req.params.filename;
	var file = inkuImport.getFile(url);
	var md = wmd(file);
	res.send(md);
});

// get single file (separate page, not category entry) contents
app.get('/page/:filename', function(req, res){
	var url = __dirname + '/../source/' + req.params.filename;
	var file = inkuImport.getFile(url);
	var md = wmd(file);
	res.send(md);
});

// parse markdown to html
app.get('/parse2html/', function(req, res){
	var txt = req.query.markdown;
	txt = wmd(txt);
	res.send(txt.html);
});

// save image to public folder, append timestamp to name, return url to file
app.get('/save-img/', function(req, res){
	var img = req.query.file;
	var file = inkuImport.decodeBase64Image(img);
	var name = req.query.name;
	var filename = Number(new Date()) + '-' + name;
	fs.writeFile(__dirname + '/../public/' + filename, file.data, 'base64', function(err){
		if(err){
			console.warn(err);
		}else{
			var safePath = encodeURIComponent(filename.trim());
			var href = ' ![' + name + '](/public/' + safePath + ')';
			res.send(href);
		}
	});
});

// save currently edited file
app.post('/save-file/', function(req, res){
	var content = req.body.content;
	var fileUrl = req.body.url;
	var customs = req.body.customs;
	var txt = '';
	for(var key in customs){
		txt += key + ': ' + customs[key] + '\n';
	}
	txt += '\n' + content;
	fs.writeFile(fileUrl, txt, function(err){
		if(err){
			console.warn(err);
		}
		console.log('file saved!');
		res.send('file saved');
	});
});

app.post('/save-template/', function(req, res){
	var content = req.body.content;
	var title = req.body.title;
	fs.writeFile(title, content, function(err){
		if(err){
			console.warn(err);
		}
		console.log('template saved!');
		res.send('template saved');
	});
})

// compile content to static site (located in /output folder in root directory)
app.get('/compile-all/', function(req, res){
	inkuExport.compileEverything();
});

app.post('/compile-list/', function(req, res){
	var list = req.body.list;
	var listName = req.body.name;
	var viewName = listName.replace('.pug', '');
	var postsList = [];
	for(var x = 0, l = list.length; x < l; x++){
		var path = '/' + viewName + '/' + inkuExport.slugify(list[x]) + '/';
		postsList.push(obj);
		res.send('List compiled!');
	}
});

// server-side variable that prevents user to send multiple ftp uploads
var ftpInProgress = false;
// deploy static files via ftp to remote server
app.get('/deploy/', function(req, res){
	if(!ftpInProgress){
		ftpInProgress = true;
		inkuExport.deployViaFtp(function(){
			ftpInProgress = false;
			res.send('Updated');
		});
	}else{
		res.status(500).send('There is a ftp upload action in progress');
	}
});

// server start
app.listen(3000);