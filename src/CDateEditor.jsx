class CDateEditor extends Component {

    constructor() {
        super();

        this.onInputChange = this.onInputChange.bind(this);
        this.onResetClicked = this.onResetClicked.bind(this);
        this.onNullClicked = this.onNullClicked.bind(this);
        this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
        this.onUndoClicked = this.onUndoClicked.bind(this);
        this.validateAndSend = this.validateAndSend.bind(this);
    }

    componentDidMount() {
        var date_value = (this.props.add || this.props.batch) ? this.formatGostAsISODate(this.props.column.editor_default) : this.props.row[this.props.column.name];
        this.setState({
            editor_value: date_value,
            display_value: this.formatISODateForDisplay(date_value),
                      editor_modified: false,
                      editor_valid: false,
        }, () => {this.validateAndSend()});

    }

    isValidDate(date){
        const d = new Date(date);
        return d.getMonth() == date.split("-")[1]-1;
    }

    validateAndSend(){
        var is_valid = true;
        var re = new RegExp("^[0-9][0-9].[0-9][0-9].[0-9][0-9][0-9][0-9]$");
        if (re.test(this.state.display_value) && this.isValidDate(this.state.editor_value)) {
            is_valid = true;
            console.log(is_valid);
        } else {
            is_valid = false;
            console.log(is_valid);
            if (this.state.display_value === null && this.props.column.editor_allow_null){
                is_valid = true;
            }
        }

        this.setState({editor_valid: is_valid}, () => {this.props.onEditorChanges(this.props.column.name, this.state.editor_modified, this.state.editor_value, true)});

    }

    formatISODateForDisplay(iso_date){
        if(iso_date === null) return null;
        var d = new Date(iso_date);
        return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth()+1).padStart(2, "0")}.${String(d.getFullYear()).padStart(4, "0")}`;
    }

    formatGostAsISODate(gost_date){
        if(gost_date === null) return null;
        var parts = gost_date.split('.');
        if(parts.length !== 3) return null;
        return `${parts[2].padStart(4, "0")}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }

    onInputChange(e){
        this.setState({editor_value: this.formatGostAsISODate(e.target.value),
             display_value: e.target.value,
             editor_modified: true}, () => {this.validateAndSend()});
    }

    /**
     * Request to set value to NULL.
     *
     * @method
     * @listens CEditorFrame#cteditortonull
     */

    onResetClicked(){
        this.setState({editor_value: this.formatGostAsISODate(this.props.column.editor_default),
             display_value: this.props.column.editor_default,
             editor_modified: false}, () => {this.validateAndSend()});
    }

    /**
     * Request to set value to Default
     *
     * @method
     * @listens CEditorFrame#cteditorreset
     */

    onNullClicked(){
        this.setState({editor_value: null, display_value: null, editor_modified: true}, () => {this.validateAndSend()});
    }

    /**
     * Request to set value to value at start editing.
     *
     * @method
     * @listens CEditorFrame#cteditorundo
     */

    onUndoClicked(){
        var d = this.props.add ? this.formatGostAsISODate(this.props.column.editor_default) : this.props.row[this.props.column.name];
        this.setState({editor_value: d , display_value: this.formatISODateForDisplay(d) , editor_modified: false}, () => {this.validateAndSend()});
    }

    /**
     * Notifiaction for changes in some editor.
     *
     * @method
     * @listens CTable#cteditorchanged
     */

    onOtherEditorChanged(e){
        if(e.detail.initiator == this.props.column.name) return;
    }

    render() {
        var self = this;
        var date = new Date(this.state.editor_value);

        return <div class={cls("control", self.state.editor_value === null ? "has-icons-left" : "")} oncteditortonull={self.onNullClicked} oncteditorreset={self.onResetClicked} oncteditorundo={self.onUndoClicked} oncteditorchanged={self.onOtherEditorChanged}>
            <input class={cls("input", self.state.editor_valid ? "" : "is-danger")} type="text" placeholder={self.state.editor_value === null ? "NULL" : self.props.column.editor_placeholder} value={self.state.editor_value === null ? "" : self.state.display_value} onChange={self.onInputChange}/>
            {self.state.editor_value === null ? <span class="icon is-small is-left"><span class="material-symbols-outlined">hide_source</span></span> : ""}
        </div>;
    }
}