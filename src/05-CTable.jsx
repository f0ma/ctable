/**
 * Main component.
 *
 * Includes server interaction logic, pagination, and other.
 *
 * @arg {string} this.props.endpoint - Url to endpoint.
 * @arg {Object} this.props.params - Additional parameters to select query
 * @arg {undefined|Boolean} this.props.no_pagination - Disable pagination.
 * @arg {Object} this.props.filters - Set presistent filter as column => value.
 * @arg {Object[]} this.props.columns -  List of columns. Each column will be passed as props to column object.
 * @arg {string} this.props.columns[].name - Name of column.
 * @arg {string} this.props.columns[].title - Title of column.
 * @arg {Class} this.props.columns[].kind - Column class derived from CTableColumn.
 * @arg {string} this.props.columns[].footnote - Footnote for column editor.
 */

class CTable extends Component {
    constructor() {
        super();
        this.state = {
            records:[],

            columns: [],
            endpoint: '',

            opened_editors:[],
            opened_subtables:[],

            current_page: 0,
            records_on_page: 25,
            total_records: 0,
            total_pages: 0
        };

        this.changes = [];
        this.valids = [];
        this.changes_handlers = [];
        this.subtables_params = {};
        this.options_cache = {};
    }

    componentDidMount() {
        this.state.columns = this.props.columns;
        this.state.endpoint = this.props.endpoint;
        this.setState({});
        this.reload();
    }

    /**
     * Getting column index by column name.
     *
     * For call from column class.
     *
     * @param {string} name - Column name.
     * @returns {int|null} Column index in current table or `null`.
     */

    column_by_name(name){
        for(var i = 0; i < this.props.columns.length; i++){
            if(this.props.columns[i].name == name){
                return i;
            }
        }
        return null;
    }

    /**
     * Open subtable in table.
     *
     * For call from column class.
     *
     * @param {int} row - Row index.
     * @param {List[]} keys - Constrains for subtable.
     * @param {string} keys[].0 - Subtable column name.
     * @param {string} keys[].1 - Current table column name which value will be used as constrain.
     * @param {Object} config - Subtable props including columns.
     */

    open_subtable(row, keys, config){
        if (this.state.opened_subtables.includes(row)){
            this.state.opened_subtables = this.state.opened_subtables.filter(item => item !== row);
        } else {
            this.state.opened_subtables.push(row);
            this.subtables_params[row] = config;
            self = this;
            this.subtables_params[row].filters = keys.map(item => [item[0], self.state.records[row][item[1]]]);
        }
        this.setState({});
    }

    /**
     * Toggle row editor interface.
     *
     * For call from column class.
     *
     * @param {int} row - Row number. `-1` for new record.
     */

    edit_row(row){
        var self = this;
        if (this.state.opened_editors.includes(row)){
            this.state.opened_editors = this.state.opened_editors.filter(item => item !== row);
            this.changes = this.changes.filter(item => !(item[0] == row));
        } else {
            this.state.opened_editors.push(row);
            if (row < 0){
                this.state.columns.map(function (item, i) {
                    if (typeof self.state.columns[i].default !== 'undefined'){
                        self.changes.push([row, i,  self.state.columns[i].default]);
                    }
                });
            }
        }
        this.setState({});
    }

    /**
     * Delete row action.
     *
     * For call from column class. Reload table.
     *
     * @param {int} row - Row number.
     */

    delete_row(row){
        var xkeys = {};
        var self = this;

        this.state.columns.map(function (item, i) {
            if(item.is_key == true){
                xkeys[item.name] = self.state.records[row][item.name];
            }

        });

        fetch(this.props.endpoint, { method: "POST", body: 'delete='+JSON.stringify(xkeys),
                                     headers: {'Content-Type':'application/x-www-form-urlencoded'} })
        .then(function(response){
            if (response.ok) { return response.json(); }
            else { alert(self.props.lang.server_error + response.status); } })
        .then(function (result) {
            if (!result) return;
            if(result.Result == 'OK'){
                self.options_cache = {};
                self.state.opened_editors = self.state.opened_editors.filter(item => item !== row);
                self.reload();
            } else {
                alert(self.props.lang.error + result.Message);
            }
        });
    }

