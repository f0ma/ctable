/**
 * Plain text column.
 *
 * @arg this.props.value {String} Value.
 *
 */

class CPlainTextCell extends Component {

    render() {
        return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : String(this.props.value)}</>;
    }
}
