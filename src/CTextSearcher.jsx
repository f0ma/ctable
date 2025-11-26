class CTextSearcher extends Comment {
    constructor() {
        super();

        this.onInputChange = this.onInputChange.bind(this);
    }

    onInputChange(e){
        var line = e.target.value

        if(this.props.column.editor_replace_comma){
            line = line.replace(',', '.');
        }

        this.props.onValueChange(line, Number(e.target.dataset['filterindex']));
    }

    render() {
        var self = this;
        return  <div>
                    <div class="select">
                        <select value={self.props.column.name} data-filterindex={self.props.index} onChange={self.props.onColumnChange}>
                            {self.props.table.state.table_columns.map(y => {
                                return <option value={y.name}>{y.label}</option>;
                            }) }
                        </select>
                    </div>
                    <div class="select">
                        <select value={self.props.operator ? self.props.operator : "like_lr"} data-filterindex={self.props.index} onChange={self.props.onOperatorChange}>
                            <option value="like_lr">…A…</option>
                            <option value="like_l">…A</option>
                            <option value="like_r">A…</option>
                            <option value="eq">=</option>
                            {self.props.column.editor_allow_null ? <option value="is_null">Is NULL</option> : ""}
                            {self.props.column.editor_allow_null ? <option value="is_not_null">Is not NULL</option> : ""}
                        </select>
                    </div>
                    <div style="display: inline-block;">
                        <input class="input" type="text" value={self.props.value} data-filterindex={self.props.index} onChange={self.onInputChange}/>
                    </div>
                    <button class="button is-danger is-soft" data-filterindex={self.props.index} onClick={self.props.onDeleteClick}><span class="material-symbols-outlined">delete</span></button>
                </div>;
    }
}