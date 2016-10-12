# INKU 

##a static site generator, created with pain, blood, love && Node.js

To run INKU, simpy use command:

```
node admin/server.js
```

Then go to browser and enter address:

```
localhost:3000
```

And enjoy!

##First installation

At first, enter the project folder via command line and install all npm dependencies:

```
npm i
```

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

Please, pay attention to file naming - `inku` will match content pages with its theme counterparts.

In addition, if we want to have a blog on our page, where we will add some articles, we have to create a `blog` folder inside `/source` folder.

Every file (markdown) that will be placed inside `/source/blog` folder will be a separate article.

Now, we have to create proper theme files for our blog:

- `/theme/blog-list.pug` - will list all blog entries (files from `/source/blog` folder),

- `/theme/blog-item.pug` - will contain single article content (taken from file from `/source/blog` folder)

Example files are already created inside `/source` and `/theme` folders.

If You need any help, feel free to tweet [@theinku](http://twitter.com/theinku) or [@lukaszkups](http://twitter.com/lukaszkups).