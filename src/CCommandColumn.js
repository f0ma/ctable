/**
 * Command control column (add, edit, delete buttons)
 *
 * See {{#crossLink "CCommandColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CCommandColumn
 * @constructor
 * @extends CColumn
 *
 * @example
 *     table.add_column_class(CCommandColumn,{no_add: true});
 */

class CCommandColumn extends CColumn {

    /**
     * Create column object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} record Parent CRecord object.
     * @param {Object} options Column options:
     * @param {int} [options.width] Column width in percents.
     * @param {Boolean} [options.no_add] No add button.
     * @param {Boolean} [options.no_edit] No edit button.
     * @param {Boolean} [options.no_commit] Show editor without save button.
     * @param {Boolean} [options.no_delete] No delete button.
     * @param {Boolean} [options.no_cancel] No cancel button in editor mode.
     * @param {Array} [options.item_actions] Additional actions list.
     * @param {String} [options.item_actions[].button_class] Bulma buttom class.
     * @param {String} [options.item_actions[].symbol] Button symbol.
     * @param {String} [options.item_actions[].tooltip] Button tooltip
     * @param {Function} [options.item_actions[].action] function(record) Click handler.
     * @param {Array} [options.common_actions] Additional actions list.
     * @param {String} [options.common_actions[].button_class] Bulma buttom class.
     * @param {String} [options.common_actions[].symbol] Button symbol.
     * @param {String} [options.common_actions[].tooltip] Button tooltip
     * @param {Function} [options.common_actions[].action] function(record) Click handler.
     */

    constructor(table, record, options = {}) {
        super(table, record, options);

        this.new_record = null;
        this.edit_record = null;

        this.show_editor_button = null;

        this.new_record_button = null;
    }

    /**
     * Show record editor toggle handler for new record.
     * @method build_new_record_editor
     * @private
     *
     */

    build_new_record_editor(){
        if (this.new_record !== null){
            this.new_record.row.remove();
            this.new_record = null;
            if(this.new_record_button !== null){
                this.new_record_button.children('a').addClass('is-outlined');
            }
        } else {
            this.new_record = new this.table.record_class(this.table, this.record_options);
            var editor_row = $('<tr></tr>').prependTo(this.table.tbody);
            this.new_record.set_row(editor_row);
            this.new_record.set_data_index(this.record.data_index);
            this.new_record.set_parent_column(this);
            this.new_record.build_editor(true);
            if(this.new_record_button !== null){
                this.new_record_button.children('a').removeClass('is-outlined');
            }
        }
    }

    /**
     * Build title part of column.
     * @method build_title
     * @param {JQueryNode} elem Container element.
     *
     */

    build_title(elem){
        this.title_elem = elem;

        var buttons_div = $('<div class="field has-addons" style="justify-content: right;"></div>').appendTo(this.title_elem);

        if(typeof(this.options.no_add) == "undefined" || this.options.no_add == false){
            this.new_record_button = $('<p class="control"><a class="button is-info is-outlined" title="'+this.table.lang.add_tooltip+'"><span class="icon is-small"><span class="unicode-icon">⊕</span></span></a></p>').appendTo(buttons_div).click($.proxy(this.build_new_record_editor, this));
        }

        if(typeof(this.options.no_refresh) == "undefined" || this.options.no_refresh == false){
            $('<p class="control"><a class="button is-info is-outlined" title="'+this.table.lang.reload_tooltip+'"><span class="icon is-small"><span class="unicode-icon">↻</span></span></a></p>').appendTo(buttons_div).click($.proxy(this.refresh_table, this));
        }

        if(typeof(this.options.common_actions) != "undefined"){
            for (var i in this.options.common_actions){
                var bstyle = 'is-info is-outlined';
                var symbol = '○';
                if (typeof(this.options.common_actions[i].button_class) != "undefined"){
                    bstyle = this.options.common_actions[i].button_class;
                }
                if (typeof(this.options.common_actions[i].symbol) != "undefined"){
                    symbol = this.options.common_actions[i].symbol;
                }

                 $('<p class="control"><a class="button '+bstyle+'" title="'+this.options.common_actions[i].tooltip+'"><span class="icon is-small"><span class="unicode-icon">'+symbol+'</span></span></a></p>').appendTo(buttons_div).click($.proxy(function(i){this.options.common_actions[i].action(this.record)}, this,i));
            }
        }
    }

    /**
     * Open editor button handler.
     * @method open_edit_record_editor(
     * @private
     *
     */

    open_edit_record_editor(){
        this.show_editor_button.children('a').removeClass('is-outlined');
        this.show_editor_button.off('click');
        this.show_editor_button.click($.proxy(this.close_edit_record_editor, this));
        this.edit_record = new this.table.record_class(this.table, this.record_options);
        var editor_row = this.record.open_subrecord($.proxy(this.close_editor, this));
        this.edit_record.set_row(editor_row);
        this.edit_record.set_data_index(this.record.data_index);
        this.edit_record.set_parent_column(this);
        this.edit_record.build_editor();
    }

