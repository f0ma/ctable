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
     * @param {int} [options.max_width] Column width in px.
     * @param {Boolean} [options.break_words] Set word wrap in cell to break-words.
     * @param {String} [options.title] Column title.
     * @param {String} [options.column] Column name in record.
     * @param {String} [options.footnote] Footnote text (if record class supported).
     * @param {String} [options.editor_width_class] Editor width class (if record class supported).
     * @param {Function} [options.render] Column render: function (JQueryNode, cell_value), predefined: TextRender (default), HTMLRender, EmptyRender.
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

        if(typeof(this.options.render) != "undefined"){
            this.render = this.options.render;
        } else {
            this.render = TextRender;
        }
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

        if(typeof(this.options.max_width) != "undefined"){
            this.cell_elem.css({'max-width':this.options.max_width+'px'});
        }

        if(typeof(this.options.break_words) != "undefined" && this.options.break_words){
            this.cell_elem.css({'word-wrap':'break-word'});
        }

        this.render(elem, this.record, this.options.column);
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
