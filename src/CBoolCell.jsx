class CBoolCell extends Component{

    render() {
        return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : (this.props.value ? _("Yes") : _("No")) }</>
    }
}