    /**
     * Close editor button handler.
     * @method close_edit_record_editor
     * @private
     *
     */

    close_edit_record_editor(){
        this.show_editor_button.children('a').addClass('is-outlined');
        this.show_editor_button.off('click');
        this.show_editor_button.click($.proxy(this.open_edit_record_editor, this));
        this.record.close_subrecord();
        this.edit_record = null;
    }

    /**
     * Build cell part of column.
     * @method build_cell
     * @param {JQueryNode} elem Container element.
     *
     */

    build_cell(elem){
        this.cell_elem = elem;

        var buttons_div = $('<div class="field has-addons" style="justify-content: right;"></div>').appendTo(this.cell_elem);

        if(typeof(this.options.no_edit) == "undefined" || this.options.no_edit == false){
            this.show_editor_button = $('<p class="control"><a class="button is-warning is-outlined" title="'+this.table.lang.edit_tooltip+'"><span class="icon is-small"><span class="unicode-icon">✎</span></span></a></p>').appendTo(buttons_div).click($.proxy(this.open_edit_record_editor, this));
        }

        if(typeof(this.options.no_delete) == "undefined" || this.options.no_delete == false){
            $('<p class="control"><a class="button is-danger is-outlined" title="'+this.table.lang.delete_tooltip+'"><span class="icon is-small"><span class="unicode-icon">⊗</span></span></a></p>').appendTo(buttons_div).click($.proxy(this.delete_record, this));
        }

        if(typeof(this.options.item_actions) != "undefined"){
            for (var i in this.options.item_actions){
                var bstyle = 'is-info is-outlined';
                var symbol = '○';
                if (typeof(this.options.item_actions[i].button_class) != "undefined"){
                    bstyle = this.options.item_actions[i].button_class;
                }
                if (typeof(this.options.item_actions[i].symbol) != "undefined"){
                    symbol = this.options.item_actions[i].symbol;
                }

                $('<p class="control"><a class="button '+bstyle+'" title="'+this.options.item_actions[i].tooltip+'"><span class="icon is-small"><span class="unicode-icon">'+symbol+'</span></span></a></p>').appendTo(buttons_div).click($.proxy(function(i){this.options.item_actions[i].action(this.record)}, this, i));
            }
        }


    }

    /**
     * Close editor handler.
     * @method close_editor
     * @private
     *
     */

    close_editor() {

        if (this.edit_record !== null){
            this.close_edit_record_editor();
        }

        if(this.record.parent_column !== null){
            if (this.record.parent_column.edit_record !== null){
                this.record.parent_column.close_edit_record_editor();
            }

            if (this.record.parent_column.new_record !== null){
                this.record.parent_column.new_record.row.remove();
                this.record.parent_column.new_record = null;
                this.record.parent_column.new_record_button.children('a').addClass('is-outlined');
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
     * @return {Boolean} Always true
     *
     */

    visible_editor(){
        return true;
    }

    /**
     * Build panel with commit/cancel buttons.
     * @method build_editor
     * @param {JQueryNode} elem Container element.
     * @param {Boolean} is_new_record Is new record?
     *
     */

    build_editor(elem, is_new_record = false){
        this.editor_elem = elem;

        var buttons_div = $('<div class="field is-grouped"></div>').appendTo(this.editor_elem);

        if(typeof(this.options.no_commit) == "undefined" || this.options.no_commit == false){
            if(is_new_record) {
                $('<p class="control"><a class="button is-primary is-outlined"><span class="file-icon"><span class="unicode-icon">⊕</span></span>&nbsp;'+this.table.lang.add_record+'</a></p>').appendTo(buttons_div).click($.proxy(this.add_record, this));
            } else {
                $('<p class="control"><a class="button is-primary is-outlined"><span class="file-icon"><span class="unicode-icon">⊕</span></span>&nbsp;'+this.table.lang.save_record+'</a></p>').appendTo(buttons_div).click($.proxy(this.save_record, this));
            }
        }

        if(typeof(this.options.no_cancel) == "undefined" || this.options.no_cancel == false){
            $('<a class="button is-warning is-outlined"><span class="file-icon"><span class="unicode-icon">⊗</span></span>&nbsp;'+this.table.lang.cancel+'</a>').appendTo(buttons_div).click($.proxy(this.close_editor, this));
        }

    }

    /**
     * Add record button handler.
     * @method add_record
     * @private
     */

    add_record(){
        if (this.table.insert(this.record) != 'invalid'){
            this.close_editor();
        }
    }

    /**
     * Save record button handler.
     * @method save_record
     * @private
     */

    save_record(){
        this.table.update(this.record);
    }

    /**
     * Delete record button handler.
     * @method delete_record
     * @private
     */

    delete_record(){
        if (confirm(this.table.lang.delete_confirm)){
            this.table.remove(this.record);
        }
    }

    /**
     * Refresh button handler.
     * @method refresh_table
     * @private
     */

    refresh_table(){
        this.table.select();
    }
}

