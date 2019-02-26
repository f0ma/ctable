'use strict';

/**
 * Provides the base CTable classes.
 * 
 * @module ctable
 */

/**
 * Base column class.
 * 
 * See {{#crossLink "CColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CColumn
 * @constructor
 * 
 * @example
 *     table.add_column_class(CColumn, {column:'id', title:'ID', visible_editor:false});
 */

class CColumn {

    /**
     * Create column object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} record Parent CRecord object.
     * @param {Object} [options] Column options.
     * @param {Boolean} [options.visible_column] Show column in table.
     * @param {Boolean} [options.visible_editor] Show editor for this column.
     * @param {int} [options.width] Column width in percents.
     * @param {String} [options.title] Column title.
     * @param {String} [options.column] Column name in record.
     * @param {String} [options.footnote] Footnote text (if record class supported).
     * 
     */
    
    constructor(table, record, options = {}) {
        this.table = table;
        this.record = record;
        this.options = options;
        
        this.title_elem = null;
        this.options_elem = null;
        this.cell_elem = null;
        this.editor_elem = null;
        this.summary_elem = null;
        
        this.editor = null;
    }
    
    /**
     * Return visibility status of this column.
     * @method visible_column
     * @return {Boolean} Is visible?
     *
     */
    
    visible_column(){
        if(typeof(this.options.visible_column) != "undefined"){
            return this.options.visible_column;
        }
        return true;
    }

    /**
     * Return editor visibility status of this column.
     * @method visible_editor
     * @return {Boolean} Show editor?
     *
     */
    
    visible_editor(){
        if(typeof(this.options.visible_editor) != "undefined"){
            return this.options.visible_editor;
        }
        return true;
    }
    
    /**
     * Return width of this column, or 0 if undefined.
     * @method width
     * @return {Int} Width
     *
     */
    
    width(){
        if(typeof(this.options.width) != "undefined"){
            return this.options.width;
        }
        return 0;
    }

    /**
     * Build title part of column.
     * @method build_title
     * @param {JQueryNode} elem Container element.
     *
     */
    
    build_title(elem){
        this.title_elem = elem;
        if(typeof(this.options.title) != "undefined"){
            this.title_elem.text(this.options.title);
        }        
    }
    
    /**
     * Build options part of column.
     * @method build_options
     * @param {JQueryNode} elem Container element.
     *
     */
    
    build_options(elem){
        this.options_elem = elem;
    }
    
    /**
     * Build cell part of column.
     * @method build_cell
     * @param {JQueryNode} elem Container element.
     *
     */
    
    build_cell(elem){
        this.cell_elem = elem;
        this.cell_elem.text(this.record.record_field(this.options.column));
    }
    
    /**
     * Build editor part of column.
     * @method build_editor
     * @param {JQueryNode} elem Container element.
     * @param {Boolean} is_new_record Create editor for new record.
     *
     */
    
    build_editor(elem, is_new_record = false){
        this.editor_elem = elem;
        this.editor = $('<input class="input"></input>').appendTo(this.editor_elem);
        if (is_new_record){
            this.editor.val("");
        } else {
            this.editor.val(this.record.record_field(this.options.column));
        }
       
        this.editor.change($.proxy(this.value_changed, this));
    }

    /**
     * Build summary part of column.
     * @method build_summary
     * @param {JQueryNode} elem Container element.
     *
     */
    
    build_summary(elem){
        this.summary_elem = elem;
    }
    
    /**
     * On editor change value handler.
     * @method value_changed
     *
     */
    
    value_changed(){
        if(typeof(this.options.column) != "undefined" && this.is_valid()){
            this.record.on_change_in_editor(this.options.column, this.editor.val());
        }
    }

    /**
     * Validate editor value.
     * @method is_valid
     * @return {Boolean} Always true.
     *
     */
    
    is_valid(){
        return true;
    }
    
    /**
     * On record changed (in another column) handler.
     * @method record_changed
     *
     */
    
    record_changed(column_name, value){
    }
    
    /**
     * Get editor value.
     * @method editor_value
     * @return {Array} Column name and value as [String, String] or [null, null]
     *
     */
    
    editor_value(){
        if(typeof(this.options.column) != "undefined"){
             if(this.editor != null){
                 return [this.options.column, this.editor.val()];
             } else {
                 if(! this.record.record_is_new()) {
                     return [this.options.column, this.record.record_field(this.options.column)];
                 }
             }
        }
        return [null, null];
    }
    
}

/**
 * Text input column class.
 * 
 * See {{#crossLink "CTextDataColumn/constructor"}}{{/crossLink}} for options list.
 * 
 * @class CTextDataColumn
 * @constructor
 * @extends CColumn
 * 
 * @example
 *     table.add_column_class(CTextDataColumn,{column:'firstname', title:'Firstname', validate:"\\S+"});
 */

class CTextDataColumn extends CColumn {
    
    /**
     * Create column object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} record Parent CRecord object.
     * @param {Object} options Column options:
     * @param {String} options.column Column name in record.
     * @param {Boolean} [options.visible_column] Show column in table.
     * @param {Boolean} [options.visible_editor] Show editor for this column.
     * @param {int} [options.width] Column width in percents.
     * @param {String} [options.title] Column title.
     * @param {Boolean} [options.no_sort] Disable sorting in this column.
     * @param {Boolean} [options.no_search] Disable search field by this column.
     * @param {String} [options.input] Input type: "input" (default) or "textarea".
     * @param {String} [options.validate] Validate input by this Regexp. Default no validate.
     * @param {String} [options.default_value] Default value for new record.
     * @param {String} [options.footnote] Footnote text (if record class supported).
     * 
     */
    
