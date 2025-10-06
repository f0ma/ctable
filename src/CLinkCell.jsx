/**
 * Single links column.
 *
 * @arg this.props.column.cell_link {String} Table name for linking.
 *
 * @arg this.props.value {Integer} Links id.
 *
 */

class CLinkCell extends Component {

    render() {

        var table = this.props.column.cell_link;

        var view = "";

        if (this.props.value in this.props.options[table]){
            view = <span class="tag" title={"ID: "+this.props.value}>{String(this.props.options[table][this.props.value])}</span>;
        } else {
            view = <span class="has-text-grey">{"ID: "+this.props.value}</span>;
        }

        return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : view}</>;
    }
}
