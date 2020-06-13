/**
 * CMultiColumn for key-value style view and search
 *
 * See {{#crossLink "CMultiColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CMultiColumn
 * @constructor
 * @extends CColumn
 *
 * @example
 *     table.add_column_class(CMultiColumn,{ columns:['fname', 'lname'], labels:['First Name', 'Last Name'] });
 */


class CMultiColumn extends CColumn {

    /**
     * Create column object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} record Parent CRecord object.
     * @param {Object} options Column options:
     * @param {int} [options.width] Column width in percents.
     * @param {List} [options.columns] List of record field.
     * @param {List} [options.labels] List of labels.
     * @param {Boolean} [options.no_search] Disable search field by this column.
     * @param {List} [options.search_columns] List of columns used for search (all columns if empty).
     * @param {int} [options.labels_width] Label width.
     */

    constructor(table, record, options = {}) {
        super(table, record, options);
    }

    /**
     * Build cell part of column.
     * @method build_cell
     * @param {JQueryNode} elem Container element.
     *
     */

    build_cell(elem){
        super.build_cell(elem);

        var dt_style = '';
        if(typeof(this.options.labels_width) != "undefined"){
            dt_style = ' style="width:'+this.options.labels_width+';" ';
        }

        var text = '';
        for (var i in this.options.columns){
            text += '<dt'+dt_style+'> ' + this.options.labels[i] + ': </dt><dd>' + this.record.record_field(this.options.columns[i]) + '</dd>';
        }

        elem.html('<dl>' + text + '</dl>');
    }

    /**
     * Build options part of column with search input.
     * @method build_options
     * @param {JQueryNode} elem Container element.
     *
     */

    build_options(elem){
        this.options_elem = elem;

        if(typeof(this.options.no_search) == "undefined" || !this.options.no_search){
            this.search_field = $('<input class="input" type="search"></input>').appendTo(this.options_elem);
            this.search_field.change($.proxy(this.set_search_filter, this));
        }
    }

    /**
     * Search input change handler.
     * @method set_search_filter
     * @private
     *
     */

    set_search_filter(){
        if(typeof(this.options.search_columns) == "undefined"){
            this.table.set_search(this.options.columns.join('+'), this.search_field.val());
        } else {
            this.table.set_search(this.options.search_columns.join('+'), this.search_field.val());
        }
        this.table.select();
    }

    /**
     * Column is visible?.
     * @method visible_column
     * @return {Boolean} Always true
     *
     */

    visible_column(){
        return true;
    }

    /**
     * Editor is visible?.
     * @method visible_editor
     * @return {Boolean} Always false
     *
     */

    visible_editor(){
        return false;
    }
}
 
