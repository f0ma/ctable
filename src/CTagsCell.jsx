class CTagsCell extends Component {

    render() {
        var self = this;
        if (this.props.singl_tag){
            if (this.props.value.length < this.props.column.max_length){
                return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : <span class="my-tag">this.props.value</span>}</>;
            } else {
                return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : <span title={this.props.value}>{this.props.value.slice(0, this.props.column.max_length) + "..."}</span>}</>;
            }
        } else {
            return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : this.props.value.split(";").map(item => {
                if(item.length < this.props.column.max_length){
                    return <span class="my-tag">{item}</span>
                } else {
                    return <span class="my-tag" title={item}>{item.slice(0, this.props.column.max_length) + "..."}</span>
                }
            })}</>;
        }
    }
}
