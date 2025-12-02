/**
 * Multiple links column.
 *
 * @arg this.props.column.cell_link {String} Table name for linking.
 * @arg this.props.column.cell_show_as_tag {Bool} Disable Tag css element.
 *
 * @arg this.props.value {String} Links string in format `id1;id2;id3`
 *
 */

class CMultiLinkCell extends Component {

    render() {

        var table = this.props.column.cell_link;

        if(this.props.value === "")
            return "";

        if(this.props.value === null)
            return <span class="has-text-grey">NULL</span>;

        return this.props.value.split(';').map(x => {return parseInt(x)}).map(x => {
            var view = "";

            if (x in this.props.options[table]){
                view = <span class={cls(this.props.column.cell_show_as_tag === false ? "" : "tag")} title={String(this.props.options[table][x])+" ("+x+")"}>{String(this.props.options[table][x])}</span>;
            } else {
                view = <span class={cls("has-text-grey", this.props.column.cell_show_as_tag === false ? "" : "tag")}>{"("+x+")"}</span>;
            }

            return view;
        });
    }
}

ctable_register_class("CMultiLinkCell", CMultiLinkCell);
