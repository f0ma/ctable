# ctable

CTable is a JS library to make CRUD (CReate, Update, Delete) web tables.

## Features

* Reactive design ([preact](https://preactjs.com/))
* Asynchronous and server technology agnostic (JSON-RPC based)
* Multilanguage (currently English and Russian)
* Good looking and mobile-ready with [Bulma CSS](http://bulma.io) and [Material Design Icons](https://github.com/google/material-design-icons)

## Documentation

See documentation in [ctable at github.io](https://f0ma.github.io/ctable/index.html) (made with [jsdoc](https://jsdoc.app/)) or in docs directory.

## i18n tools

* xgettext
* msginit
* msgmerge

### Adding new translation:

msginit -l ru_RU.UTF8 -o ru.po -i ctable.pot --no-translator
