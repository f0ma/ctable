/**
 * Plain text column.
 *
 * @arg this.props.value {String} Value.
 *
 */

class CPlainTextCell extends Component {

    render() {
        return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : (this.props.column.allow_html === true ? <div dangerouslySetInnerHTML={{__html: this.props.value}} /> : String(this.props.value))}</>;
    }
}

ctable_register_class("CPlainTextCell", CPlainTextCell);
