/**
 * Number cell
 *
 * @arg this.props.column.actor_type {String} Number format. Allowed values: `Integer`, `Float`, `Money`
 *
 * @arg this.props.colum.dec_places {Integer} Digits after the decimal point.
 * 
 * @arg this.props.column.locale {String} Display format (BCP-47)
 * 
 * @arg this.props.value {Float} Value.
 *
 */

class CNumbersCell extends Component {

    render() {
        if (this.props.value === null) {
            return <span class="has-text-grey">NULL</span>;
        }

        var deciminal_places = (this.props.column.dec_places === undefined ? 2 : this.props.column.dec_places);
        var accepted_types = ["Integer", "Float", "Money"];

        const moneyFormatter = new Intl.NumberFormat((this.props.column.locale === undefined ? "ru-RU" : this.props.column.locale), {minimumFractionDigits: deciminal_places,
            maximumFractionDigits: deciminal_places, style: 'decimal'});

        if (accepted_types.includes(this.props.column.actor_type)){
            if(this.props.column.actor_type == "Integer"){
                return <>{Number(this.props.value).toFixed(0)}</>;
            }
            else if(this.props.column.actor_type == "Float"){
                return <>{Number(this.props.value).toFixed(deciminal_places)}</>;
            }
            else if(this.props.column.actor_type == "Money"){
                return <>{moneyFormatter.format(this.props.value)}</>;
            }
        }
    }
}
