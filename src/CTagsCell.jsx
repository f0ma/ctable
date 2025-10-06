/**
 * Multiline plain text column.
 *
 * @arg this.props.column.options {Array} Array of pairs of strings `[tag, label]`
 * @arg this.props.column.max_length {Integer} Maximum label length for display in symbols.
 *
 * @arg this.props.value {String} Tags string in format `tag1;tag2;tag3`
 *
 */

class CTagsCell extends Component {
    render() {
        var self = this;
        if (self.props.value === null) {
            return <span class="has-text-grey">NULL</span>;
        } else {
            self.props.value = self.props.value.split(";")
            return self.props.value.map(item => {
                if (item == "") { return ""};
                var item_label = item;
                var item_label_list = self.props.column.options.filter(x => x[0] == item);
                if (item_label_list.length > 0){
                    item_label = item_label_list[0][1];
                }
                if (self.props.column.max_length === undefined || item_label.length <= self.props.column.max_length) {
                    return <span class="tag">{item_label}</span>;
                } else {
                    return <span class="tag" title={item_label}>
                        {item_label.slice(0, self.props.column.max_length) + "..."}
                    </span>;
                }
            })
        }
    }
}
