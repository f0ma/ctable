class CNumbersCell extends Component {

    render() {
        var accepted_types = ["Integer", "Float", "Money"];

        const moneyFormatter = new Intl.NumberFormat("ru-RU", {minimumFractionDigits: 2,
            maximumFractionDigits: 2, style: 'decimal'});

        if (accepted_types.includes(this.props.column.actor_type)){
            if(this.props.column.actor_type == "Integer"){
                return <>{Number(this.props.value).toFixed(0)}</>;
            }
            else if(this.props.column.actor_type == "Float"){
                return <>{Number(this.props.value).toFixed(2)}</>;
            }
            else if(this.props.column.actor_type == "Money"){
                return <>{moneyFormatter.format(this.props.value)}</>;
            }
        } else if (this.props.value === null) {
                return <span class="has-text-grey">NULL</span>;
            }
    }
}