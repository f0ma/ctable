/**
 * Export table action constructor.
 * Requries FileSaver.js and tableexport.js
 *
 * @example
 *     table.add_column_class(CCommandColumn,{common_actions: [CExportTableAction(t, 'CSV', 'table')]});
 *
 */

/**
 * Build export table action.
 * @method CExportTableAction
 * @param {CTable} table Table object.
 * @param {String} format File format (JSON, CSV or TXT).
 * @param {String} filename Name of downloaded file (with extention).
 * @return {Object} Object for add to actions list.
 *
 */

function CExportTableAction (table, format, filename, header = {}) {

    return {
    symbol: '↧',
    action: function (record){
        record.table.download(format, filename, header);
    },
    tooltip: table.lang.export
}};
