# ctable

CTable is a JS library to make CRUD (CReate, Update, Delete) web tables. 

[Demo](http://geochemland.ru/ctable/demo.html)

## Features

* Object oriented design (ES6 Classes and promises, [jQuery](http://jquery.com))
* Asynchronous (AJAX based)
* Server technology agnostic (JSON based communications)
* Server-side sorting and pagination
* Sub-table support
* Multilanguage (currently English and Russian)
* Easily extends by column class inheritance
* Good looking and mobile-ready with [Bulma CSS](http://bulma.io), [Font Awesome](https://fontawesome.com/) icons and [loading.io](https://loading.io/css/) CSS loader
* Integration with [Select2](https://select2.org/) and [DateTimePicker jQuery plugin](https://xdsoft.net/jqplugins/datetimepicker/)

## Documentation

See documentation in [ctable at github.io](https://f0ma.github.io/ctable/index.html) (made with [YUIDoc](https://yui.github.io/yuidoc/)) or in docs directory.

## Quick start

Add to page header:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.min.css"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/css/all.min.css"/>
<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<link rel="stylesheet" href="ctable.css"/>
<script src="ctable.js"></script>
```

After document ready:

```javascript
var t = new CTable({endpoint: "/endpoint.php"});

t.set_record_class(CAdaptiveRecord);

t.add_column_class(CColumn,{column:'id',
                            title:'ID',
                            visible_editor:false,
                            visible_column:true});

t.add_column_class(CTextColumn,{column:'firstname',
                                    title:'Firstname',
                                    validate:"\\S+"});

t.add_column_class(CTextColumn,{column:'lastname',
                                    title:'Lastname',
                                    validate:"\\S+"});

t.add_column_class(CCommandColumn,{});

t.set_pagination_class(CPagination,{});

t.build_table($('#mainbox')); // Setting table container

t.select(); // Getting data
```
