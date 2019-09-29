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

        $('<a class="button" title="'+this.table.lang.to_first_tooltip+'"><span class="icon"><i class="fas fa-fast-backward"/></span></a>').appendTo(this.container).click($.proxy(this.go_first, this));

        $('<a class="button" title="'+this.table.lang.to_prev_tooltip+'"><span class="icon"><i class="fas fa-step-backward"/></span></a>').appendTo(this.container).click($.proxy(this.go_prev, this));


        var page_select_div = $('<div class="select" title="'+this.table.lang.current_page_tooltip+'"></div>').appendTo(this.container);
        this.page_selector = $('<select class="page-selection"></select>').appendTo(page_select_div);

        this.page_selector.change($.proxy(this.page_change, this));


        $('<a class="button" title="'+this.table.lang.to_next_tooltip+'"><span class="icon"><i class="fas fa-step-forward"/></span></a>').appendTo(this.container).click($.proxy(this.go_next, this));

        $('<a class="button" title="'+this.table.lang.to_last_tooltip+'"><span class="icon"><i class="fas fa-fast-forward"/></span></a>').appendTo(this.container).click($.proxy(this.go_last, this));

        var on_one_page_span = $('<span style="vertical-align:sub;"></span>').appendTo(this.container);

        on_one_page_span.text(this.table.lang.on_one_page);

        var page_size_div = $('<div class="select" title="'+this.table.lang.page_size_tooltip+'"></div>').appendTo(this.container);

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
 