    /**
     * Save row action.
     *
     * For call from column class. Reload table.
     *
     * @param row {int} Row number. `-1` for new record.
     */

    save_row(row){
        if(this.valids.filter(item => item[0] == row).filter(item => item[2] == false).length > 0)
            return;
        if(this.changes.length == 0)
            return;

        var xvalues = {};
        var self = this;
        var cmd = 'update=';

        if (row >= 0){
            this.state.columns.map(function (item, i) {
                if(item.is_key == true){
                    xvalues[item.name] = self.state.records[row][item.name];
                }
            });
            this.changes.filter(item => (item[0] == row)).map(function (item) {
                if(self.state.columns[item[1]].name != ''){
                    xvalues[self.state.columns[item[1]].name] = item[2];
                }
            });
        } else {
            cmd = 'insert=';
            this.changes.filter(item => (item[0] == row)).map(function (item) {
                if ((!self.state.columns[item[1]].is_key) && (self.state.columns[item[1]].name != '')){
                    xvalues[self.state.columns[item[1]].name] = item[2];
                }
            });
        }

        if (typeof this.props.filters !== 'undefined'){
            this.props.filters.forEach((item) => xvalues[item[0]] = item[1]);
        }

        fetch(this.props.endpoint, { method: "POST", body: cmd+JSON.stringify(xvalues),
                                     headers: {'Content-Type':'application/x-www-form-urlencoded'} })
        .then(function(response){
            if (response.ok) {return response.json();}
            else {alert(self.props.lang.server_error + response.status)} })
        .then(function (result) {
            if (!result) return;
            if(result.Result == 'OK'){
                self.options_cache = {};
                self.state.opened_editors = self.state.opened_editors.filter(item => item !== row);
                self.reload();
            } else {
                alert(self.props.lang.error + result.Message);
            }
        });
    }

    /**
     * Change filtering for column.
     *
     * For call from column class. Reload table.
     *
     * @param col {int} Column number.
     * @param value {*} Filter value.
     */

    change_filter_for_column(col, value){
        this.state.columns[col].filtering = value;
        this.reload();
    }

    /**
     * Change searching for column.
     *
     * For call from column class. Reload table.
     *
     * @param col {int} Column number.
     * @param value {*} Search value.
     */

    change_search_for_column(col, value){
        this.state.columns[col].searching = value;
        this.reload();
    }

    /**
     * Change sorting for column.
     *
     * For call from column class. Reload table.
     *
     * @param col {int} Column number.
     * @param value {string} Sort order: "ASC", "DESC" and "" for no sorting.
     */

    change_sort_for_column(col, value){
        this.state.columns[col].sorting = value;
        this.reload();
    }

    /**
     * Notify that value in editor is changed.
     *
     * Value stored in table cache and will be sended then `save_row` called.
     * All subscribed widgets will be notifed by `on_changes` call.
     *
     * For call from column class.
     *
     * @param col {int} Column number.
     * @param row {int} Row number. -1 in new row.
     * @param value {*} Value.
     */

    notify_changes(row, col, value){
        this.changes = this.changes.filter(item => !( (item[0] == row) && (item[1] == col) ));
        this.changes.push([row, col, value]);
        this.changes_handlers = this.changes_handlers.filter(item => item[2].current != null);
        this.changes_handlers.filter(item => ((item[0] == row) && (item[1] == col))).map(item => item[3].on_changes(row, col, value));
    }

    /**
     * Notify that value in editor is valid or invalid.
     *
     * If any editor notified about invalid value, row will not be saved.
     *
     * For call from column class.
     *
     * @param col {int} Column number.
     * @param row {int} Row number. -1 in new row.
     * @param is_valid {Boolean} Validation status.
     */

    notify_valids(row, col, is_valid){
        this.valids = this.valids.filter(item => !( (item[0] == row) && (item[1] == col) ));
        this.valids.push([row, col, is_valid]);
    }

    /**
     * Subscribe editor to notification about other column changed.
     *
     * Editor should provide ref for unsubscribe if closed.
     *
     * For call from column class.
     *
     * @param row {int} Current row number. -1 in new row.
     * @param col {int} Observed column number.
     * @param ref {PreactRef} Reference to editor.
     * @param obj {CTableColumn} Object to interact.
     */

