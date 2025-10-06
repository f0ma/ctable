/**
 * Multiline plain text column.
 *
 * @arg this.props.column.max_length {Integer} Maximum length for display in symbols.
 *
 * @arg this.props.value {String} Text.
 *
 */

class CMultilineTextCell extends Component {
    render() {
        var self = this;
        return<>{self.props.value === null ? 
            <span class="has-text-grey">NULL</span> : 
            <span 
            title={self.props.value.length <= self.props.column.max_length ? "" : String(self.props.value)}
            >
                {self.props.value.slice(0, self.props.column.max_length) + (self.props.value.length > self.props.column.max_length ? "..." : "")}
            </span>}
        </>
    }
}
