/**
 * Base column class.
 *
 * This basic implementation can make search and sorting.
 *
 * @arg this.props.role {string} Control role: 'header', 'search', 'cell', 'footer', 'editor'.
 * @arg this.props.column {int} Currnet column index.
 * @arg this.props.row {int} Currnet row index, -1 for new row.
 * @arg this.props.tab {int} Editor page, -1 for show on all pages.
 * @arg this.props.sorting {undefined|string} Column sorting order: 'ASC', 'DESC' or ''. No sorting in `undefined`.
 * @arg this.props.searching {undefined|string} Column searching: query string or ''. No search in `undefined`.
 * @arg this.props.exact {undefined|boolean} Search only on exact match.
 */

class CTableColumn extends Component {

    /**
     * Trivial constructor. Call super() to create Component correctly.
     */
    constructor() {
        super();

        this.searchCleared = this.searchCleared.bind(this);
        this.searchChanged = this.searchChanged.bind(this);
        this.sortingChanged = this.sortingChanged.bind(this);
    }

    componentDidMount() {
        this.setState({searching: this.props.search});
    }

    searchCleared(e) {
        this.setState({searching: null});
        if(typeof this.props.exact === 'undefined' || this.props.exact == false){
            this.props.table.change_search_for_column(this.props.column, null);
        } else {
            this.props.table.change_filter_for_column(this.props.column, null);
        }
    }

    searchChanged(e) {
        if (e.target.value === "") {
            this.searchCleared(e);
            return;
        }
        this.setState({searching: e.target.value});
        if(typeof this.props.exact === 'undefined' || this.props.exact == false){
            this.props.table.change_search_for_column(this.props.column, e.target.value);
        } else {
            this.props.table.change_filter_for_column(this.props.column, e.target.value);
        }
    }

    sortingChanged(e) {
        var order = null;
        if (this.props.sorting == 'ASC'){
            order = 'DESC';
        } else if (this.props.sorting == 'DESC'){
            order = null;
        } else if (this.props.sorting == null){
            order = 'ASC';
        }
        this.props.table.change_sort_for_column(this.props.column, order);
    }

    /**
     * Build search bar for column.
     *
     * For override in subclesses.
     *
     * @return {PreactNode} Search control.
     */

    render_search() {
        if (typeof this.props.searching === 'undefined') {
            // do nothing
        } else {
            return <div class="control has-icons-right">
                       <input class="input" value={this.state.searching} onChange={this.searchChanged} type="text"/>
                       <span class="icon is-small is-right" style="pointer-events: all; cursor: pointer" onClick={this.searchCleared}><span class="material-icons">cancel</span></span>

                   </div>
        }
    }

    /**
     * Build header of column.
     *
     * For override in subclesses.
     *
     * @return {PreactNode} Header control.
     */

    render_header() {
        if (typeof this.props.sorting === 'undefined') {
            return <b>{this.title()}</b>;
        } else {
            var arrow = '';
            if (this.props.sorting == 'ASC'){
                arrow = '↓';
            } else if (this.props.sorting == 'DESC'){
                arrow = '↑';
            } else if (this.props.sorting == null){
                arrow = '⇵';
            }
            return <b><a onClick={this.sortingChanged}><span class="icon" style="display:inline">{arrow}</span>&nbsp;{this.title()}</a></b>;
        }
    }

    /**
     * Return current cell value.
     *
     * For use in subclesses.
     *
     * @return {*} Current cell value, default for new record or null if default is not set.
     */

    value() {
        var self = this;

        var changes = this.props.table.changes.filter(function(item){return item[0] == self.props.row && item[1] == self.props.column;});

        if(changes.length == 1){
            return changes[0][2];
        }

        if (this.props.row >= 0){
            return this.props.table.state.records[this.props.row][this.props.table.state.columns[this.props.column].name];
        }
        if (typeof this.props.table.state.columns[this.props.column].default === 'undefined'){
            return null;
        } else {
            return this.props.table.state.columns[this.props.column].default;
        }
    }

    /**
     * Return current row values.
     *
     * For use in subclesses.
     *
     * @return {Object|null} Current row dictionary.
     */

    row() {
        if (this.props.row >= 0){
            return this.props.table.state.records[this.props.row];
        }
        return null;
    }

    /**
     * Return column name.
     *
     * For use in subclesses.
     *
     * @return {string} Current column name.
     */

    name() {
        return this.props.table.state.columns[this.props.column].name;
    }

    /**
     * Return column title.
     *
     * For use in subclesses.
     *
     * @return {string} Current column title.
     */

    title() {
        return this.props.table.state.columns[this.props.column].title;
    }

    /**
     * Build view cell of table.
     *
     * For override in subclesses.
     *
     * @return {PreactNode} Header control.
     */

    render_cell() {
        return <span>{this.value()}</span>;
    }

    /**
     * Build editor control for cell.
     *
     * For override in subclesses.
     *
     * @return {PreactNode} Editor control: `div` with `class="field"`.
     */

    render_editor(){
    }

    /**
     * Build footer of column.
     *
     * For override in subclesses.
     *
     * @return {PreactNode} Footer control.
     */

    render_footer() {
    }

    /**
     * Callback called if changes in another editor happens.
     *
     * For use in subclesses with `CTable.notify_changes` and `CTable.subscribe_to_changes`.
     *
     * @param {int} row Affected row
     * @param {int} col Affected column
     * @param {*} value New value
     */

    on_changes(row, col, value) {
    }

    /**
     * Main render method.
     *
     * Call specific method by this.props.role.
     *
     * @return {PreactNode} Cell control.
     */

    render() {
        if(this.props.role == 'header'){
            return this.render_header();
        }
        if(this.props.role == 'search'){
            return this.render_search();
        }
        if(this.props.role == 'footer'){
            return this.render_footer();
        }
        if(this.props.role == 'cell'){
            return this.render_cell();
        }
        if(this.props.role == 'editor'){
            return this.render_editor();
        }
    }
}
