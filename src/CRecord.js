/**
 * Base record class
 *
 * See {{#crossLink "CRecord/constructor"}}{{/crossLink}} for options list.
 *
 * @class CRecord
 * @constructor
 *
 * @example
 *     table.set_record_class(CRecord, {});
 */

class CRecord {

    /**
     * Create record object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} [options] Column options.
     * @param {Function} options.on_build_record Fuction on_build_record(row_elem, row_data) called on every data row created.
     *
     */

    constructor(table, options = {}) {
        this.table = table;
        this.options = options;
        this.columns = [];
        this.data_index = -1;
        this.parent_column = null;
        this.row = null;

        this.subrecord_row = null;
        this.subrecord_close_handler = null;

        for (var i in this.table.columns_classes) {
            this.columns.push(new this.table.columns_classes[i](this.table, this, this.table.columns_options[i]));
        }
    }

    /**
     * Create table head.
     * @method set_head
     * @param {JQueryNode} thead Container element.
     * @private
     *
     */

    set_head(thead) {
        this.thead = thead;
        this.header_row = $("<tr></tr>").appendTo(this.thead);
        this.options_row = $("<tr></tr>").appendTo(this.thead);
    }

    /**
     * Create table colgroups.
     * @method set_colgroup
     * @param {JQueryNode} colgroup Container element.
     * @private
     *
     */

    set_colgroup(colgroup){
        this.colgroup = colgroup;
    }

    /**
     * Create table foots.
     * @method set_foot
     * @param {JQueryNode} tfoot Container element.
     * @private
     *
     */

    set_foot(tfoot){
        this.tfoot = tfoot;
        this.footer_row = $("<tr></tr>").appendTo(this.tfoot);
    }

    /**
     * Set parent column for record.
     * @method set_parent_column
     * @param {CColumn} column Column.
     *
     */

    set_parent_column(column){
        this.parent_column = column;
    }

    /**
     * Set row container.
     * @method set_row
     * @param {JQueryNode} row Row node.
     *
     */

    set_row(row){
        this.row = row;
    }

    /**
     * Set data index in table.
     * @method set_data_index
     * @param {Int} index Data index in table.
     *
     */

    set_data_index(index){
        this.data_index = index;
    }

    /**
     * Get field from record.
     * @method record_field
     * @param {String} field Field name. If null, return {Object} of all record data.
     *
     */

    record_field(field = null){
        if (field == null){
            return this.table.data[this.data_index];
        }
        return this.table.data[this.data_index][field];
    }

    /**
     * Method to batch operation based on CCheckboxColumn.
     * Always return false if no CCheckboxColumn presents.
     * @method is_selected
     * @return {Boolean}
     *
     */

    is_selected(){
        var result = false;
        this.columns.forEach(function(column) {
            if(typeof(column.is_selected) != 'undefined'){
                result = column.is_selected();
                return;
            }
        });
        return result;
    }

    /**
     * This record is new?.
     * @method record_is_new
     * @return {Boolean}
     *
     */

    record_is_new(){
        return this.data_index == -1;
    }

    /**
     * Build headers for columns.
     * @method build_header
     *
     */

    build_header(){
        for (var i in this.columns){
            if (this.columns[i].visible_column()){
                if (this.columns[i].width() != 0){
                    $('<col style="width: '+this.columns[i].width()+';"></col>').appendTo(this.colgroup);
                } else {
                    $('<col></col>').appendTo(this.colgroup);
                }


                var head_cell = $('<th></th>').appendTo(this.header_row);
                this.columns[i].build_title(head_cell);

                var options_cell = $('<th></th>').appendTo(this.options_row);
                this.columns[i].build_options(options_cell);

            }
        }
    }

    /**
     * Build footers for columns.
     * @method build_header
     *
     */

    build_footer(){
        for (var i in this.columns){
            if (this.columns[i].visible_column()){
                var summary_cell = $('<th></th>').appendTo(this.footer_row);
                this.columns[i].build_summary(summary_cell);
            }
        }
    }

    /**
     * Build table row.
     * @method build_record
     *
     */

    build_record(){
        for (var i in this.columns){
            if (this.columns[i].visible_column()){
                var data_cell = $('<td></td>').appendTo(this.row);
                this.columns[i].build_cell(data_cell);
            }
        }
        if(typeof(this.options.on_build_record) != "undefined"){
            this.options.on_build_record(this.row, this.record_field());
        }
    }

    /**
     * Build editor row.
     * @method build_editor
     *
     */

    build_editor(is_new_record = false){
        for (var i in this.columns){
            if (this.columns[i].visible_column() && this.columns[i].visible_editor()){
                var editor_cell = $('<td></td>').appendTo(this.row);
                this.columns[i].build_editor(editor_cell, is_new_record);
            }
        }

        for (var i in this.columns){
            var col_val = this.columns[i].editor_value();
            for (var j in this.columns){
                this.columns[j].record_changed(col_val[0], col_val[1]);
            }
        }
    }

    /**
     * Create subrecord row.
     * @method open_subrecord
     * @return {JQueryNode} Subrow container element.
     *
     */

    open_subrecord(close_handler){
        if (this.subrecord_row != null){
            this.close_subrecord();
        }
        this.subrecord_row = $('<tr></tr>').insertAfter(this.row);
        this.row.addClass('is-selected');
        this.subrecord_close_handler = close_handler;
        return this.subrecord_row;
    }

    /**
     * Remove subrecord row.
     * @method close_subrecord
     *
     */

    close_subrecord(){
        if (this.subrecord_row != null){
            this.subrecord_row.remove();
            this.subrecord_row = null;
            this.row.removeClass('is-selected');
            if(this.subrecord_close_handler != null)
            {
                this.subrecord_close_handler();
                this.subrecord_close_handler = null;
            }
        }
    }

    /**
     * If changes in any editors callback.
     * @method on_change_in_editor
     * @private
     *
     */

    on_change_in_editor(column_name, value){
        for (var i in this.columns){
            this.columns[i].record_changed(column_name, value);
        }
    }

    /**
     * Get all editors values.
     * @method editor_values
     * @return {Object} Record dictionary or null if validation failed.
     *
     */

    editor_values(){
        var record = {};
        for (var i in this.columns){
            if (!this.columns[i].is_valid()) return null;
            var [column, value] = this.columns[i].editor_value();
            if (column != null){
                record[column] = value;
            }
        }
        return record;
    }

}
 
