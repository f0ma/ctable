class CNumbersSearcher extends Component {
    constructor(){
        super();

        this.onInputChange = this.onInputChange.bind(this);
    }

    componentDidMount() {
      this.setState({
        search_valid: true,
        search_value: (this.props.value ?? "")
    });
    }

    onInputChange(e){
        var self = this;
        var row = e.target.value;
        row = row.replace(",", ".");
        var value = Number(row);
        if (!Number.isFinite(value)){
            this.setState({search_valid: false, search_value: row});
        } else {
            this.setState({search_valid: true, search_value: value}, () => self.props.onValueChange(this.state.search_value, Number(e.target.dataset['filterindex'])))
        }
    }

    render(){
      var self = this;
      return    <div>
                    <div class="select">
                        <select value={self.props.column.name} data-filterindex={self.props.index} onChange={self.props.onColumnChange}>
                            {self.props.table.state.table_columns.map(y => {
                                return <option value={y.name}>{y.label}</option>;
                            }) }
                        </select>
                    </div>
                    <div class="select">
                        <select value={self.props.operator ? self.props.operator : "like_lr"} data-filterindex={self.props.index} onChange={self.props.onOperatorChange}>
                            <option value="eq">=</option>
                            <option value="neq">!=</option>
                            <option value="ge">&gt;=</option>
                            <option value="gt">&gt;</option>
                            <option value="le">&lt;=</option>
                            <option value="lt">&lt;</option>
                            <option value="in">IN</option>
                            <option value="not_in">NOT IN</option>
                            {self.props.column.editor_allow_null ? <option value="is_null">Is NULL</option> : ""}
                            {self.props.column.editor_allow_null ? <option value="is_not_null">Is not NULL</option> : ""}
                        </select>
                    </div>
                    <div style="display: inline-block;">
                        <input class={cls("input", self.state.search_valid ? "" : "is-danger")} type="text" value={self.state.search_value} data-filterindex={self.props.index} onChange={self.onInputChange}/>
                    </div>
                    <button class="button is-danger is-soft" data-filterindex={self.props.index} onClick={self.props.onDeleteClick}><span class="material-symbols-outlined">delete</span></button>
                </div>;
    }
}