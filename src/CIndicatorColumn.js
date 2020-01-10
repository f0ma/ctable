/**
 * Indication column (show status based on custom function call result)
 *
 * See {{#crossLink "CIndicatorColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CIndicatorColumn
 * @constructor
 * @extends CCustomColumn
 *
 * @example
 *     table.add_column_class(CIndicatorColumn,{informer: function(record, column){} });
 */


class CIndicatorColumn extends CCustomColumn {

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

        options.html = function(self, record, column_name){
            var state = self.options.informer(record, column_name);
            if (state == "" || state == "none"){
                return '';
            }
            if (state == "primary"){
                return '<a class="button is-primary is-outlined"><i class="fas fa-circle"></i></a>';
            }
            if (state == "info"){
                return '<a class="button is-info is-outlined"><i class="fas fa-info-circle"></i></a>';
            }
            if (state == "success" || state == "ok"){
                return '<a class="button is-success is-outlined"><i class="fas fa-check-circle"></i></a>';
            }
            if (state == "warning"){
                return '<a class="button is-warning is-outlined"><i class="fas fa-exclamation-circle"></i></a>';
            }
            if (state == "danger" || state == "error"){
                return '<a class="button is-danger is-outlined"><i class="fas fa-times-circle"></i></a>';
            }
        }
    }
}
