/**
 * Select column.
 *
 * @arg this.props.column.options {Array} Array of pairs of strings `[option, label]`
 * @arg this.props.column.single_select {Boolean} Show only single value
 *
 * @arg this.props.value {String} Value in format `id1;id2;id3`
 *
 */

class CSelectCell extends Component {
    render() {
        var self = this;
        if (self.props.value === null) {
            return <span class="has-text-grey">NULL</span>;
        } else {
            if (self.props.column.single_select || self.props.column.single_select === undefined) {
                var labels = self.props.column.options.filter(x => x.value == this.props.value).map(x => x.label);
                return <>{labels.length == 0 ? <span class="tag">{this.props.value}</span> : <span class="tag">{String(labels[0])}</span>}</>
            } else {
                return self.props.value.split(";").map(item => {
                    var labels = self.props.column.options.filter(x => x.value == item).map(x => x.label);
                    return <>{labels.length == 0 ? <span class="tag">{item}</span> : <span class="tag">{String(labels[0])}</span>}</>
                })
            }
        }
    }
}

ctable_register_class("CSelectCell", CSelectCell);
