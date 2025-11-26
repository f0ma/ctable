class CLinkSearcher extends Component {

    constructor() {
        super();

        this.onSelectDropdownClick = this.onSelectDropdownClick.bind(this);
        this.onOptionsInputChange = this.onOptionsInputChange.bind(this);
        this.onAddLink = this.onAddLink.bind(this);
        this.onRemoveLink = this.onRemoveLink.bind(this);

        this.state = {
            search_value: "",
            select_dropdown_active: false,
            options_history: {},
            options_current: {},
            options_input: "",
            input_id: makeID()
        };
    }

    componentDidMount() {
        this.initializeFromProps(this.props);
        this.loadRemoteOptions("");
    }

    componentDidUpdate(prevProps) {
        if (prevProps.column.name != this.props.column.name || prevProps.column.cell_link != this.props.column.cell_link) {
            this.initializeFromProps(this.props);
            this.loadRemoteOptions("");
            return;
        }

        if (this.normalizeValue(prevProps.value) != this.normalizeValue(this.props.value)) {
            this.setState({search_value: this.normalizeValue(this.props.value)});
        }
    }

    initializeFromProps(props) {
        var base_options = this.getLocalOptions(props);
        this.setState({
            search_value: this.normalizeValue(props.value),
            select_dropdown_active: false,
            options_history: base_options,
            options_current: base_options,
            options_input: ""
        });
    }

    getLocalOptions(props) {
        if (props && props.options && props.column && props.column.cell_link && props.options[props.column.cell_link]) {
            return clone(props.options[props.column.cell_link]);
        }
        return {};
    }

    normalizeValue(value) {
        if (value === null || value === undefined) return "";
        if (Array.isArray(value)) return value.join(";");
        return String(value);
    }

    loadRemoteOptions(query) {
        var self = this;
        var column_name = this.props.column.name;
        this.props.table.getOptionsForField(column_name, query).then(w => {
            if (column_name != self.props.column.name) return;
            var opt = {};
            w.rows.forEach(q => { opt[q[w.keys[0]]] = q[w.label]; });
            self.setState(state => ({
                options_current: opt,
                options_history: {...opt, ...state.options_history}
            }));
        }).catch(() => {});
    }

    getSelectedValues() {
        if (!this.state.search_value) return [];
        return this.state.search_value.split(";").filter(x => x !== "");
    }

    commitValue(value, close_dropdown) {
        var self = this;
        this.setState({
            search_value: value,
            select_dropdown_active: close_dropdown ? false : this.state.select_dropdown_active
        }, () => self.props.onValueChange(value, Number(self.props.index)));
    }

    onRemoveLink(e) {
        var id = unwind_button_or_link(e).dataset['value'];
        var selected = this.getSelectedValues().filter(x => x != id);
        e.stopPropagation();
        this.commitValue(selected.join(";"), false);
    }

    onAddLink(e) {
        var id = unwind_button_or_link(e).dataset['value'];
        var selected = this.getSelectedValues();
        if (!selected.includes(id)) {
            selected.push(id);
            selected.sort((a, b) => {
                var an = Number(a);
                var bn = Number(b);
                if (Number.isFinite(an) && Number.isFinite(bn)) {
                    return an - bn;
                }
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
            });
        }
        this.commitValue(selected.join(";"), true);
    }

    onSelectDropdownClick() {
        var self = this;
        this.setState({select_dropdown_active: !this.state.select_dropdown_active}, () => {
            if (self.state.select_dropdown_active) {
                document.getElementById(self.state.input_id).focus();
            }
        });
    }

    onOptionsInputChange(e) {
        var self = this;
        this.setState({options_input: e.target.value}, () => {
            self.loadRemoteOptions(self.state.options_input);
        });
    }

    renderValueSelector() {
        var self = this;

        if (self.props.operator == "is_null" || self.props.operator == "is_not_null") {
            return "";
        }

        var selected = this.getSelectedValues();
        var selectedkv = selected.map(id => {
            var label = (self.state.options_history && (id in self.state.options_history)) ? String(self.state.options_history[id]) : "(" + id + ")";
            return [id, label];
        });

        return <div class="control field is-grouped is-grouped-multiline">
            <div class={cls("dropdown", self.state.select_dropdown_active ? "is-active is-hoverable" : "")} style="width:100%;">
                <div class="dropdown-trigger" style="width:100%;">
                    <div class="input" aria-haspopup="true" aria-controls="dropdown-menu" onClick={self.onSelectDropdownClick} style="width:100%; height: auto;flex-flow: wrap; row-gap: 0.4em; min-height: 2.5em; min-width: 5em;">
                        {selectedkv.map(([id, label]) => {
                            return <div class="control" key={id}>
                                <div class="tags has-addons mr-2">
                                    <button class="tag" title={label + " (" + id + ")"}>{label}</button><button class="tag is-delete" data-filterindex={self.props.index} data-value={id} onClick={self.onRemoveLink}></button>
                                </div>
                            </div>;
                        })}
                        <span class="icon is-small"><span class="material-symbols-outlined">arrow_drop_down</span></span>
                    </div>
                </div>
                <div class="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                        <p class="dropdown-item">
                            <input class="input" type="input" value={self.state.options_input} onInput={self.onOptionsInputChange} id={self.state.input_id}/>
                        </p>
                    </div>
                    <div class="dropdown-content" style="overflow: auto; max-height: 12em;">
                        {self.state.options_current ? Object.keys(self.state.options_current).map(x => <a class="dropdown-item" data-value={x} onClick={self.onAddLink} key={x}>{self.state.options_current[x]} ({x})</a>) : ""}
                    </div>
                </div>
            </div>
        </div>;
    }

    render() {
        var self = this;
        return <div>
            <div class="select">
                <select value={self.props.column.name} data-filterindex={self.props.index} onChange={self.props.onColumnChange}>
                    {self.props.table.state.table_columns.map(y => {
                        return <option value={y.name}>{y.label}</option>;
                    })}
                </select>
            </div>
            <div class="select">
                <select value={self.props.operator ? self.props.operator : "eq"} data-filterindex={self.props.index} onChange={self.props.onOperatorChange}>
                    <option value="eq">=</option>
                    <option value="neq">!=</option>
                    <option value="in">IN</option>
                    <option value="not_in">NOT IN</option>
                    {self.props.column.editor_allow_null ? <option value="is_null">Is NULL</option> : ""}
                    {self.props.column.editor_allow_null ? <option value="is_not_null">Is not NULL</option> : ""}
                </select>
            </div>
            {self.renderValueSelector()}
            <button class="button is-danger is-soft" data-filterindex={self.props.index} onClick={self.props.onDeleteClick}><span class="material-symbols-outlined">delete</span></button>
        </div>;
    }
}
