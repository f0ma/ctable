/**
 * Indication column (show status based on custom function call result)
 *
 * See {{#crossLink "CIndicatorColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CIndicatorColumn
 * @constructor
 * @extends CColumn
 *
 * @example
 *     table.add_column_class(CIndicatorColumn,{informer: function(record, column){} });
 */


class CIndicatorColumn extends CColumn {

    /**
     * Create column object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} record Parent CRecord object.
     * @param {Object} options Column options:
     * @param {int} [options.width] Column width in percents.
     * @param {Function} [options.informer] function(record, column) returns one from "" or "none", "primary", "info", "success", "warning", "danger".
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
        if (typeof(this.options.informer) != "undefined"){
            var state = this.options.informer(this.record, this.options.column);
            if (state == "" || state == "none"){
                elem.html('');
                return;
            }
            if (state == "primary"){
                elem.html('<a class="button is-primary is-outlined"><i class="fas fa-circle"></i></a>');
                return;
            }
            if (state == "info"){
                elem.html('<a class="button is-info is-outlined"><i class="fas fa-info-circle"></i></a>');
                return;
            }
            if (state == "success" || state == "ok"){
                elem.html('<a class="button is-success is-outlined"><i class="fas fa-check-circle"></i></a>');
                return;
            }
            if (state == "warning"){
                elem.html('<a class="button is-warning is-outlined"><i class="fas fa-exclamation-circle"></i></a>');
                return;
            }
            if (state == "danger" || state == "error"){
                elem.html('<a class="button is-danger is-outlined"><i class="fas fa-times-circle"></i></a>');
                return;
            }
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
 