    constructor(table, record, options = {}) {
        super(table, record, options);
        
        this.sort_button = null;
        this.search_field = null;
    }
    
    /**
     * Build title part of column with sorting.
     * @method build_title
     * @param {JQueryNode} elem Container element.
     *
     */
    
    build_title(elem){
        this.title_elem = elem;
        if(typeof(this.options.title) != "undefined"){
            this.title_elem.text(this.options.title);
        }
        
        if(typeof(this.options.no_sort) == "undefined" || !this.options.no_sort){
        
            this.sort_button = $('<a class="button is-small is-pulled-right"><span class="icon"><i class="fas fa-sort xtable-sort-none"/><i class="fas fa-sort-up xtable-sort-up" style="display: none;"/><i class="fas fa-sort-down xtable-sort-down" style="display: none;"/></span></a>').appendTo(this.title_elem);
            
            this.sort_button.click($.proxy(this.sort_button_click, this));
        }
    }
    
    /**
     * Sort button click handler.
     * @method sort_button_click
     * @private
     *
     */
    
    sort_button_click(){
        if(this.sort_button.find('span i.xtable-sort-none').css('display') != 'none') {
                this.sort_button.find('span i.xtable-sort-none').css('display', 'none');
                this.sort_button.find('span i.xtable-sort-up').css('display', '');
                this.table.set_order(this.options.column, 'ASC');
                this.table.select();
                return
            }
            if(this.sort_button.find('span i.xtable-sort-up').css('display') != 'none') {
                this.sort_button.find('span i.xtable-sort-up').css('display', 'none');
                this.sort_button.find('span i.xtable-sort-down').css('display', '');
                this.table.set_order(this.options.column, 'DESC');
                this.table.select();
                return
            }
            if(this.sort_button.find('span i.xtable-sort-down').css('display') != 'none') {
                this.sort_button.find('span i.xtable-sort-down').css('display', 'none');
                this.sort_button.find('span i.xtable-sort-none').css('display', '');
                this.table.set_order(this.options.column, '');
                this.table.select();
                return
            }
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
            this.search_field = $('<input class="input"></input>').appendTo(this.options_elem);
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
        this.table.set_search(this.options.column, this.search_field.val());
        this.table.select();        
    }
    
    /**
     * Validate editor value.
     * @method is_valid
     * @return {Boolean} If options.validate is set return true if re.test is true.
     *
     */
    
    is_valid(){
        if(typeof(this.options.validate) != "undefined" && this.editor != null){
            var re = new RegExp(this.options.validate);
            if (!re.test(this.editor.val())) {
                this.editor.removeClass( "is-success" );
                this.editor.addClass( "is-danger" );
                return false;
            } else {
                this.editor.removeClass( "is-danger" );
                this.editor.addClass( "is-success" );
                return true;
            }
        
        }
        return true;
    }
    
    /**
     * Build editor part of column.
     * @method build_editor
     * @param {JQueryNode} elem Container element.
     * @param {Boolean} is_new_record Create editor for new record.
     *
     */
    
    build_editor(elem, is_new_record = false){
        this.editor_elem = elem;
        if(typeof(this.options.input) != "undefined" && this.options.input == "textarea"){
            this.editor = $('<textarea class="textarea"></textarea>').appendTo(this.editor_elem);
        } else {
            this.editor = $('<input class="input"></input>').appendTo(this.editor_elem);
        }
        
        if (is_new_record){
            if(typeof(this.options.default_value) != "undefined"){            
                this.editor.val(this.options.default_value);
            } else {
                this.editor.val("");
            }
        } else {
            this.editor.val(this.record.record_field(this.options.column));
        }
       
        this.editor.change($.proxy(this.value_changed, this));
    }
    
}

/**
 * Selector column
 * 
 * See {{#crossLink "CSelectColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CSelectColumn
 * @constructor
 * @extends CTextDataColumn
 * 
 * @example
 *     table.add_column_class(CSelectColumn, {column:'group_id', title:'Group', load:'group_id',
 *                                            endpoint:'/groups.php', width:'10%',
 *                                            default_value: 3});
 */

class CSelectColumn extends CTextDataColumn {

    /**
     * Constructor, if `options.load` is set, options value will be set with `fill_options` after ajax call
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} record Parent CRecord object.
     * @param {Object} options Column options:
     * @param {String} options.column Column name in record.
     * @param {Boolean} [options.visible_column] Show column in table.
     * @param {Boolean} [options.visible_editor] Show editor for this column.
     * @param {int} [options.width] Column width in percents.
     * @param {String} [options.title] Column title.
     * @param {Boolean} [options.no_sort] Disable sorting in this column.
     * @param {Boolean} [options.no_filter] Disable filter field by this column.
     * @param {String} [options.default_value] Default value for new record.
     * @param {Object} [options.options] Options dict.
     * @param {String} [options.load] Load options from server. Value will be sended as 'load' parameter.
     * @param {String} [options.endpoint] Load options from another endpoint.
     * @param {String} [options.footnote] Footnote text (if record class supported).
     * 
     */
    
