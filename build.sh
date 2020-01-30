#!/bin/sh

cat src/ctable.stub.js src/renderers.js src/CColumn.js src/CTextColumn.js src/CDateTimePickerColumn.js src/CSelectColumn.js src/CSelect2Column.js src/CCommandColumn.js src/CCustomColumn.js src/CIndicatorColumn.js src/CCheckboxColumn.js src/CFileUploadColumn.js src/CSubtableColumn.js src/CRecord.js src/CAdaptiveRecord.js src/CPagination.js src/CTable.js > ctable/ctable.js

cp ctable/ctable.css demo/ctable.css
cp ctable/ctable.js demo/ctable.js

#npm install uglify-es -g

uglifyjs ctable/ctable.js -o ctable/ctable.min.js
