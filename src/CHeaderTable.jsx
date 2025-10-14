/**
 * Table head class.
 *
 * This class render header table. This is stateless class.
 *
 * @arg this.props.width {int} Link to CTable state width
 * @arg this.props.fontSize {int} Link to CTable state fontSize
 * @arg this.props.columns {Array} Link to CTable state table_columns
 * @arg this.props.view_columns {Array} Link to CTable state view_columns
 * @arg this.props.view_sorting {Array} Link to CTable state view_columns
 * @arg this.props.onHeaderXScroll {function} Link to CTable action handler
 *
 */

class CHeaderTable extends Component {

    constructor() {
        super();

        this.onHeaderClick = this.onHeaderClick.bind(this);
    }


    onHeaderClick(x){
        var th = unwind_th(x);
        var colname = th.dataset["column"];

        var col = this.props.columns.filter(y => y.name == colname)[0];
        if(col.sorting === false) return;

        var newcol = this.props.table.state.view_sorting;
        newcol.forEach(y => {if (y.name == colname){
            if (y.sorting == ""){
                y.sorting = "asc";
                return;
            }
            if (y.sorting == "asc"){
                y.sorting = "desc";
                return;
            }
            if (y.sorting == "desc"){
                y.sorting = "";
                return;
            }
        }});
        this.props.table.state.view_sorting = newcol;
        this.props.table.onSortingChange();

    }

    render() {

        var self = this;

        return  <div class="ctable-scroll-head-table pl-3 pr-3" onScroll={self.props.onHeaderXScroll}>
        {self.props.progress ? <progress class="progress is-small is-primary ctable-progress" max="100" style={sty("width", self.props.width+"em")}></progress> :
        <progress class="progress is-small is-primary ctable-progress" max="100" value="0" style={sty("width", self.props.width+"em")}></progress> }
        <table class="ctable-head-table" style={sty("width", self.props.width+"em", "font-size", self.props.fontSize+"%")}>
        <colgroup>
        {self.props.view_columns.map(x =>{
            if (x.enabled){
                return self.props.columns.filter(y => y.name == x.name).map(x =>
                <col span="1" style={sty("width", x.width+"em")} />
                )[0];
            }
        })}
        </colgroup>
        <thead>
        <tr>
        {self.props.view_columns.map(x =>{
            if (x.enabled){
                var sorting = this.props.view_sorting.filter(y => y.name == x.name).map(x => x.sorting)[0];
                var filtering = this.props.view_filtering.filter(y => y.column == x.name).length > 0;


                return self.props.columns.filter(y => y.name == x.name).map(x =>
                <th data-column={x.name} onClick={self.onHeaderClick}>{sorting == "asc" ? <span class="material-symbols-outlined-small">arrow_upward</span> : ""}{sorting == "desc" ? <span class="material-symbols-outlined-small">arrow_downward</span> : ""}{filtering ? <span class="material-symbols-outlined-small">filter_alt</span> : ""} {x.label}</th>
                )[0];
            }
        })}
        </tr>
        </thead>
        </table>
        </div>;
    }
}
