# ctable

CTable is a JS library to make CRUD (CReate, Update, Delete) web tables. 

## Features

* Modern browsers support (ES6 Javascript and [jQuery](http://jquery.com))
* Asynchronous (AJAX based)
* Server technology agnostic
* Server-side sorting and pagination
* Sub-table support 
* Easily extends by column class inheritance
* Good looking and mobile-ready with [Bulma CSS](http://bulma.io) and [Font Awesome](https://fontawesome.com/) icons

## Documentation

See documentation in https://f0ma.github.io/ctable/index.html directory (made with [YUIDoc](https://yui.github.io/yuidoc/)).

## Quick start

Add to page header:

```html
<script type="text/javascript" src="query/jquery.min.js"></script>
<script type="text/javascript" src="ctable/ctable.js"></script>
<link rel="stylesheet" href="css/bulma.min.css">
<link rel="stylesheet" href="fa/css/all.min.css">
```

After document ready:

```javascript
var t = new CTable({endpoint: "/demo.php"});
t.set_record_class(CDivEditorRecord);

t.add_column_class(CColumn,{column:'id',
                            title:'ID',
                            visible_editor:false,
                            visible_column:false});

t.add_column_class(CTextDataColumn,{column:'firstname',
                                    title:'Firstname',
                                    validate:"\\S+"});

t.add_column_class(CTextDataColumn,{column:'lastname',
                                    title:'Lastname',
                                    validate:"\\S+"});

t.add_column_class(CSelectColumn,{column:'sex',
                                  title:'Sex',
                                  options:[['m','М'], ['f':'F']],
                                  validate: true});

t.add_column_class(CCommandColumn,{});

t.set_pagination_class(CPagination,{});

t.build_table($('#mainbox')); // Set table container

t.select();
```
