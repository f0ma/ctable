class CTagsEditor extends Component {

    constructor() {
        super();

        this.onInputChange = this.onInputChange.bind(this);
        this.onResetClicked = this.onResetClicked.bind(this);
        this.onNullClicked = this.onNullClicked.bind(this);
        this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
        this.onUndoClicked = this.onUndoClicked.bind(this);
    }

    componentDidMount() {
        this.setState({
            editor_value: (this.props.add || this.props.batch) ? this.props.column.editor_default : this.props.row[this.props.column.name],
                      editor_modified: false,
                      editor_valid: false,
        }, () => {this.validateAndSend()});

    }

    validateAndSend() {
        if(this.props.column.editor_validate) {
            var re = new RegExp(this.props.column.editor_validate);
            if (re.test(this.state.editor_value)) {
                this.setState({editor_valid: true}, () => {this.sendChanges()});
            } else {
                this.setState({editor_valid: false}, () => {this.sendChanges()});
            }
        } else {
            this.setState({editor_valid: true}, () => {this.sendChanges()});
        }
    }

    sendChanges(){
        this.props.onEditorChanges(this.props.column.name, this.state.editor_modified, this.state.editor_value, this.state.editor_valid);
    }

    onInputChange(e){
        this.setState({editor_value: e.target.value, editor_modified: true}, () => {this.validateAndSend()});
    }

    /**
     * Request to set value to NULL.
     *
     * @method
     * @listens CEditorFrame#cteditorreset
     */

    onResetClicked(){
        this.setState({editor_value: this.props.column.editor_default, editor_modified: true}, () => {this.validateAndSend()});
    }

    /**
     * Request to set value to Default
     *
     * @method
     * @listens CEditorFrame#cteditortonull
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

        return   <div class={cls("control", self.state.editor_value === null ? "has-icons-left" : "")} oncteditortonull={self.onNullClicked} oncteditorreset={self.onResetClicked} oncteditorundo={self.onUndoClicked} oncteditorchanged={self.onOtherEditorChanged}>
        <textarea class={cls("textarea", self.state.editor_valid ? "" : "is-danger")} placeholder={self.state.editor_value === null ? "NULL" : self.props.column.editor_placeholder} value={self.state.editor_value === null ? "" : self.state.editor_value} onInput={self.onInputChange}/>
        {self.state.editor_value === null ? <span class="icon is-small is-left"><span class="material-symbols-outlined">hide_source</span></span> : "" }
        </div>
        ;
    }
}
