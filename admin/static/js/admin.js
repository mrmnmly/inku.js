(function(){
	// clear textarea value
	document.getElementById('md-editor').value = '';

	// function that shows or hide loading icon
	var loading = function(action){
		var div = document.getElementById('loader');
		if(action){
			div.style.display = 'block';
		}else{
			div.style.display = 'none';
		}
	};

	// toggle loading indicator on ajax requests
	$(document).ajaxStart(function(){
		loading(true);
	});
	$(document).ajaxStop(function(){
		loading(false);
	});

	// helper function that checks if user is currently editing document
	function isEditing(){
		return document.getElementById('md-editor').style.display === 'block';
	}

	// helper function that binds click events to each post entry in side menu
	function bindOpenPostEvents(postList){
		for(var x = 0, l = postList.length; x < l; x++){
			postList[x].addEventListener('click', function(e){
				e.stopPropagation();
				var that = this;
				var previewButton = document.getElementById('preview-button');
				var mdEditor = document.getElementById('md-editor');
				var previewEditor = document.getElementById('preview-editor');
				previewButton.classList.remove('glyphicon-eye-close');
				previewButton.classList.add('glyphicon-eye-open');
				mdEditor.style.display = 'block';
				document.getElementById('metadata-wrapper').style.display = 'block';
				previewEditor.style.display = 'none';
				previewEditor.innerHTML = '';
				var cat = e.currentTarget.getAttribute('data-cat');
				var file = e.currentTarget.getAttribute('data-file');
				var fullUrl = e.currentTarget.getAttribute('data-url');
				$.get('/post/' + cat + '/' + file + '/').done(function(resp){
					var meta = resp.metadata;
					var wrapper = document.getElementById('metadata-wrapper');
					wrapper.innerHTML = '';
					if(meta.title){
						for(var key in meta){
							var input = '<label for="meta-' + key + '">' + key + ': </label><input type="text" name="meta-' + key + '" placeholder="' + key + '" value="' + meta[key] + '" title="' + key + '"/>';
							wrapper.innerHTML += input;
						}
					}else{
						var time = moment().format('DD/MM/YYYY');
						// if You want to add own default meta fields in the editor, place it in the DOM string below
						wrapper.innerHTML = '<label for="meta-date">date: </label><input name="meta-date" placeholder="date" value="' + time + '" title="date" type="text"><label for="meta-title">title: </label><input name="meta-title" placeholder="title" title="title" type="text"><label for="meta-category">category: </label><input name="meta-category" placeholder="category" title="category" type="text"><label for="meta-tags">tags: </label><input name="meta-tags" placeholder="tags" title="tags" type="text">';
					}
					
					document.getElementById('md-editor').value = resp.markdown;
					document.getElementById('file-url-helper').value = fullUrl;
					// add active state class to chosen file
					var activeButtons = document.getElementsByClassName('active-list-item');
					for(var y = 0, k = activeButtons.length; y < k; y++){
						activeButtons[y].classList.remove('active-list-item');
					}
					that.classList.add('active-list-item');
					document.getElementById('preview-button').style.display = 'block';
				}).fail(function(resp){
					console.warn(resp);
				});
			});
		}
	}

	// toggle preview / edit mode of the main content editor
	document.getElementById('preview-button').addEventListener('click', function(e){
		e.preventDefault();
		var mdEditor = document.getElementById('md-editor');
		var previewEditor = document.getElementById('preview-editor');
		if(e.currentTarget.classList.contains('glyphicon-eye-open')){
			e.currentTarget.classList.remove('glyphicon-eye-open');
			e.currentTarget.classList.add('glyphicon-eye-close');
			var txt = mdEditor.value;
			$.get('/parse2html/', {
				markdown: txt
			}).done(function(resp){
				mdEditor.style.display = 'none';
				// document.getElementById('metadata-wrapper').style.display = 'none';	//uncomment this line to hide meta section on preview
				previewEditor.innerHTML = resp;
				previewEditor.style.display = 'block';
			}).fail(function(resp){
				console.warn(resp);
			});
		}else{
			e.currentTarget.classList.remove('glyphicon-eye-close');
			e.currentTarget.classList.add('glyphicon-eye-open');
			// document.getElementById('metadata-wrapper').style.display = 'block'; //uncomment this line to hide meta section on preview
			mdEditor.style.display = 'block';
			previewEditor.style.display = 'none';
			previewEditor.innerHTML = '';
		}
	});

	// helper function for image uploading
	function uploadFileHelper(fileObj){
		var reader = new FileReader();
		var filename = fileObj.name;
		reader.onload = function(e){
			var img = reader.result;
			$.get('/save-img/', {
				file: img,
				name: filename
			}).done(function(resp){
				// append uploaded file path to the end of the editor's textarea
				document.getElementById('md-editor').value += resp;
			}).fail(function(resp){
				console.warn(resp);
			});
		}
		reader.readAsDataURL(fileObj);
	}

	// drop file on textarea event
	document.getElementById('md-editor').addEventListener('drop', function(e){
		e.preventDefault();
		var files = e.target.files || e.dataTransfer.files;
		for(var x = 0, l = files.length; x < l; x++){
			uploadFileHelper(files[x]);
		}
	});

	// save document on ctrl + s
	window.addEventListener('keydown', function(e){
		if((e.which == '115' || e.which == '83' ) && (e.ctrlKey || e.metaKey)){
			e.preventDefault();
			var txt = document.getElementById('md-editor').value;
			var fileUrl = document.getElementById('file-url-helper').value;
			// if is true, then it is a subpage element because subpages doesn't have full urls so we have to add it
			if(fileUrl.indexOf('source') < 0){
				fileUrl = document.getElementById('dirname').value + '/../source/' + fileUrl;
			}
			var obj = {};
			var inputs = document.querySelectorAll('#metadata-wrapper input');
			for(var x = 0, l = inputs.length; x < l; x++){
				var name = inputs[x].getAttribute('name').replace('meta-', '');
				var val = inputs[x].value;
				obj[name] = val;
			}
			$.post('/save-file/', {
				content: txt,
				url: fileUrl,
				customs: obj
			}).done(function(resp){
				console.log('document saved!');
			}).fail(function(resp){
				console.warn('there was an error when saving a file: ', resp);
			})
		}
	});

	// add image to blog post on ctrl + i shortcut
	window.addEventListener('keydown', function(e){
		if((e.which == '73') && (e.ctrlKey || e.metaKey) && isEditing()){
			e.preventDefault();
			$('#image-upload-helper').trigger('click');
		}
	});

	// toggle edit/preview mode on ctrl + p shortcut
	window.addEventListener('keydown', function(e){
		if((e.which == '80') && (e.ctrlKey || e.metaKey)){
			e.preventDefault();
			$('#preview-button').trigger('click');
		}
	});

	// event on choose file via ctrl + i shortcut
	document.getElementById('image-upload-helper').addEventListener('change', function(e){
		e.preventDefault();
		if(isEditing()){
			var file = this.files[0];
			uploadFileHelper(file);
		}
	});

	// event focus on first input on edit view via ctrl + 0 shortcut
	window.addEventListener('keydown', function(e){
		if((e.which == '48') && (e.ctrlKey || e.metaKey) && isEditing()){
			e.preventDefault();
			$('#metadata-wrapper input')[0].focus();
		}
	});

	// event that adds example markdown href string via ctrl + h shortcut
	window.addEventListener('keydown', function(e){
		if((e.which == '72') && (e.ctrlKey || e.metaKey) && isEditing()){
			e.preventDefault();
			document.getElementById('md-editor').value += ' [click](http://)';
		}
	});

	// add toggle show/hide event on side menu items
	function addCollapsingSidebarCategories(parentSidebarNodes){
		for(var x = 0, l = parentSidebarNodes.length; x < l; x++){
			parentSidebarNodes[x].addEventListener('click', function(e){
				e.preventDefault();
				var child = this.querySelector('.child-node');
				if(child.classList.contains('collapsed')){
					child.classList.remove('collapsed');
				}else{
					var collapsed = document.querySelector('.child-node.collapsed');
					if(collapsed){
						collapsed.classList.remove('collapsed');
					}
					setTimeout(function(){
						child.classList.add('collapsed');
					}, 0)
				}
			});
		}
	}

	// add toggle show/hide event on template on start
	var parentSidebarNodes = document.getElementsByClassName('parent-node');
	addCollapsingSidebarCategories(parentSidebarNodes);
	

	// helper function that binds click events to 'plus' icon which creates new post / file
	function bindNewPostClickEvent(addItem){
		for(var x = 0, l = addItem.length; x < l; x++){
			addItem[x].addEventListener('click', function(e){
				e.stopPropagation();
				var folder = this.getAttribute('data-url');
				// prepare modal
				document.getElementById('modal-folder-helper').value = folder;
				document.getElementById('new-item-title').value = '';
				$('#new-item-modal').modal('show');
			});
		}
	}
	// helper event to focus on modal input automatically
	$('#new-item-modal').on('shown.bs.modal', function (e){
		e.preventDefault();
		$('#new-item-title').focus();
	});

	// helper function that converts strings to slug
	function slugify(txt){
		return txt.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_').replace(/[^\w-]+/g,'');
	}

	function bindOpenPageEvents(buttons){
		for(var x = 0, l = buttons.length; x < l; x++){
			buttons[x].addEventListener('click', function(e){
				e.preventDefault();
				var that = this;
				var previewButton = document.getElementById('preview-button');
				var mdEditor = document.getElementById('md-editor');
				var previewEditor = document.getElementById('preview-editor');
				previewButton.classList.remove('glyphicon-eye-close');
				previewButton.classList.add('glyphicon-eye-open');
				mdEditor.style.display = 'block';
				document.getElementById('metadata-wrapper').style.display = 'block';
				previewEditor.style.display = 'none';
				previewEditor.innerHTML = '';
				var fullUrl = e.currentTarget.getAttribute('data-url');
				$.get('/page/' + fullUrl + '/').done(function(resp){
					var meta = resp.metadata;
					var wrapper = document.getElementById('metadata-wrapper');
					wrapper.innerHTML = '';
					if(meta.title){
						for(var key in meta){
							var input = '<label for="meta-' + key + '">' + key + ': </label><input type="text" name="meta-' + key + '" placeholder="' + key + '" value="' + meta[key] + '" title="' + key + '"/>';
							wrapper.innerHTML += input;
						}
					}else{
						var time = moment().format('DD/MM/YYYY');
						// if You want to add own default meta fields in the editor, place it in the DOM string below
						wrapper.innerHTML = '<label for="meta-date">date: </label><input name="meta-date" placeholder="date" value="' + time + '" title="date" type="text"><label for="meta-title">title: </label><input name="meta-title" placeholder="title" title="title" type="text"><label for="meta-category">category: </label><input name="meta-category" placeholder="category" title="category" type="text"><label for="meta-tags">tags: </label><input name="meta-tags" placeholder="tags" title="tags" type="text">';
					}
					
					document.getElementById('md-editor').value = resp.markdown;
					document.getElementById('file-url-helper').value = fullUrl;
					// add active state class to chosen file
					var activeButtons = document.getElementsByClassName('active-list-item');
					for(var y = 0, k = activeButtons.length; y < k; y++){
						activeButtons[y].classList.remove('active-list-item');
					}
					that.classList.add('active-list-item');
					document.getElementById('preview-button').style.display = 'block';
				}).fail(function(resp){
					console.warn(resp);
				});
			});
		}
	}

	// function that search for new files and loads them to side menu
	function reloadMenu(){
		$.get('/post-list/').done(function(resp){
			var itemList = document.getElementById('item-list');
			// empty menu DOM
			itemList.innerHTML = '';
			var txt = '';
			for(var key in resp){
				// check if entry is not a page type
				if(resp[key] && !resp[key].title){
					// add category wrapper
					var entry = resp[key];
					txt += '<li class="parent-node" data-url="' + key + '">';
					txt += '<div>' + key + '<span class="add-item glyphicon glyphicon-plus pull-right" data-url="' + key + '" title="Add new file here" data-toggle="modal" data-target="#new-item-modal"></span></div>';
					txt += '<ul class="child-node">';
					// add child posts
					for(var x = 0, l = entry.length; x < l; x++){
						txt += '<li class="file-list-item" data-cat="' + entry[x].category + '" data-file="' + entry[x].file + '" data-url="' + entry[x].path + '">' + entry[x].file + '</li>';
					}
					txt += '</ul></li>';
				}else{
					// add separate page button on list
					var entry = resp[key];
					txt += '<li class="page-node" data-url="' + entry.title + '"><div>' + entry.title + '</div></li>';
				}
			}
			itemList.innerHTML = txt;

			// re-binding click events

			setTimeout(function(){
				// re-bind click events to every post item in the side menu
				var postList = document.getElementsByClassName('file-list-item');
				bindOpenPostEvents(postList);

				// re-bind click events to a new item button in current category (new file)
				var addItem = document.getElementsByClassName('add-item');
				bindNewPostClickEvent(addItem);

				// re-bind click events to every separate page button in the side menu
				var pageButtons = document.getElementsByClassName('page-node');
				bindOpenPageEvents(pageButtons);

				// hide modal
				$('#new-item-modal').modal('hide');

				// re-bind toggle show/hide event on template on start
				var parentSidebarNodes = document.getElementsByClassName('parent-node');
				addCollapsingSidebarCategories(parentSidebarNodes);
			}, 0);
			
		}).fail(function(resp){
			console.warn('there was an error when fetching files: ', resp)
		});
	}

	// submit new file modal form (with filename)
	document.getElementById('save-new-item').addEventListener('click', function(e){
		e.preventDefault();
		var fileName = document.getElementById('new-item-title').value;
		var folder = document.getElementById('modal-folder-helper').value;
		var counter = moment().format('YYYYMMDDhmmss'); // timestamp in the front of the filename
		var fileSlug = slugify(fileName);
		var finalFilename = counter + '_' + fileSlug + '.md';
		var dirname = document.getElementById('dirname').value;
		var fileUrl = dirname + '/../source/' + folder + '/' + finalFilename;
		var time = moment().format('DD/MM/YYYY');
		// add default meta
		var obj = {
			date: time,
			title: fileName,
			category: '',
			tags: ''
		}
		if(fileSlug.length){
			$.post('/save-file/', {
				content: '',
				url: fileUrl,
				customs: obj
			}).done(function(resp){
				console.log('document saved!');
				reloadMenu();
			}).fail(function(resp){
				console.warn('there was an error when saving a file: ', resp);
			});
		}else{
			alert('Please enter new post title');
		}
	});

	// add new page modal events

	// bind show modal on button click event
	document.getElementById('add-page-button').addEventListener('click', function(e){
		e.preventDefault();
		// prepare modal
		document.getElementById('new-page-title').value = '';
		$('#new-page-modal').modal('show');
	});

	// helper event to focus on modal input automatically
	$('#new-page-modal').on('shown.bs.modal', function (e){
		e.preventDefault();
		$('#new-page-title').focus();
	});

	// add new page modal submit event
	document.getElementById('save-new-page').addEventListener('click', function(e){
		e.preventDefault();
		var title = document.getElementById('new-page-title').value;
		var slug = slugify(title);
		var time = moment().format('DD/MM/YYYY');
		var dirname = document.getElementById('dirname').value;
		var filename = slug + '.md';
		var fileUrl = dirname + '/../source/' + filename;

		// helper function to avoid ugly code that saves source content file inside /source folder
		function saveContentFile(fileUrl, time, title, callback){
			$.post('/save-file/', {
				content: '',
				url: fileUrl,
				customs: {
					date: time,
					title: title,
					category: '',
					tags: ''
				}
			}).done(function(resp){
				console.log('New page has been saved!');
				if(callback){
					callback();
				}else{
					reloadMenu();
				}
			}).fail(function(resp){
				console.warn('there was an error when saving a file: ', resp);
			});
		}
		// helper function to avoid ugly code that saves template file inside /theme folder
		function saveTemplateFile(fileUrl, content, title, callback){
			$.post('/save-file/', {
				content: content,
				title: title,
				url: fileUrl
			}).done(function(resp){
				console.log('New template has been saved!');
				if(callback){
					callback();
				}else{
					reloadMenu();
				}
			}).fail(function(resp){
				console.warn('there was an error when saving a file: ', resp);
			});
		}
		if(title && title.length && slug && slug.length){
			saveContentFile(fileUrl, time, title, function(){
				var defaultTemplateContent = 'html(lang="en")\n\thead\n\tbody\n\t\th1(class="post-title")\n\t\t\t| #{metadata.title}\n\t\tdiv(class="clear clear20")\n\t\tarticle\n\t\t\t| !{html}';
				var templateFilePath = dirname + '/../theme/' + slug + '-page.pug';
				saveTemplateFile(templateFilePath, defaultTemplateContent, title, function(){
					$('#new-page-modal').modal('hide');
					reloadMenu();
				});
			});
		}else{
			alert('Please enter new page title');
		}
	});


	// bind all mouse events

	// adds click events to every post item in the side menu
	var postList = document.getElementsByClassName('file-list-item');
	bindOpenPostEvents(postList);

	// adds click events to a new item button in current category (new file)
	var addItem = document.getElementsByClassName('add-item');
	bindNewPostClickEvent(addItem);

	// adds click events to every separate page in the side menu
	var pageButtons = document.getElementsByClassName('page-node');
	bindOpenPageEvents(pageButtons);


	// compile all content
	document.getElementById('compile-button').addEventListener('click', function(e){
		e.preventDefault();
		$.get('/compile-all/').done(function(resp){
			console.log('everything compiled');
			loading(false);
		}).fail(function(resp){
			console.warn('There was an error while compiling content: ', resp);
		});
		loading(false);
	});

	// deploy via ftp
	document.getElementById('deploy-button').addEventListener('click', function(e){
		e.preventDefault();
		$.get('/deploy/').done(function(resp){

		}).fail(function(resp){
			console.warn(resp.responseText);
		});
	});

	// toggle sidebar / side menu button
	document.getElementById('main-menu-button').addEventListener('click', function(e){
		e.preventDefault();
		var menu = document.getElementById('sidebar');
		menu.classList.toggle('opened');
		this.classList.toggle('opened');
	});

	//init tooltips
	$('[data-toggle="tooltip"]').tooltip({
		placement: 'top'
	});

	// init nicescroll
	$("#main-container").niceScroll({cursorwidth: '10px', autohidemode: true, zindex: 98 });
})();