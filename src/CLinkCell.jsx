class CLinkCell extends Component {

    render() {

        var table = this.props.column.cell_link;

        var view = "";

        if (this.props.value in this.props.options[table]){
            view = String(this.props.options[table][this.props.value]) + ' ('+this.props.value+')';
        } else {
            view = <span class="has-text-grey">{this.props.value}</span>;
        }

        return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : view}</>;
    }
}
