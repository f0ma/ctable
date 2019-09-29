/**
 * Selector column
 *
 * See {{#crossLink "CSelectColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CSelectColumn
 * @constructor
 * @extends CTextColumn
 *
 * @example
 *     table.add_column_class(CSelectColumn, {column:'group_id', title:'Group', load:'group_id',
 *                                            endpoint:'/groups.php', width:'10%',
 *                                            default_value: 3});
 */

class CSelectColumn extends CTextColumn {

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
            this.editor.empty();
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

