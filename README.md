# INKU 

##a static site generator, created with pain, blood, love && Node.js

##Current version

Currently **inku** is in early alpha version, that includes:

- web interface for basic content file management,

- compiling markdown-based content files and pug theme files to static html pages,

- deploying generated static pages via ftp to remote servers.

##First installation

At first, enter the project folder via command line and install all npm dependencies:

```
npm i
```

To run **inku**, simpy use command:

```
node admin/server.js
```

Then go to browser and enter address:

```
localhost:3000
```

And enjoy!

##Web interface

To call the side menu, click the hamburger icon on the left.

To collapse category articles, simply click on the category (e.g. `example-cat`) button.

To add new article to category, click on the `+` button near the category name.

You can add subpages via `add page` button (default theme page will be also created).

To edit content, simply click on item from the list inside side menu.

You can save changes via `ctrl + s` / `cmd + s` shortcut.

You can preview editing file via `ctrl + p` / `cmd + p` shortcut, or by clicking on eye button on the right-bottom part of the screen.

You can insert file via `ctrl + i` / `cmd + i` shortcut, or by drag'n'dropping file into content editor. Images will always be added at the end of the post content. Inserted files will be stored inside `/public` folder (they are copied from origin location).

To compile files to static HTML, press the compile button (cogs icon on the right-bottom part of the screen).

To deploy files to Your ftp server, click on deploy button (cloud icon on the right-bottom part of the screen).

##Deploy configuration

You cant find a example FTP connection configuration in `/connect-example.json` file - fill it with Your login credentials and rename this file to `connect.json` - **inku** will use this configuration while deploying.

##Custom themes

All theme contents should be placed inside `/theme` folder. There is various theme files:

- **INDEX THEME**: `index.pug` - it is the main page theme - it contains all contents from `/source/index.md` file.

- **PAGE THEMES**: files that filename ends with `-page.pug` suffix - it contains all contents from files with same prefix as a name that resides directly under `/source` folder (except `index.md` file).

- **LIST THEMES**: files that filename ends with `-list.pug` suffix - it contains list of files that resides inside folders with same prefix as a name directly under `/source` folder.

- **ARTICLE THEMES**: files that filename ends with `-item.pug` suffix - it contains contents of files that resides inside folder with same prefix as a name under `/source/prefix` folder.

##Contents

All page contents that will be editable from **inku** web interface should be placed inside `/source` folder. All content is saved in markdown syntax.

There are various types of content:

- **INDEX CONTENT** - it is defined in `/source/index.md` file.

- **SUBPAGE CONTENT** - it is defined in files that resides directly inside `/source` folder.

- **ARTICLE CONTENT** - it is defined in files, that resides inside folders in `/source` folder.

##Setting example page

First, we have to define our home page content file (`/source/index.md`) and home page template (`/theme/index.pug`).

Then, if we want on our website some subpages, e.g. `experience` and `about` pages, then You have to create content files for those pages, inside `/source` folders:

- `experience.md`,

- `about.md`

Then, we have to create theme files for those pages, inside `/theme` folder:

- `experience-page.pug`,

- `about-page.pug`

Please, pay attention to file naming - **inku** will match content pages with its theme counterparts.

In addition, if we want to have a blog on our page, where we will add some articles, we have to create a `blog` folder inside `/source` folder.

Every file (markdown) that will be placed inside `/source/blog` folder will be a separate article.

Now, we have to create proper theme files for our blog:

- `/theme/blog-list.pug` - will list all blog entries (files from `/source/blog` folder),

- `/theme/blog-item.pug` - will contain single article content (taken from file from `/source/blog` folder)

Example files are already created inside `/source` and `/theme` folders.

After every page generation, there is also `/output/rss.json` file generated.

If You need any help, feel free to tweet [@theinku](http://twitter.com/theinku) or [@lukaszkups](http://twitter.com/lukaszkups).

##TODO:

- tests, goddamit! :)

- fix file path creation (currently not supporting windows (`\`)),

- add web-based theme editor,

- fix infinite loading icon while compiling files (now it is switched off),

- add RWD to web interface,

- add example search script for generated web page (using `/output/rss.json` file),

- looking forward for pagination solutions for static pages (I would prefer to not base on single `rss.json` file - just in case someone will have billions of articles :) - feel free to suggest anything),

- handle errors that are caused by wrong usage of the tool (missing files/configuration/folders, file upload errors etc.)