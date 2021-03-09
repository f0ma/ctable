/**
 * Show subtable button column
 *
 * See {{#crossLink "CSubtableColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CSubtableColumn
 * @constructor
 * @extends CColumn
 *
 * @example
 *     parent_table.add_column_class(CSubtableColumn, {title:'Ext',
 *     table: function(record){
 *
 *            var child_table = new CTable({endpoint: "/call.php"});
 *
 *            child_table.set_record_class(CAdaptiveRecord);
 *            child_table.add_column_class(CColumn,{column:'id', title:'ID', visible_editor:false});
 *            child_table.add_column_class(CSelectColumn, {column:'name', title: 'Name', load:'person_id', endpoint:'/person.php'});
 *            child_table.add_column_class(CCommandColumn,{});
 *            child_table.set_filter('person_id', record.record_field('id'));
 *            child_table.add_predefined_field('person_id', record.record_field('id'));
 *
 *            return child_table;
 *      }});
 */

class CSubtableColumn extends CColumn {

    /**
     * Create column object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} record Parent CRecord object.
     * @param {Object} options Column options:
     * @param {Function} options.table Function(record) returns new `CTable` object.
     * @param {int} [options.width] Column width in percents.
     *
     */

    constructor(table, record, options = {}) {
        super(table, record, options);

        this.show_subtable_button = null;
        this.hide_subtable_button = null;
        this.subtable_row = null;
        this.subtable_cell = null;
        this.subtable = null;
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

    /**
     * Build cell part of column.
     * @method build_cell
     * @param {JQueryNode} elem Container element.
     *
     */

    build_cell(elem){
        this.cell_elem = elem;
        this.show_subtable_button = $('<a class="button is-info is-outlined" title="'+this.table.lang.expand_tooltip+'"><span class="icon is-small"><i class="far fa-caret-square-down"></i></span></a>').appendTo(this.cell_elem).click($.proxy(this.open_subtable, this));
        this.hide_subtable_button = $('<a class="button is-info" style="display:none;"><span class="icon is-small"><i class="far fa-minus-square"></i></span></a>').appendTo(this.cell_elem).click($.proxy(this.close_subtable, this));
    }

    /**
     * Show subtable button handler.
     * @method show_subtable
     * @private
     *
     */

    open_subtable(){
        this.show_subtable_button.hide();
        this.hide_subtable_button.show();
        var subtable_row = this.record.open_subrecord($.proxy(this.close_subtable, this));
        this.subtable_cell = $('<td class="ctable-container-1" colspan="'+this.table.visible_columns()+'"></td>').appendTo(subtable_row);
        this.subtable = this.options.table(this.record);
        this.subtable.build_table(this.subtable_cell);
        this.subtable.select();
    }

    /**
     * Hide subtable button handler.
     * @method hide_subtable
     * @private
     *
     */

    close_subtable(){
        this.record.close_subrecord();
        this.subtable = null;
        this.show_subtable_button.show();
        this.hide_subtable_button.hide();
    }

}

 
