class CSelectCell extends Component {

    render() {
        var labels = this.props.column.options.filter(x => x.value == this.props.value).map(x => x.label);
        return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : (labels.length == 0 ? <span class="has-text-grey">{this.props.value}</span> : String(labels[0]))}</>;
    }
}
