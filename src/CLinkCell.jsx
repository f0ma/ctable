/**
 * Single links column.
 *
 * @arg this.props.column.cell_link {String} Table name for linking.
 * @arg this.props.column.cell_show_as_tag {Bool} Disable Tag css element.
 *
 * @arg this.props.value {Integer} Links id.
 *
 */

class CLinkCell extends Component {

    render() {

        var table = this.props.column.cell_link;

        var view = "";

        if (this.props.value in this.props.options[table]){
            view = <span class={cls(this.props.column.cell_show_as_tag === false ? "" : "tag")} title={String(this.props.options[table][this.props.value]) + " (" + this.props.value + ")"}>{String(this.props.options[table][this.props.value])}</span>;
        } else {
            view = <span class={cls("has-text-grey", this.props.column.cell_show_as_tag === false ? "" : "tag")}>{"("+this.props.value+")"}</span>;
        }

        return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : view}</>;
    }
}

ctable_register_class("CLinkCell", CLinkCell);
