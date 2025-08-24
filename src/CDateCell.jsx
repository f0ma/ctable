class CDateCell extends Component {

    render() {
        const DATE = new Date(this.props.value);
        const form = x => String(x).padStart(2, '0');
        return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : `${form(DATE.getFullYear())}-${form(DATE.getMonth()+1)}-${form(DATE.getDate())}`}</>
    }
}