    constructor(table, record, options = {}) {
        super(table, record, options);
        
        if(typeof(this.options.load) != "undefined"){
            this.table.load_from_options_cache(this.options.endpoint, {load:this.options.load}, $.proxy(this.fill_options, this));
        }
    }

    /**
     * Deferred set options for async ajax call.
     * @method fill_options
     * @param {Object} options Options dict.
     *
     */
    
    fill_options(options){
        this.options.options = options;

        if (this.cell_elem != null){
            for (var opt in this.options.options){
                if(this.options.options[opt][0] == this.record.record_field(this.options.column)){
                    this.cell_elem.text(this.options.options[opt][1]);
                }
            }
        }
        
        if (this.editor_elem != null){
            for (var opt in this.options.options) {
                var selected = "";
                if (! this.record.record_is_new() && this.record.record_field(this.options.column) == this.options.options[opt][0]){
                    selected = "selected";
                }
                $('<option value="'+this.options.options[opt][0]+'" '+selected+'>'+this.options.options[opt][1]+'</option>').appendTo(this.editor);
            }
        }
        
        if (this.options_elem != null){
            for (var opt in this.options.options) {
                $('<option value="'+this.options.options[opt][0]+'">'+this.options.options[opt][1]+'</option>').appendTo(this.search_field);
            }

        }
    }

    /**
     * Build cell part of column.
     * @method build_cell
     * @param {JQueryNode} elem Container element.
     *
     */
    
    build_cell(elem){
        this.cell_elem = elem;
        if(typeof(this.options.options) != "undefined"){
            for (var opt in this.options.options){
                if(this.options.options[opt][0] == this.record.record_field(this.options.column)){
                    this.cell_elem.text(this.options.options[opt][1]);
                }
            }
        }
    }
    
    /**
     * Build editor part of column.
     * @method build_editor
     * @param {JQueryNode} elem Container element.
     * @param {Boolean} is_new_record Create editor for new record.
     *
     */
    
    build_editor(elem, is_new_record = false){
        this.editor_elem = elem;
        
        var div_select = $('<div class="select"></div>').appendTo(this.editor_elem);
        this.editor = $('<select></select>').appendTo(div_select);
        
        if(is_new_record){
            if(typeof(this.options.default_value) == "undefined" || typeof(this.options.options) == "undefined"){
                $('<option value="" selected>'+this.table.lang.no_select+'</option>').appendTo(this.editor);
            }
        }
        
        if(typeof(this.options.options) != "undefined"){
            for (var opt in this.options.options) {
                var selected = "";
                if (! this.record.record_is_new() && this.record.record_field(this.options.column) == this.options.options[opt][0]){
                    selected = "selected";
                }
                if (this.record.record_is_new() && this.options.default_value == this.options.options[opt][0]){
                    selected = "selected";
                }
                $('<option value="'+this.options.options[opt][0]+'" '+selected+'>'+this.options.options[opt][1]+'</option>').appendTo(this.editor);
            }

        }
       
        this.editor.change($.proxy(this.value_changed, this));
    }
    
    /**
     * Build options part of column.
     * @method build_options
     * @param {JQueryNode} elem Container element.
     *
     */
    
    build_options(elem){
        this.options_elem = elem;
        
        if(typeof(this.options.no_filter) == "undefined" || !this.options.no_filter){
            
            var div_select = $('<div class="select" style="max-width: 10em;"></div>').appendTo(this.options_elem);
            this.search_field = $('<select></select>').appendTo(div_select);
            $('<option value="" selected>'+this.table.lang.no_select+'</option>').appendTo(this.search_field);
            
            if(typeof(this.options.options) != "undefined"){
                for (var opt in this.options.options) {
                    $('<option value="'+this.options.options[opt][0]+'">'+this.options.options[opt][1]+'</option>').appendTo(this.search_field);
                }
            }
            
            this.search_field.change($.proxy(this.set_search_filter, this));
        }
    }
    
    /**
     * Change filter handler.
     * @method set_search_filter
     * @private
     *
     */
    
    set_search_filter(){
        this.table.set_filter(this.options.column, this.search_field.val());
        this.table.select();        
    }
    
    /**
     * Validate input.
     * @method is_valid
     * @return {Boolean} If `options.validate` is true return false if no value selected.
     *
     */
    
