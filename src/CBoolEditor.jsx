class CBoolEditor extends Component {

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
        this.setState({
            editor_value: (this.props.add || this.props.batch) ? this.props.column.editor_default : this.props.row[this.props.column.name],
                      editor_modified: false,
                      editor_valid: false,
        }, () => {this.validateAndSend()});

    }

    onInputChange(e){
        this.setState({editor_value: e.target.value, editor_modified: true}, () => {this.validateAndSend()});
    }

    validateAndSend(){
        var self = this;
        var is_valid = true;
        self.state.editor_value = (self.state.editor_value === "-1" || self.state.editor_value === -1) ? null : (self.state.editor_value === "1" || self.state.editor_value === 1) ? 1 : 0;
        if (self.state.editor_value !== null && self.state.editor_value !== 0 && self.state.editor_value !== 1){
            is_valid = false;
            if (self.state.editor_value === null && self.props.column.editor_allow_null){
                is_valid = true;
            }
        }

        this.setState({editor_valid: is_valid}, () => {this.props.onEditorChanges(this.props.column.name, this.state.editor_modified, this.state.editor_value, true)});

    }

    /**
     * Request to set value to NULL.
     *
     * @method
     * @listens CEditorFrame#cteditortonull
     */

    onResetClicked(){
        this.setState({editor_value: this.props.column.editor_default, editor_modified: false}, () => {this.validateAndSend()});
    }

    /**
     * Request to set value to Default
     *
     * @method
     * @listens CEditorFrame#cteditorreset
     */

    onNullClicked(){
        this.setState({editor_value: null, editor_modified: true}, () => {this.validateAndSend()});
    }

    /**
     * Request to set value to value at start editing.
     *
     * @method
     * @listens CEditorFrame#cteditorundo
     */

    onUndoClicked(){
        this.setState({editor_value: this.props.add ? this.props.column.editor_default : this.props.row[this.props.column.name] , editor_modified: false}, () => {this.validateAndSend()});
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

    render () {

        var self = this;
        var items = [
            {value: 1, label: _("Yes")},
            {value: 0, label: _("No")},
        ];

        return   <div class={cls("control", self.state.editor_value === null ? "has-icons-left" : "")} oncteditortonull={self.onNullClicked} oncteditorreset={self.onResetClicked} oncteditorundo={self.onUndoClicked} oncteditorchanged={self.onOtherEditorChanged}>
          <div class={cls("select", self.state.editor_valid ? "" : "is-danger")}>
            <select onChange={this.onInputChange} value={self.state.editor_value}>
              {items.map((item) => {return <option value={item.value}>{item.label}</option>;})}
              {self.props.column.editor_allow_null ? <option value="-1" selected>NULL</option> : ""}
            </select>
          </div>
          {self.state.editor_value === null ? <span class="icon is-small is-left"><span class="material-symbols-outlined">hide_source</span></span> : "" }
        </div>;
    }
}