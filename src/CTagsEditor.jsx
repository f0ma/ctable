class CTagsEditor extends Component {

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
            editor_value: (this.props.add || this.props.batch) ? this.props.column.editor_default : this.props.row[this.props.column.name].split(";"),
                      editor_modified: false,
                      editor_valid: false,
        }, () => {this.validateAndSend()});

    }

    validateAndSend(){
        var is_valid = true;
        var self = this;
        self.state.editor_value = typeof(self.state.editor_value) == "string" ? self.state.editor_value.split(";") : self.state.editor_value;
        console.log(typeof(self.state.editor_value));
        self.state.editor_value = self.state.editor_value === null ? "" : self.state.editor_value.filter(x => x != "").join(";");
        if (self.state.editor_value === ""){
            self.state.editor_value = null;
        }
        if (self.state.editor_value === null && !this.props.column.editor_allow_null){
            is_valid = false;
        }
        
        this.setState({editor_valid: is_valid}, () => {this.props.onEditorChanges(this.props.column.name, this.state.editor_modified, this.state.editor_value, true)});
        
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

    onRemoveTag(tag){
        return () => {
            var self = this;
            self.state.editor_value = typeof(self.state.editor_value) == "string" ? self.state.editor_value.split(";") : self.state.editor_value;
            this.setState({editor_value: this.state.editor_value.filter(x => x != tag), editor_modified: true}, () => {this.validateAndSend()});
        }
    }

    onAddTag(tag){
        return () => {
            var self = this;
            self.state.editor_value = typeof(self.state.editor_value) == "string" ? self.state.editor_value.split(";") : self.state.editor_value;
            if(!self.state.editor_value.includes(tag)){
                this.setState({editor_value: (self.state.editor_value === null ? [] : self.state.editor_value).concat([tag]), editor_modified: true}, () => {this.validateAndSend()});
            }
        }
    }

    renderTags(){
        var self = this;
        console.log(self.state.editor_value);
        if (self.state.editor_value === undefined) {
            return <span class="has-text-grey">NULL</span>;
        } else {
            return (
                self.props.column.options.map(tag => {
                    if (self.props.column.max_length === undefined || tag.length <= self.props.column.max_length) {
                        return (
                            <div class="control">
                                <div class="tags has-addons">
                                    <button class="tag" onClick={self.onAddTag(tag)}>{tag}</button>
                                    {self.state.editor_value === null ? "" :(self.state.editor_value.includes(tag) ? <button class="tag is-delete" onClick={self.onRemoveTag(tag)}></button> : "")}
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div class="control">
                                <div class="tags has-addons">
                                    <button class="tag" title={tag} onClick={self.onAddTag(tag)}>{tag.slice(0, self.props.column.max_length) + "..."}</button>
                                    {self.state.editor_value === null ? "" :(self.state.editor_value.includes(tag) ? <button class="tag is-delete" onClick={self.onRemoveTag(tag)}></button> : "")}
                                </div>
                            </div>
                        );
                    }
                })
            );
        }
    }

    render () {

        var self = this;

        return   <div class={cls("control field is-grouped is-grouped-multiline", self.state.editor_value === null ? "has-icons-left" : "")} oncteditortonull={self.onNullClicked} oncteditorreset={self.onResetClicked} oncteditorundo={self.onUndoClicked} oncteditorchanged={self.onOtherEditorChanged}>
            {self.renderTags()}
        </div>;
    }
}