    subscribe_to_changes(row, col, ref, obj){
        this.changes_handlers.push([row, col, ref, obj]);
    }

    /**
     * Reloading table data.
     */

    reload() {
        if(this.state.columns.length == 0) return;

        var column_filters = {};
        var column_searches = {};
        var column_orders = {};

        var self = this;

        if (typeof this.props.filters !== 'undefined'){
            this.props.filters.forEach((item) => column_filters[item[0]] = item[1]);
        }

        this.state.columns.forEach((item) => ((item.name != '') && (item.filtering)) ? column_filters[item.name] = item.filtering : '');

        this.state.columns.forEach((item) => ((item.name != '') && (item.searching)) ? column_searches[item.name] = item.searching : '');
        this.state.columns.forEach((item) => ((item.name != '') && (item.sorting)) ? column_orders[item.name] = item.sorting : '');

        var query = {start:(this.props.no_pagination ? 0 : this.state.records_on_page*this.state.current_page),
                     page:(this.props.no_pagination ? 0 : this.state.records_on_page),
                     column_filters:column_filters, column_searches:column_searches, column_orders:column_orders};


        var query_params = new URLSearchParams({select : JSON.stringify(query), ...this.props.params});

        fetch(this.props.endpoint + '?' + query_params.toString())
        .then(function(response){
            if (response.ok) {return response.json();}
            else {alert(self.props.lang.server_error + response.status)} })
        .then(function (result) {
            if (!result) return;
            if(result.Result == 'OK'){
                self.changes = [];
                self.setState({records: result.Records, total_records: result.TotalRecordCount,
                               records_on_page: self.state.records_on_page,
                               current_page: self.state.current_page,
                               opened_editors: [], opened_subtables: [],
                               total_pages: Math.floor(result.TotalRecordCount / self.state.records_on_page) - (result.TotalRecordCount % self.state.records_on_page == 0 ? 1 : 0)
                });
            } else {
                alert(self.props.lang.error + result.Message);
            }
        });


    }

    load_options(endpoint, params, elem, ref) {

        var query_params = new URLSearchParams({options : '{}', ...params});

        var url = endpoint + '?'+ query_params.toString();
        var self = this;
        if (url in this.options_cache){
            if (this.options_cache[url] == null){
                setTimeout(function()
                    {
                        self.load_options(endpoint, params, elem, ref);
                    }, 500);
            } else {
                elem.setState({options: this.options_cache[url]});
            }
        } else {
            this.options_cache[url] = null;
            fetch(url)
            .then(function(response){
                if (response.ok) {return response.json();}
                else {alert(self.props.lang.server_error + response.status)} })
            .then(function (result) {
                if (!result) return;
                if(result.Result == 'OK'){
                    self.options_cache[url] = result.Options;
                    //if(ref.current != null){
                        elem.setState({options: self.options_cache[url]});
                    //}
                } else {
                    alert(self.props.lang.error + result.Message);
                }});
        }

    }

    recordsOnPageChanged = e => {
        this.state.records_on_page = parseInt(e.target.value);
        this.state.current_page = 0;
        this.reload();
    }

    toFirstPage = e => {
        if (this.state.current_page != 0){
            this.state.current_page = 0;
            this.reload();
        }
    }

    toLastPage = e => {
        if (this.state.current_page != this.state.total_pages){
            this.state.current_page = this.state.total_pages;
            this.reload();
        }
    }

    toNextPage = e => {
        if (this.state.current_page < this.state.total_pages){
            this.state.current_page = this.state.current_page + 1;
            this.reload();
        }
    }

    toPrevPage = e => {
        if (this.state.current_page - 1 >= 0){
            this.state.current_page = this.state.current_page - 1;
            this.reload();
        }
    }

    toPage = e => {
        this.state.current_page = parseInt(e.target.value);
        this.reload();
    }


    get_pages(){
        if (this.state.total_records == 0){
            return [0];
        }
        var pages = [];
        for(var i = 0; i <= Math.floor(this.state.total_records / this.state.records_on_page); i++){
            pages.push(i);
        }
        if(this.state.total_records % this.state.records_on_page == 0){
            pages.pop();
        }
        return pages;
    }

