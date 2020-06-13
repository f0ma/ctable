/**
 * Export table action constructor.
 * Requries FileSaver.js and tableexport.js
 *
 * @example
 *     table.add_column_class(CCommandColumn,{common_actions: [CExportTableAction(t, 'csv', 'table')]});
 *
 */

/**
 * Build export table action.
 * @method CExportTableAction
 * @param {CTable} table Table object.
 * @param {String} format File format (csv, txt or xlsx).
 * @param {String} filename Name of downloaded file (without extention).
 * @return {Object} Object for add to actions list.
 *
 */

function CExportTableAction (table, format, filename) {
    TableExport.prototype.ignoreCSS = ".tableexport-ignore";

    return {
    fa_class: 'fas fa-file-export',
    action: function (record){
        record.table.table.find('thead tr:eq(1) th').addClass('tableexport-ignore');
        record.table.table.find('tbody tr td dl dt').addClass('tableexport-ignore');

        var table = TableExport(record.table.table, {exportButtons: false, footers: false, formats:[format]});
        var exportData = table.getExportData();
        var csvData = exportData['tableexport-1'][format];
        table.export2file(csvData.data, csvData.mimeType, filename, csvData.fileExtension, csvData.merges, csvData.RTL, csvData.sheetname);
    },
    tooltip: table.lang.export
}};
