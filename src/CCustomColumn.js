/**
 * Custom js column with content returned by function
 *
 * See {{#crossLink "CCustomColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CCustomColumn
 * @constructor
 * @extends CColumn
 *
 * @example
 *     table.add_column_class(CCustomColumn,{ text: function(record, column){return "OK!";} });
 */


class CCustomColumn extends CColumn {

    /**
     * Create column object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} record Parent CRecord object.
     * @param {Object} options Column options:
     * @param {int} [options.width] Column width in percents.
     * @param {Function} [options.text] function(column, record, column_name) which returns text (alternative).
     * @param {Function} [options.html] function(column, record, column_name) which returns html (alternative).
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
        if (typeof(this.options.text) != "undefined"){
            elem.text(this.options.text(this, this.record, this.options.column));
            return;
        }
        if (typeof(this.options.html) != "undefined"){
            elem.html(this.options.html(this, this.record, this.options.column));
            return;
        }
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
 