    /**
     * Return count of visible columns.
     */

    visible_column_count() {
        return this.state.columns.filter(c => c.hide_column != true).length;
    }

    render() {

        var tbody= <tbody>
                    {this.state.opened_editors.includes(-1) ? <tr><td colspan={this.visible_column_count()}>
                        {
                        this.state.columns.map((column,j) => <>
                            {column.hide_editor != true ? h(column.kind, { role: "editor", is_new:true, table: this, column: j, row: -1, key: j*1000000, ...column }) : ''}
                        </> )
                        }
                        </td></tr> : ''}
                    {this.state.records.map((cell,i) => <><tr  class={(this.state.opened_editors.includes(i) || this.state.opened_subtables.includes(i)) ? "is-selected" : ""} > {
                        this.state.columns.map((column,j) => (column.hide_column != true ? <td>                           {h(column.kind, { role: "cell", table: this, column: j, row: i, key: j*1000000+i, ...column })}</td> : ''))
                        } </tr>
                        {this.state.opened_editors.includes(i) ? <tr><td colspan={this.visible_column_count()}>
                        {
                        this.state.columns.map((column,j) => <>
                            {column.hide_editor != true ? h(column.kind, { role: "editor", is_new:false, table: this, column: j, row: i, key: j*1000000+i, ...column }) : ''}
                        </> )
                        }
                        </td></tr> : ''}
                        {this.state.opened_subtables.includes(i) ? <tr><td colspan={this.visible_column_count()}>
                        {h(CTable, {lang:this.props.lang, ...this.subtables_params[i]})}
                        </td></tr> : ''}
                        </> ) }
                        {this.state.records.length == 0 ? <tr><td colspan={this.visible_column_count()}><div class="has-text-centered">{this.props.lang.no_data}</div></td></tr> : ''}
                </tbody>;

        var pager = <div class="field has-addons" style="justify-content:center;">
                        <div class="control">
                            <div class="button" onClick={this.toFirstPage} title={this.props.lang.to_first_page}><span class="icon">⇤</span></div>
                        </div>
                        <div class="control">
                            <div class="button" onClick={this.toPrevPage} title={this.props.lang.to_prev_page}><span class="icon">←</span></div>
                        </div>
                        <div class="control">
                            <div class="select">
                                <select value={this.state.current_page} onChange={this.toPage}>
                                    {this.get_pages().map((page) => <option value={page}>{page+1}</option>)}
                                </select>
                            </div>
                        </div>
                        <div class="control">
                            <div class="button" onClick={this.toNextPage} title={this.props.lang.to_next_page}><span class="icon">→</span></div>
                        </div>
                        <div class="control">
                            <div class="button" onClick={this.toLastPage} title={this.props.lang.to_last_page}><span class="icon">⇥</span></div>
                        </div>
                        <div class="control">
                            <div class="button">{this.props.lang.show_by}</div>
                        </div>
                        <div class="control">
                            <div class="select">
                                <select value={this.state.records_on_page} onChange={this.recordsOnPageChanged}>
                                    <option value="2">2</option>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                        <div class="control">
                            <div class="button"> {this.props.lang.current_page} {this.state.current_page+1} {this.props.lang.from} {this.state.total_pages+1}.</div>
                        </div>
                    </div>;


        return <div class="table-container">
            <table class="table" style="width: 100%;">
                <thead>
                    <tr>
                        {this.state.columns.map((column,i) => (column.hide_column != true ? <th>{h(column.kind, { role: "header", table: this, column: i, key: i, ...column})} </th>  : '') ) }
                    </tr>
                    <tr>
                        {this.state.columns.map((column,i) => (column.hide_column != true ? <th>{h(column.kind, { role: "search", table: this, column: i, key: i, ...column })} </th> : '') ) }
                    </tr>
                </thead>
                <tfoot>
                    <tr>
                        {this.state.columns.map((column,i) => (column.hide_column != true ? <th>{h(column.kind, { role: "footer", table: this, column: i, key: i, ...column })} </th> : '') ) }
                    </tr>
                </tfoot>
                {tbody}
            </table>
            {this.props.no_pagination ? '' : pager}
        </div>;
    }
}


