# ctable

CTable is a JS library to make CRUD (CReate, Update, Delete) web tables.

Current status: technology preview for version 3.

## Features

* Reactive design ([preact](https://preactjs.com/))
* Asynchronous and server technology agnostic (JSON-RPC based)
* Editing multiple records at ones
* Multilanguage (currently English and Russian)
* Mobile-first with [Bulma CSS](http://bulma.io) and [Material Design Icons](https://github.com/google/material-design-icons)

## Documentation

See documentation in [ctable at github.io](https://f0ma.github.io/ctable/index.html) (made with [jsdoc](https://jsdoc.app/)) or in docs directory.

## Demo

To start demo with php backend:

* `git clone ...`
* `cd ctable`
* `npm i -D`
* `npm run build`
* `npm run mkdemo`
* `cd demo`
* `php -S 0.0.0.0:9000 `

## i18n

### Requried tools (gettext package):

* `xgettext`
* `msginit`
* `msgmerge`

### Adding new translation:

* `npm run mkpo`
* `cd lang`
* `msginit -l [locale] -o [langfile].po -i ctable.pot --no-translator`
* add new language to `package.json`
