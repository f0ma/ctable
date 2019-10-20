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
 *      table.set_record_class(CAdaptiveRecord);
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
     * @param {String} options.lang Table language: 'en' or 'ru'. Default is 'en'.
     * @param {String} options.select_method Method of select query. Default is 'GET'.
     *
     */

    constructor(options = {}) {

        this.options = options;

        this.table = $('<table class="table is-narrow is-bordered is-fullwidth is-hoverable ctable-table"></table>');

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

        this.predefined_fields = {};

        this.options_url_cache = {};

        this.elem = null;

        this.lang = {};

        if(typeof(this.options.lang) == "undefined"){
            this.options.lang = 'en';
        }

        if(this.options.lang == "en"){
            this.lang.no_records = "No records";
            this.lang.edit_cell = "Edit";
            this.lang.delete_cell = "Delete";
            this.lang.add_record = "Add";
            this.lang.save_record = "Save";
            this.lang.cancel = "Cancel";
            this.lang.delete_confirm = "Delete record?";
            this.lang.no_select = "[Any]";
            this.lang.on_one_page = " Show by ";
            this.lang.records = "Records on current page";
            this.lang.from = "from";
            this.lang.all_records = "All";
            this.lang.server_side_error = "Server side error";
            this.lang.error = "Error: ";
            this.lang.add_tooltip = "Add record";
            this.lang.reload_tooltip = "Reload table";
            this.lang.expand_tooltip = "Open subtable";
            this.lang.sort_tooltip = "Sort by this column";
            this.lang.edit_tooltip = "Change record";
            this.lang.delete_tooltip = "Delete record";
            this.lang.select_all_tooltip = "Select all";
            this.lang.to_first_tooltip = "To first page";
            this.lang.to_prev_tooltip = "To previous page";
            this.lang.current_page_tooltip = "This page";
            this.lang.to_next_tooltip = "To next page";
            this.lang.to_last_tooltip = "To last page";
            this.lang.page_size_tooltip = "Records per page";
        }

        if(this.options.lang == "ru"){
            this.lang.no_records = "Нет записей";
            this.lang.edit_cell = "Правка";
            this.lang.delete_cell = "Удалить";
            this.lang.add_record = "Добавить";
            this.lang.save_record = "Сохранить";
            this.lang.cancel = "Отменить";
            this.lang.delete_confirm = "Удалить запись?";
            this.lang.no_select = "[Любой]";
            this.lang.on_one_page = " На одной странице: ";
            this.lang.records = "Записей на текущей странице";
            this.lang.from = "из";
            this.lang.all_records = "Все";
            this.lang.server_side_error = "Ошибка на стороне сервера";
            this.lang.error = "Ошибка: ";
            this.lang.add_tooltip = "Добавить запись";
            this.lang.reload_tooltip = "Перезагрузить страницу";
            this.lang.expand_tooltip = "Открыть подтаблицу";
            this.lang.sort_tooltip = "Сортировать по этому столбцу";
            this.lang.edit_tooltip = "Изменить запись";
            this.lang.delete_tooltip = "Удалить запись";
            this.lang.select_all_tooltip = "Выбрать все";
            this.lang.to_first_tooltip = "На первую страницу";
            this.lang.to_prev_tooltip = "На предыдущую страницу";
            this.lang.current_page_tooltip = "Текущая страница";
            this.lang.to_next_tooltip = "На следующую страницу";
            this.lang.to_last_tooltip = "На последнюю страницу";
            this.lang.page_size_tooltip = "Записей на страницу";

        }

        if(typeof(jQuery.datetimepicker) != 'undefined'){
            jQuery.datetimepicker.setLocale(this.options.lang);
        }

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
        elem.css('overflow-x','auto');
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

        if(this.data.length == 0){
            $('<tr><td style="text-align:center;" colspan="'+this.visible_columns()+'">&nbsp;</td></tr>').appendTo(this.tbody);
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
     * Returns selected with CCheckboxColumn records list.
     * @method selected_records
     * @return {Array} of records
     *
     */

    selected_records(){
        var selected_records = [];
        this.body_records.forEach(function(record){
            if (record.is_selected()){
                selected_records.push(record);
            }
        });
        return selected_records;
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
     * Add predefined field value for all insert, update and delete requests in this table.
     * @method add_predefined_field
     * @param {String} column Column name.
     * @param {String} value Column value.
     *
     */

    add_predefined_field(column, value){
        this.predefined_fields[column] = value;
    }

    /**
     * Loading cover control.
     * @method loading_screen
     * @param {Boolean} state Loading cover on/off.
     *
     */

    loading_screen(state){
        if(state){
            if(this.elem.find('.ctable-progress').length != 0) return;

            var pos_tbody = this.tbody.offset();
            var width_tbody = this.tbody.width();
            var height_tbody = this.tbody.height();

            $('<div class="ctable-progress" style="top:'+pos_tbody.top+'px; left:'+pos_tbody.left+'px; width:'+width_tbody+'px; height:'+height_tbody+'px;" ><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></div>').appendTo($(this.elem));
        } else {
           this.elem.find('.ctable-progress').remove();
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

        var select_method = "GET";

        if(typeof(this.options.select_method) != "undefined"){
            select_method = this.options.select_method;
        }

        this.loading_screen(true);

        $.ajax({
            type: select_method,
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
                alert(self.lang.error + data.Message);
            }
         })
         .fail(function() {
             alert(self.lang.server_side_error);
         })
         .always(function() {
             self.loading_screen(false);
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

        var editor_data = record.editor_values();

        if (editor_data == null) return;

        var record_data = Object.assign({}, editor_data, this.predefined_fields);

        this.loading_screen(true);

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
                alert(self.lang.error + data.Message);
            }

        }, "json")
        .fail(function() {
            alert(self.lang.server_side_error);
        })
        .always(function() {
            self.loading_screen(false);
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

        var record_data = Object.assign({}, source_record_data, updated_record_data, this.predefined_fields);

        this.loading_screen(true);

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
                alert(self.lang.error + data.Message);
            }

        }, "json")
        .fail(function() {
            alert(self.lang.server_side_error);
        })
        .always(function() {
            self.loading_screen(false);
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

        var record_data = Object.assign({}, self.data[record.data_index], this.predefined_fields);

        this.loading_screen(true);

        $.ajax({
            type: "POST",
            url: this.options.endpoint,
            data: {"delete":JSON.stringify(record_data)},
            dataType: 'json'
        })
        .done(function(data) {
            if (data.Result == 'OK') {
                self.select();
            } else {
                alert(self.lang.error + data.Message);
            }

        }, "json")
        .fail(function() {
            alert(self.lang.server_side_error);
        })
        .always(function() {
            self.loading_screen(false);
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

            var select_method = "GET";

            if(typeof(this.options.select_method) != "undefined"){
                select_method = this.options.select_method;
            }

            $.ajax({
                type: select_method,
                url: query_endpoint,
                data: {"options":str_params},
                dataType: 'json'
            })
            .done(function(data) {
                if (data.Result == 'OK') {
                    self.options_url_cache[str_params] = data.Options;
                    on_options_loaded(self.options_url_cache[str_params]);
                } else {
                    alert(self.lang.error + data.Message);
                }

            }, "json")
            .fail(function() {
                alert(self.lang.server_side_error);
            });
        }

    }

}

 
