/**
 * Date column.
 *
 * @arg this.props.value {String} Date in SQL format
 *
 */

class CDateCell extends Component {

    render() {
        const date = new Date(this.props.value);
        const form = x => String(x).padStart(2, '0');
        return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : `${form(date.getDate())}.${form(date.getMonth()+1)}.${form(date.getFullYear())}`}</>
    }
}
