/**
 * Text input column class.
 *
 * See {{#crossLink "CTextColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CTextColumn
 * @constructor
 * @extends CColumn
 *
 * @example
 *     table.add_column_class(CTextColumn,{column:'firstname', title:'Firstname', validate:"\\S+"});
 */

class CTextColumn extends CColumn {

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
     * @param {int} [options.max_width] Column width in px.
     * @param {Boolean} [options.break_words] Set word wrap in cell to break-words.
     * @param {Function} [options.render] Column render: function (JQueryNode, cell_value), predefined: TextRender (default), HTMLRender.
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

            this.sort_button = $('<span class="icon" title="'+this.table.lang.sort_tooltip+'"><i class="fas fa-sort xtable-sort-none"></i><i class="fas fa-sort-up xtable-sort-up" style="display: none;"></i><i class="fas fa-sort-down xtable-sort-down" style="display: none;"></i></span>').prependTo(this.title_elem);

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
        if(this.sort_button.find('i.xtable-sort-none').css('display') != 'none') {
                this.sort_button.find('i.xtable-sort-none').css('display', 'none');
                this.sort_button.find('i.xtable-sort-up').css('display', '');
                this.table.set_order(this.options.column, 'ASC');
                this.table.select();
                return
            }
            if(this.sort_button.find('i.xtable-sort-up').css('display') != 'none') {
                this.sort_button.find('i.xtable-sort-up').css('display', 'none');
                this.sort_button.find('i.xtable-sort-down').css('display', '');
                this.table.set_order(this.options.column, 'DESC');
                this.table.select();
                return
            }
            if(this.sort_button.find('i.xtable-sort-down').css('display') != 'none') {
                this.sort_button.find('i.xtable-sort-down').css('display', 'none');
                this.sort_button.find('i.xtable-sort-none').css('display', '');
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