    is_valid(){
        if(typeof(this.options.validate) != "undefined" && this.editor != null){
            if (this.editor.val() == "") {
                this.editor.parent().removeClass( "is-success" );
                this.editor.parent().addClass( "is-danger" );
                return false;
            } else {
                this.editor.parent().removeClass( "is-danger" );
                this.editor.parent().addClass( "is-success" );
                return true;
            }
        
        }
        return true;
    }
    
}

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
     * @param {Array} [options.item_actions] Additional actions.
     * @param {String} [options.item_actions.button_class] Bulma buttom class.
     * @param {String} [options.item_actions.fa_class] FA image class.
     * @param {Function} [options.item_actions.action] Click handler (record as argument).
     * @param {Array} [options.common_actions] Additional actions.
     * @param {String} [options.common_actions.button_class] Bulma buttom class.
     * @param {String} [options.common_actions.fa_class] FA image class.
     * @param {Function} [options.common_actions.action] Click handler (record as argument).
     */
    
    constructor(table, record, options = {}) {
        super(table, record, options);
        
        this.new_record = null;
        this.edit_record = null;
        
        this.show_editor_button = null;
        this.close_editor_button = null;
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
        } else {
            this.new_record = new this.table.record_class(this.table, this.record_options);
            var editor_row = $('<tr></tr>').prependTo(this.table.tbody);
            this.new_record.set_row(editor_row);
            this.new_record.set_data_index(this.record.data_index);
            this.new_record.set_parent_column(this);
            this.new_record.build_editor(true);
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
        
        var buttons_div = $('<div class="buttons is-right" style="flex-wrap: nowrap;"></div>').appendTo(this.title_elem);
        
        if(typeof(this.options.no_add) == "undefined" || this.options.no_add == false){
            $('<a class="button is-info is-outlined"><span class="icon is-small"><i class="far fa-plus-square"></i></span></a>').appendTo(buttons_div).click($.proxy(this.build_new_record_editor, this));
        }

        if(typeof(this.options.no_refresh) == "undefined" || this.options.no_refresh == false){
            $('<a class="button is-info is-outlined"><span class="icon is-small"><i class="fa fa-sync"></i></span></a>').appendTo(buttons_div).click($.proxy(this.refresh_table, this));
        }
        
        if(typeof(this.options.common_actions) != "undefined"){
            for (var i in this.options.common_actions){
                var bstyle = 'is-info is-outlined';
                var istyle = 'far fa-plus-square';
                if (typeof(this.options.common_actions[i].button_class) != "undefined"){
                    bstyle = this.options.common_actions[i].button_class;
                }
                if (typeof(this.options.common_actions[i].fa_class) != "undefined"){
                    istyle = this.options.common_actions[i].fa_class;
                }
                $('<a class="button '+bstyle+'"><span class="icon is-small"><i class="'+istyle+'"></i></span></a>').appendTo(buttons_div).click({record:this.record}, this.options.common_actions[i].action);
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
        this.show_editor_button.hide();
        this.close_editor_button.show();
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
        this.show_editor_button.show();
        this.close_editor_button.hide();
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
        
        var buttons_div = $('<div class="buttons is-right" style="flex-wrap: nowrap;"></div>').appendTo(this.cell_elem);

        if(typeof(this.options.no_edit) == "undefined" || this.options.no_edit == false){
            this.show_editor_button = $('<a class="button is-warning is-outlined"><span class="icon is-small"><i class="far fa-edit"></i></span></a>').appendTo(buttons_div).click($.proxy(this.open_edit_record_editor, this));
            this.close_editor_button = $('<a class="button is-warning" style="display:none;"><span class="icon is-small"><i class="far fa-edit"></i></span></a>').appendTo(buttons_div).click($.proxy(this.close_edit_record_editor, this));
        }

        if(typeof(this.options.no_delete) == "undefined" || this.options.no_delete == false){
            $('<a class="button is-danger is-outlined"><span class="icon is-small"><i class="far fa-trash-alt"></i></span></a>').appendTo(buttons_div).click($.proxy(this.delete_record, this));
        }

        if(typeof(this.options.item_actions) != "undefined"){
            for (var i in this.options.item_actions){
                var bstyle = 'is-info is-outlined';
                var istyle = 'far fa-plus-square';
                if (typeof(this.options.item_actions[i].button_class) != "undefined"){
                    bstyle = this.options.item_actions[i].button_class;
                }
                if (typeof(this.options.item_actions[i].fa_class) != "undefined"){
                    istyle = this.options.item_actions[i].fa_class;
                }
                $('<a class="button '+bstyle+'"><span class="icon is-small"><i class="'+istyle+'"></i></span></a>').appendTo(buttons_div).click({record:this.record}, this.options.item_actions[i].action);
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
        
        var buttons_div = $('<div class="buttons is-right" style="flex-wrap: nowrap;"></div>').appendTo(this.editor_elem);
        
        if(typeof(this.options.no_commit) == "undefined" || this.options.no_commit == false){
            if(is_new_record) {
                $('<a class="button is-primary is-outlined"><span class="icon"><i class="far fa-check-circle"></i></span>&nbsp;'+this.table.lang.add_record+'</a>').appendTo(buttons_div).click($.proxy(this.add_record, this));
            } else {
                $('<a class="button is-primary is-outlined"><span class="icon"><i class="far fa-check-circle"></i></span>&nbsp;'+this.table.lang.save_record+'</a>').appendTo(buttons_div).click($.proxy(this.save_record, this));
            }
        }
        
        $('<a class="button is-warning is-outlined"><span class="icon"><i class="fas fa-ban"></i></span>&nbsp;'+this.table.lang.cancel+'</a>').appendTo(buttons_div).click($.proxy(this.close_editor, this));

    }
    
    /**
     * Add record button handler.
     * @method add_record
     * @private
     */
    
    add_record(){
        this.table.insert(this.record);
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
 *            child_table.set_record_class(CDivEditorRecord);
 *            child_table.add_column_class(CColumn,{column:'id', title:'ID', visible_editor:false});
 *            child_table.add_column_class(CSelectColumn, {column:'name', title: 'Name', load:'person_id', endpoint:'/person.php'});
 *            child_table.add_column_class(CCommandColumn,{});
 *            child_table.set_filter('person_id', record.record_field('id'));
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
        this.show_subtable_button = $('<a class="button is-info is-outlined"><span class="icon is-small"><i class="far fa-caret-square-down"></i></span></a>').appendTo(this.cell_elem).click($.proxy(this.open_subtable, this));
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
        this.subtable_cell = $('<td colspan="'+this.table.visible_columns()+'"></td>').appendTo(subtable_row);
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
    }

    /**
     * Create subrecord row.
     * @method open_subrecord
     * @return {JQueryNode} Subrow container element.
     *
     */
    
    open_subrecord(close_handler){
        console.log("open_subrecord");
        console.log(close_handler);
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
        console.log("close_subrecord");
        if (this.subrecord_row != null){
            this.subrecord_row.remove();
            this.subrecord_row = null;
            this.row.removeClass('is-selected');
            if(this.subrecord_close_handler != null)
            {
                console.log("subrecord_close_handler");
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

/**
 * Div-based editor with floats and footnotes.
 * 
 * See {{#crossLink "CDivEditorRecord/constructor"}}{{/crossLink}} for options list.
 *
 * @class CDivEditorRecord
 * @constructor
 * @extends CRecord
 * 
 * @example
 *     table.set_record_class(CDivEditorRecord, {});
 */

class CDivEditorRecord extends CRecord {
    
    /**
     * Create record object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} [options] Column options:
     * @param {String} [options.width_class] Column width style (Bulma `is-4` for default)
     * 
     */
    
    build_editor(is_new_record = false){
        var editor_row = $('<td colspan="'+this.table.visible_columns()+'"></td>').appendTo(this.row);
        var editor_cell = $('<div style="columns"></td>').appendTo(editor_row);
        
        var width_class = 'is-4';
        if (typeof(this.options.width_class) != 'undefined'){
            width_class = this.options.width_class;
        }
        
        for (var i in this.columns){
            if (this.columns[i].visible_editor()){
                var rightfloat = "";
                if(typeof(this.columns[i].save_record) != 'undefined'){
                    rightfloat = "float: right;"
                }

                var div = $('<div class="field column '+width_class+'" style="display: inline-block; vertical-align:top;'+rightfloat+'"></div>').appendTo(editor_cell);
                if(typeof(this.columns[i].options.title) != "undefined"){
                    var lab = $('<label class="label"></label>').appendTo(div);
                    lab.text(this.columns[i].options.title+":");

                }
                
                this.columns[i].build_editor(div, is_new_record);
                
                if(typeof(this.columns[i].options.footnote) != "undefined"){ 
                    var footnote = $('<p class="is-size-7 has-text-grey-light"></p>').appendTo(div);
                    footnote.text(this.columns[i].options.footnote);
                }
            }
        }
    }
        
}

/**
 * Pagination class.
 * 
 * See {{#crossLink "CPagination/constructor"}}{{/crossLink}} for options list.
 *
 * @class CPagination
 * @constructor
 * 
 * @example
 *     table.set_pagination_class(CPagination,{});
 */

class CPagination{
    
    /**
     * Create pagination object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} [options] Column options:
     * @param {Array} [options.page_sizes] Variants of page size (list of integers).
     * @param {Int} [options.default_page_size] Default page size.
     * @param {Boolean} [options.hide_all_records] Hide option show all record.
     * 
     */
    
    constructor(table, options = {}) {
        this.table = table;
        this.options = options;
        this.container = null;
        this.page_selector = null;
        this.page_size_selector = null;
        this.page_info = null;
        
        this.table.start_record = 0;
        this.table.page_size = 25;
    }
    
    /**
     * Go to first page.
     * @method go_first
     * @private
     *
     */
    
    go_first() {
        this.table.start_record = 0;
        this.table.select();
    }

    /**
     * Go to prev page.
     * @method go_prev
     * @private
     *
     */
    
    go_prev() {
        this.table.start_record = this.table.start_record - this.table.page_size;
        if (this.table.start_record < 0) {
            this.table.start_record = 0;
        }
        this.table.select();
    }
    
    /**
     * Page changed handler.
     * @method page_change
     * @private
     *
     */
    
    page_change() {
        this.table.start_record = parseInt(this.page_selector.val())*this.table.page_size;
        this.table.select();
    }
    
    /**
     * Go to next page.
     * @method go_next
     * @private
     *
     */
    
    go_next() {
        this.table.start_record = this.table.start_record + this.table.page_size;
        if (this.table.start_record >= this.table.total_records_count) {
            this.table.start_record = ~~(this.table.total_records_count / this.table.page_size)*this.table.page_size;
        }
        this.table.select();
    }
    
    /**
     * Go to last page.
     * @method go_last
     * @private
     *
     */
    
    go_last() {
        this.table.start_record = ~~(this.table.total_records_count / this.table.page_size)*this.table.page_size;
        this.table.select();
    }
    
    /**
     * Page size change handler.
     * @method page_size_change
     * @private
     *
     */
    
    page_size_change() {
        this.table.page_size = parseInt(this.page_size_selector.val());
        this.table.start_record = 0;
        this.table.select();
    }
    
    /**
     * Table reloaded handler.
     * @method on_table_reloaded
     *
     */
    
    on_table_reloaded(){
        this.page_selector.empty();
        var s = 0;
        if (this.table.page_size > 0) {
            for (var i = 0; i <= this.table.total_records_count; i+= this.table.page_size) {
                if (this.table.start_record == i){
                    $('<option value="' + s + '" selected>'+(s+1)+'</option>').appendTo(this.page_selector);
                } else {
                    $('<option value="' + s + '">'+(s+1)+'</option>').appendTo(this.page_selector);
                }
                s += 1;
            }
        } else {
            $('<option value="0" selected>1</option>').appendTo(this.page_selector);    
        }
        this.set_page_info();
    }
    
    /**
     * Update pagination text info.
     * @method set_page_info
     * @private
     *
     */
    
    set_page_info() {
        this.page_info.text(' '+this.table.lang.records+' [ '+(this.table.start_record+1)+'-'+(this.table.start_record+this.table.data.length)+' ] '+this.table.lang.from+' '+this.table.total_records_count+'.');         
    }
    
    /**
     * Build pagination.
     * @method build_pagination
     * @param {JQueryNode} elem Container node.
     *
     */
    
    build_pagination(elem) {
        
        this.container = elem;
        
        $('<a class="button"><span class="icon"><i class="fas fa-fast-backward"/></span></a>').appendTo(this.container).click($.proxy(this.go_first, this));
    
        $('<a class="button"><span class="icon"><i class="fas fa-step-backward"/></span></a>').appendTo(this.container).click($.proxy(this.go_prev, this));
    
    
        var page_select_div = $('<div class="select"></div>').appendTo(this.container);
        this.page_selector = $('<select class="page-selection"></select>').appendTo(page_select_div);
        
        this.page_selector.change($.proxy(this.page_change, this));
    
    
        $('<a class="button"><span class="icon"><i class="fas fa-step-forward"/></span></a>').appendTo(this.container).click($.proxy(this.go_next, this));
    
        $('<a class="button"><span class="icon"><i class="fas fa-fast-forward"/></span></a>').appendTo(this.container).click($.proxy(this.go_last, this));
    
        var on_one_page_span = $('<span style="vertical-align:sub;"></span>').appendTo(this.container);
        
        on_one_page_span.text(this.table.lang.on_one_page);
        
        var page_size_div = $('<div class="select"></div>').appendTo(this.container);
        
        this.page_size_selector = $('<select></select>').appendTo(page_size_div);
        
        var page_sizes = [5,10,25,50,100,0];
        var default_page_size = 25;
        
        if(typeof(this.options.page_sizes) != "undefined"){
            page_sizes = this.options.page_sizes;
        }
        
        if(typeof(this.options.default_page_sizes) != "undefined"){
            default_page_size = this.options.default_page_sizes;
        }
        
        for(var i in page_sizes) {
            var page_name = page_sizes[i];
            var selected = '';
            if (page_sizes[i] == 0) {
                if(typeof(this.options.hide_all_records) != 'undefined' && this.options.hide_all_records == true){
                    continue;
                }
                page_name = this.table.lang.all_records;
            }
            if (page_sizes[i] == default_page_size) {
                selected = 'selected'
            }
            $('<option value="'+page_sizes[i]+'" '+selected+'>'+page_name+'</option>').appendTo(this.page_size_selector);
        }

        this.page_size_selector.change($.proxy(this.page_size_change, this));
        
        this.page_info = $('<span style="vertical-align:sub;"></span>').appendTo(this.container);
        
        this.page_info.text(' '+this.table.lang.records+' 0 '+this.table.lang.from+' 0 ');         
    }
}


/**
 * Table class
 * 
 * See {{#crossLink "CTable/constructor"}}{{/crossLink}} for options list.
 *
 * @class CTable
 * @constructor
 * 
 * @example
 *      var table = new CTable({endpoint: "/demo.php"});
 *      
 *      table.set_record_class(CDivEditorRecord);
 *      table.add_column_class(CColumn,{column:'id',
 *                                      title:'ID',
 *                                      visible_editor:false,
 *                                      visible_column:false});
 *          
 *      table.add_column_class(CTextDataColumn,{column:'firstname',
 *                                              title:'Firstname',
 *                                              validate:"\\S+"});
 *          
 *      table.add_column_class(CCommandColumn,{});
 *          
 *      table.set_pagination_class(CPagination,{});
 *          
 *      table.build_table($('#mainbox'));
 *          
 *      table.select();
 */

class CTable {

    /**
     * Create table object
     *
     * @method constructor
     * @param {Object} options Column options:
     * @param {String} options.endpoint Ajax requests endpoint.
     * 
     */

    constructor(options = {}) {
        
        this.options = options;
        
        this.table = $('<table class="table is-narrow is-bordered is-fullwidth is-hoverable"></table>');

        this.colgroup = $("<colgroup></colgroup>").appendTo(this.table);
        this.thead = $("<thead></thead>").appendTo(this.table);
        this.tfoot = $("<tfoot></tfoot>").appendTo(this.table);
        this.tbody = $("<tbody></tbody>").appendTo(this.table);
        
        this.data = [];
        this.total_records_count = 0;
        this.start_record = 0;
        this.page_size = 0;
        
        this.columns_classes = [];
        this.columns_options = [];
        
        this.record_class = null;
        this.record_options = null;
        
        this.head_record = null;
        this.body_records = [];
        this.foot_record = null;
        
        this.pagination_class = null;
        this.pagination_options = null;
        
        this.pagination = null;
        
        this.column_orders = {};
        this.column_filters = {};
        this.column_searches = {};
        
        this.options_url_cache = {};
        
        this.elem = null;
        
        this.lang = {};
        this.lang.no_records = "Нет записей";
        this.lang.edit_cell = "Правка";
        this.lang.delete_cell = "Удалить";
        this.lang.add_record = "Добавить";
        this.lang.save_record = "Сохранить";
        this.lang.cancel = "Отменить";
        this.lang.delete_confirm = "Удалить запись?";
        this.lang.no_select = "[Другой]";
        this.lang.on_one_page = " На одной странице: ";
        this.lang.records = "Записи";
        this.lang.from = "из";
        this.lang.all_records = "Все"
    }
    
    /**
     * Get visible columns count.
     * @method visible_columns
     * @return {Int} Count.
     *
     */
    
    visible_columns(){
        var cont = 0;
        for (var i in this.columns_options){
            if(typeof(this.columns_options[i].visible_column) != "undefined" && this.columns_options[i].visible_column == false){
                cont += 0;
            } else {
                cont += 1;
            }
            
        }
        return cont;        
    }
    
    /**
     * Set table record class.
     * @method set_record_class
     * @param {Class} record_class CRecord or child class.
     * @param {Object} options Options for class constuctor.
     *
     */
    
    set_record_class(record_class, options){
        this.record_class = record_class;
        this.record_options = options;
    }
    
    /**
     * Set table pagination class.
     * @method set_pagination_class
     * @param {Class} pagination_class CPagination or child class.
     * @param {Object} options Options for class constuctor.
     *
     */
    
    set_pagination_class(pagination_class, options){
        this.pagination_class = pagination_class;
        this.pagination_options = options;
    }
    
    /**
     * Add table column class.
     * @method add_column_class
     * @param {Class} column_class CColumn or child class.
     * @param {Object} options Options for class constuctor.
     *
     */
    
    add_column_class(column_class, options){
        this.columns_classes.push(column_class);
        this.columns_options.push(options);
    }
    
    /**
     * Build table.
     * @method build_table
     * @param {JQueryNode} elem Container element.
     *
     */
    
    build_table(elem){
        this.elem = elem;
        this.table.appendTo(this.elem);
        
        this.head_record = new this.record_class(this, this.record_options);
        this.head_record.set_head(this.thead);
        this.head_record.set_colgroup(this.colgroup);
        this.head_record.build_header();
        
        this.foot_record = new this.record_class(this, this.record_options);
        this.foot_record.set_foot(this.tfoot);
        this.foot_record.build_footer();
        
        if(this.pagination_class !== null){
            this.pagination = new this.pagination_class(this, this.pagination_options);        

            var pagination_cell = $('<td colspan="'+this.visible_columns()+'"></td>');
            var pagination_row = $('<tr></tr>');
            pagination_cell.appendTo(pagination_row);
            pagination_row.appendTo(this.tfoot);
            
            this.pagination.build_pagination(pagination_cell);
        }
        
    }
    
    /**
     * Fill table with values after ajax call.
     * @method fill_table
     * @private
     *
     */

    fill_table(){
        this.body_records = [];
        this.tbody.empty();

        if(this.data.length == 0){
            $('<tr><td style="text-align:center;" colspan="'+this.visible_columns()+'">'+this.lang.no_records+'</td></tr>').appendTo(this.tbody);
            return;
        }

        for (var i in this.data){
            this.body_records.push(new this.record_class(this, this.record_options));
            var data_row = $('<tr></tr>').appendTo(this.tbody);
            this.body_records[i].set_row(data_row);
            this.body_records[i].set_data_index(i);
            this.body_records[i].build_record();
        }
        
        if (this.pagination != null){
            this.pagination.on_table_reloaded();
        }
    }
    
    /**
     * Add order for column.
     * @method set_order
     * @param {String} column Column name.
     * @param {String} type Sort order `ASC`, `DESC` or `''` for remove sorting.
     *
     */
    
    set_order(column, type) {
        if(type == ''){
            delete this.column_orders[column];
        } else {
            this.column_orders[column] = type;
        }
    }
    
    /**
     * Add search for column.
     * @method set_search
     * @param {String} column Column name.
     * @param {String} value Search value (LIKE in SQL), `''` for remove.
     *
     */
    
    set_search(column, value) {
        if(value == ''){
            delete this.column_searches[column];
        } else {
            this.column_searches[column] = value;
        }
    }
    
    /**
     * Add filter for column.
     * @method set_filter
     * @param {String} column Column name.
     * @param {String} value Filter value, `''` for remove.
     *
     */
    
    set_filter(column, value) {
        if(value == ''){
            delete this.column_filters[column];
        } else {
            this.column_filters[column] = value;
        }
    }
    
    /**
     * Get data from server.
     * 
     * Making AJAX POST request to `options.endpoint` URL (post field `select`)
     * 
     * Request fields (json):
     * 
     * `start` {Int} Start record index (0 if no pagination)
     * 
     * `page` {Int} Page size (0 if no pagination)
     * 
     * `column_filters` {Object} Pairs column_name => filter_value
     * 
     * `column_searches` {Object} Pairs column_name => search_value
     * 
     * `column_orders` {Object} Pairs column_name => sort_order
     * 
     * Expected responce (json):
     * 
     * `Result` {String} `'OK'` if success or `'Error'` if falure.
     * 
     * `Message` {String} if falure, message to user.
     * 
     * `Records` {Array} Result record set: array of {Object}.
     * 
     * `TotalRecordCount` {Int} Total records count for pagination.
     * 
     * @method select
     *
     */
    
    select(){
        var self = this;
        this.data = [];
        
        $.ajax({
            type: "POST",
            url: this.options.endpoint,
            data: {"select":JSON.stringify({'start':this.start_record,
                                            'page':this.page_size,
                                            'column_filters':this.column_filters,
                                            'column_searches':this.column_searches,
                                            'column_orders':this.column_orders})},
            dataType: 'json' })
         .done(function(data) {
            if (data.Result == 'OK') {
                self.data = data.Records;
                self.total_records_count = data.TotalRecordCount;
                self.fill_table();
            } else {
                alert("Server-side Error: " + data.Message);
            }
         })
         .fail(function() {
             alert("Connection error");
         })
         .always(function() {
             
         });
    }
    
    /**
     * Insert record request.
     * 
     * Making AJAX POST request to `options.endpoint` URL (post field `insert`)
     * 
     * Request is record object (json).
     * 
     * Expected responce (json):
     * 
     * `Result` {String} `'OK'` if success or `'Error'` if falure.
     * 
     * `Message` {String} if falure, message to user.
     * 
     * Make `select()` if success.
     * 
     * @method insert
     * @param {Object} record CRecord object.
     *
     */
    
    insert(record){
      
        var self = this;
        
        var record_data = record.editor_values();
        if (record_data == null) return;
        
        $.ajax({
            type: "POST",
            url: this.options.endpoint,
            data: {"insert":JSON.stringify(record_data)},
            dataType: 'json'
        })    
        .done(function(data) {
            if (data.Result == 'OK') {
                self.select();
            } else {
                alert("Server-side Error: " + data.Message);
            }
        
        }, "json")
        .fail(function() {
            alert("Connection error");
        })
        .always(function() {
            
        });

    }
  
    /**
     * Update record request.
     * 
     * Making AJAX POST request to `options.endpoint` URL (post field `update`)
     * 
     * Request is record object (json).
     * 
     * Expected responce (json):
     * 
     * `Result` {String} `'OK'` if success or `'Error'` if falure.
     * 
     * `Message` {String} if falure, message to user.
     * 
     * Make `select()` if success.
     * 
     * @method update
     * @param {Object} record CRecord object.
     *
     */  
  
    update(record){

        var self = this;

        var updated_record_data = record.editor_values();
        if (updated_record_data == null) return;

        var source_record_data = record.record_field();

        var record_data = Object.assign({}, source_record_data, updated_record_data);

        $.ajax({
            type: "POST",
            url: this.options.endpoint,
            data: {"update":JSON.stringify(record_data)},
            dataType: 'json'
        })
        .done(function(data) {
            if (data.Result == 'OK') {
                self.select();                
            } else {
                alert("Server-side Error: " + data.Message);
            }
        
        }, "json")
        .fail(function() {
            alert("Connection error");
        })
        .always(function() {
            
        });
        
    }
    
    /**
     * Delete record request.
     * 
     * Making AJAX POST request to `options.endpoint` URL (post field `delete`)
     * 
     * Request is record object (json).
     * 
     * Expected responce (json):
     * 
     * `Result` {String} `'OK'` if success or `'Error'` if falure.
     * 
     * `Message` {String} if falure, message to user.
     * 
     * Make `select()` if success.
     * 
     * @method remove
     * @param {Object} record CRecord object.
     *
     */ 
    
    remove(record){
        
        var self = this;
        
        $.ajax({
            type: "POST",
            url: this.options.endpoint,
            data: {"delete":JSON.stringify(self.data[record.data_index])},
            dataType: 'json'
        })    
        .done(function(data) {
            if (data.Result == 'OK') {
                self.select();                
            } else {
                alert("Server-side Error: " + data.Message);
            }
        
        }, "json")
        .fail(function() {
            alert("Connection error");
        })
        .always(function() {
            
        });
    }
    
    /**
     * Table level options cache routine.
     * 
     * Making AJAX POST request to `options.endpoint` URL (post field `options`)
     * 
     * Request is `params` object (json). Requried field `params.load`.
     * 
     * Expected responce (json):
     * 
     * `Result` {String} `'OK'` if success or `'Error'` if falure.
     * 
     * `Message` {String} if falure, message to user.
     * 
     * `Options` {Object} Result options dict.
     * 
     * If `params` in cache call `on_options_loaded` and returns immediately.
     * Else make AJAX call and call `on_options_loaded` after data is loaded.
     * 
     * @method load_from_options_cache
     * @param {String} endpoint Override table endpoint. If undefined, table endpoint will be used.
     * @param {Object} params Params array.
     * @param {String} params.load Requried param.
     * @param {Function} on_options_loaded Called when request complete. Options object will be first parameter.
     *
     */ 
    
    load_from_options_cache(endpoint, params, on_options_loaded){
        
        var str_params = JSON.stringify(params);
        var self = this;
        var query_endpoint = this.options.endpoint;
        
        if(typeof(endpoint) != 'undefined'){
            query_endpoint = endpoint;
        }
        
        if (this.options_url_cache[str_params] != undefined){
            on_options_loaded(this.options_url_cache[str_params]);
        } else {
            $.ajax({
                type: "POST",
                url: query_endpoint,
                data: {"options":str_params},
                dataType: 'json'
            })    
            .done(function(data) {
                if (data.Result == 'OK') {
                    self.options_url_cache[str_params] = data.Options;
                    on_options_loaded(self.options_url_cache[str_params]);
                } else {
                    alert("Server-side Error: " + data.Message);
                }
            
            }, "json")
            .fail(function() {
                alert("Connection error");
            })
            .always(function() {
                
            });
        }
        
    }
    
}

