/**
 * Column for batch row selector
 *
 * See {{#crossLink "CCheckboxColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CCheckboxColumn
 * @constructor
 * @extends CColumn
 *
 * @example
 *     table.add_column_class(CCheckboxColumn);
 */


class CCheckboxColumn extends CColumn {

    /**
     * Create column object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} record Parent CRecord object.
     * @param {Object} options Column options:
     * @param {int} [options.width] Column width in percents.
     */

    constructor(table, record, options = {}) {
        super(table, record, options);
        this.checkbox_row = null;
        this.checkbox_head = null;
    }

    /**
     * This row is selected?
     * @method is_selected
     * @return {Boolean}
     *
     */

    is_selected(){
        return this.checkbox_row.prop('checked');
    }

    /**
     * Build cell part of column.
     * @method build_cell
     * @param {JQueryNode} elem Container element.
     *
     */

    build_cell(elem){
        super.build_cell(elem);
        elem.html('<label class="checkbox"><input type="checkbox" class="checkbox-column-sel"></label>');
        this.checkbox_row = elem.find('input');
    }

    /**
     * Build options part of column.
     * @method build_cell
     * @param {JQueryNode} elem Container element.
     *
     */

    build_options(elem){
        super.build_options(elem);
        elem.html('<label class="checkbox" title="'+this.table.lang.select_all_tooltip+'"><input type="checkbox"></label>');
        this.checkbox_head = elem.find('input');
        this.checkbox_head.change(function() {
            $('.checkbox-column-sel').prop('checked', this.checked);
        });
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

 
