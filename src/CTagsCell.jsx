class CTagsCell extends Component {
    render() {
        var self = this;
        if (self.props.value === null) {
            return <span class="has-text-grey">NULL</span>;
        } else {
            self.props.value = self.props.value.split(";")
            return self.props.value.map(item => {
                if (item == "") { return "";
                } else if (self.props.column.max_length === undefined || item.length <= self.props.column.max_length) {
                    return <span class="tag">{item}</span>;
                } else {
                    return <span class="tag" title={item}>
                        {item.slice(0, self.props.column.max_length) + "..."}
                    </span>;
                }
            })
        }
    }
}
