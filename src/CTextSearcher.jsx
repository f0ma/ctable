class CTextSearcher extends Comment {
    constructor() {
        super();
    }

    onInputChange(e){
        var line = e.target.value

        if(this.props.column.editor_replace_comma){
            v = v.replace(',', '.');
        }

        this.setState({editor_value: v});
    }

    render() {
        var self = this;
        /*
        return <div class={cls("control", self.state.search_value === null ? "has-icons-left" : "")}>
        <input class={cls("input", self.state.editor_valid ? "" : "is-danger")} type="text" placeholder={self.state.search_value === null ? "NULL" : self.props.column.editor_placeholder} onInput={self.onInputChange}/>
        {self.state.search_value === null ? <span class="icon is-small is-left"><span class="material-symbols-outlined">hide_source</span></span> : "" }
        </div>;
        */
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
                        <input class="input" type="text" value={self.props.value} data-filterindex={self.props.index} onChange={self.props.onValueChange}/>
                    </div>
                    <button class="button is-danger is-soft" data-filterindex={self.props.index} onClick={self.props.onDeleteClick}><span class="material-symbols-outlined">delete</span></button>
                </div>;
    }
}