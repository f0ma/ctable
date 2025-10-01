class CTagsEditor extends Component {

    constructor() {
        super();

        this.onResetClicked = this.onResetClicked.bind(this);
        this.onNullClicked = this.onNullClicked.bind(this);
        this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
        this.onUndoClicked = this.onUndoClicked.bind(this);
        this.validateAndSend = this.validateAndSend.bind(this);

        this.onRemoveTag = this.onRemoveTag.bind(this);
        this.onAddTag = this.onAddTag.bind(this);
    }

    componentDidMount() {
        this.setState({
            editor_value: (this.props.add || this.props.batch) ? this.props.column.editor_default : this.props.row[this.props.column.name],
            editor_modified: false,
            editor_valid: false,
        }, () => {this.validateAndSend()});

    }

    validateAndSend() {
        var is_valid = true;

        if (this.state.editor_value === "" && this.props.column.editor_minimum_tags > 0){
            is_valid = false;
        }

        if (this.state.editor_value === null && !this.props.column.editor_allow_null){
            is_valid = false;
        }

        this.setState({editor_valid: is_valid}, () => {this.props.onEditorChanges(this.props.column.name, this.state.editor_modified, this.state.editor_value, is_valid)});
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

    onRemoveTag(e){
        var tag = unwind_button_or_link(e).dataset['tag'];

        var nv = this.state.editor_value;
        if(this.state.editor_value == null || this.state.editor_value == ""){
            return;
        } else {
            var actived = this.state.editor_value.split(";");
            actived = actived.filter(x => x != tag);
            actived.sort();
            nv = actived.join(";");
        }
        this.setState({editor_value: nv, editor_modified: true}, () => {this.validateAndSend()});

    }

    onAddTag(e){
        var tag = unwind_button_or_link(e).dataset['tag'];

        var nv = "";
        if((this.state.editor_value === null) || (this.state.editor_value == "")){
            nv = tag;
        } else {
            var actived = this.state.editor_value.split(";");
            actived.push(tag);
            actived.sort();
            nv = actived.join(";");
        }
        this.setState({editor_value: nv, editor_modified: true}, () => {this.validateAndSend()});
    }

    renderTags(){
        var self = this;

        if (self.state.editor_value === undefined) return;

        if (self.state.editor_value === null) {
            return <div class="input"><span class="has-text-grey">NULL</span><span class="icon is-small is-left"><span class="material-symbols-outlined">hide_source</span></span></div>;
        } else {
            var actived = self.state.editor_value.split(";");
            var tags = self.props.column.options.filter(x => actived.includes(x[0]));
            return (
                <div class={cls("input", self.state.editor_valid ? "" : "is-danger")}>
                {tags.map(([tag, label]) => {
                    return  <div class="control">
                                <div class="tags has-addons mr-2">
                                    <button class="tag">{label}</button><button class="tag is-delete" data-tag={tag} onClick={self.onRemoveTag}></button>
                                </div>
                            </div>;
                })}
                </div>
            );
        }
    }

    renderToolbar() {
        var self = this;
        var buttons = self.props.column.options;

        if (self.state.editor_value === undefined) return;

        if (self.state.editor_value !== null){
            var actived = self.state.editor_value.split(";");
            buttons = buttons.filter(x => !actived.includes(x[0]));
        }

        return (
            <div class="field">
                <div class="control">
                    <div class="buttons are-small is-flex is-flex-wrap-wrap">
                    {buttons.map(([val, label]) => (
                        <button type="button" class="button is-small" data-tag={val} onClick={self.onAddTag}
                            title={label.slice(0, self.props.column.max_length) + (label.length > 32 ? "..." : "")}>
                            {label}
                        </button>
                    ))}
                    </div>
                </div>
            </div>
        );
    }

    render () {

        var self = this;

        return   <div class={cls("control field is-grouped is-grouped-multiline", self.state.editor_value === null ? "has-icons-left" : "")} oncteditortonull={self.onNullClicked} oncteditorreset={self.onResetClicked} oncteditorundo={self.onUndoClicked} oncteditorchanged={self.onOtherEditorChanged}>
            {self.renderTags()}
            {self.renderToolbar()}
        </div>;
    }
}
