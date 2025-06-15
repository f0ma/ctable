/**
 * Table head class.
 *
 * This class render header table. This is stateless class.
 *
 * @arg this.props.width {int} Link to CTable state width
 * @arg this.props.fontSize {int} Link to CTable state fontSize
 * @arg this.props.columns {Array} Link to CTable state table_columns
 * @arg this.props.onHeaderXScroll {function} Link to CTable action handler
 *
 */

class CHeaderTable extends Component {

    render() {

        var self = this;

        return  <div class="ctable-scroll-head-table pl-3 pr-3" onScroll={self.props.onHeaderXScroll}>
        {self.props.progress ? <progress class="progress is-small is-primary ctable-progress" max="100" style={sty("width", self.props.width+"em")}></progress> :
        <progress class="progress is-small is-primary ctable-progress" max="100" value="0" style={sty("width", self.props.width+"em")}></progress> }
        <table class="ctable-head-table" style={sty("width", self.props.width+"em", "font-size", self.props.fontSize+"%")}>
        <colgroup>
        {self.props.columns.filter(x => x.enabled).map(x =>
            <col span="1" style={sty("width", x.width+"em")} />
        )}
        </colgroup>
        <thead>
        <tr>
        {self.props.columns.filter(x => x.enabled).map(x =>
            <th>{x.label}</th>
        )}
        </tr>
        </thead>
        </table>
        </div>;
    }
}
