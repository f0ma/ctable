function TextRender(elem, record, column){
    elem.text(record.record_field(column));
}

function HTMLRender(elem, record, column){
    elem.html(record.record_field(column));
}

function EmptyRender(elem, record, column){
} 
