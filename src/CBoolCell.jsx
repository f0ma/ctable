/**
 * Boolean value cell.
 *
 * @arg this.props.value {Boolean} Value.
 *
 */

class CBoolCell extends Component{

    render() {
        return <span class="tag">{this.props.value === null ? <span class="has-text-grey">NULL</span> : (this.props.value ? _("Yes") : _("No")) }</span>;
    }
}
