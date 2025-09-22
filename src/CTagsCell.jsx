class CTagsCell extends Component {
    render() {
        var self = this;
        if (self.props.value === null) {
            return <span class="has-text-grey">NULL</span>;
        } else {
            if (self.props.column.options === undefined) {
                if (self.props.column.singl_tag) {
                    if (self.props.value.length < self.props.column.max_length) {
                        return <span class="tag">{self.props.value}</span>;
                    } else {
                        return <span class="tag" title={self.props.value}>{self.props.value.slice(0, self.props.column.max_length) + "..."}</span>;
                    }
                } else {
                    return self.props.value.split(";").map(item => {
                        if (item.length < self.props.column.max_length) {
                            return <span class="tag">{item}</span>;
                        } else {
                            return <span class="tag" title={item}>{item.slice(0, self.props.column.max_length) + "..."}</span>;
                        }
                    })
                };
            } else {
                if (self.props.column.singl_tag) {
                    var labels = self.props.column.options.filter(x => x.value == this.props.value).map(x => x.label);
                    if (labels[0].length < self.props.column.max_length) {
                        return <span class="tag">{labels[0]}</span>;
                    } else {
                        return <span class="tag" title={labels[self.props.value]}>{labels[0].slice(0, self.props.column.max_length) + "..."}</span>;
                    }
                } else {
                    return self.props.value.split(";").map(item => {
                        var labels = self.props.column.options.filter(x => x.value == this.props.value).map(x => x.label);
                        if (labels[0].length < self.props.column.max_length) {
                            return <span class="tag">{labels[0]}</span>;
                        } else {
                            return <span class="tag" title={labels[0]}>{labels[0].slice(0, self.props.column.max_length) + "..."}</span>;
                        }
                    })
                }
            }
        }
    }
}
