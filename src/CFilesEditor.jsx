/**
 * File upload editor class.
 *
 * @arg this.props.column {Object} Table column.
 * @arg this.props.column.name {string} Column name
 * @arg this.props.column.editor_default {*} Editor default value
 * @arg this.props.column.editor_min_upload_count {Integer} Minimum files count
 * @arg this.props.column.editor_max_upload_count {Integer} Maximum files count
 * @arg this.props.column.editor_max_upload_size {Integer} Maximum upload size
 * @arg this.props.column.editor_allowed_ext {Array} List of allowed extention
 *
 * @arg this.props.row {Object} Row to edit, null if add, first if batch.
 * @arg this.props.add {bool} Is adding.
 * @arg this.props.batch {bool} Is batch editing.
 * @arg this.props.onEditorChanges {CTable#onEditorChanges} Editor changes callback.
 * @arg this.props.onDownloadFile {CTable#onDownloadFile} Download file callback.
 * @arg this.props.onUploadFile{CTable#onUploadFile} Upload file callback.
 * @arg this.props.askUser{CTable#askUser} Ask user callback.
 * @arg this.props.showError{CTable#showError} Show error callback.
 *
 */


class CFilesEditor extends Component {

    constructor() {
        super();

        this.onUploadChange = this.onUploadChange.bind(this);
        this.onUploadDelete = this.onUploadDelete.bind(this);
        this.onDownloadClicked = this.onDownloadClicked.bind(this);

        this.onResetClicked = this.onResetClicked.bind(this);
        this.onNullClicked = this.onNullClicked.bind(this);
        this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
        this.onUndoClicked = this.onUndoClicked.bind(this);

    }

    componentDidMount() {
        var value = (this.props.add || this.props.batch) ? this.props.column.editor_default : this.props.row[this.props.column.name];

        this.setState({
                      editor_value: value,
                      editor_modified: false,
                      editor_valid: false,
                      download_available: (value === null || value === "") ? [] : value.split(';').map(x => true)
        }, () => {this.validateAndSend()});

    }

    validateAndSend() {

        if (this.state.editor_value === null || this.state.editor_value === ""){
            if (this.props.column.editor_min_upload_count == 0){
                this.setState({editor_valid: true}, () => {this.sendChanges()});
            } else {
                this.setState({editor_valid: false}, () => {this.sendChanges()});
            }
        } else {
            if (this.state.editor_value.split(';').length >= this.props.column.editor_min_upload_count && this.state.editor_value.split(';').length <= this.props.column.editor_max_upload_count){
                this.setState({editor_valid: true}, () => {this.sendChanges()});
            } else {
                this.setState({editor_valid: false}, () => {this.sendChanges()});
            }

        }

    }

    sendChanges(){
        this.props.onEditorChanges(this.props.column.name, this.state.editor_modified, this.state.editor_value, this.state.editor_valid);
    }

    onUploadChange(e){
        var idx = parseInt(e.target.dataset['index']);
        var self = this;

        var error_msg = null;
        for(var i =0; i<e.target.files.length; i++){
            if(e.target.files[i].size > self.props.column.editor_max_upload_size){
                error_msg = {code:-12, message: _("File \"%s\" is too large for upload").replace('%s', e.target.files[i].name)};
            }

            var cm = e.target.files[i].name.split('.');
            var cmext = '.'+cm[cm.length -1];

            if(self.props.column.editor_allowed_ext.indexOf(cmext) < 0){
                error_msg = {code:-16, message: _("File \"%s\" extention has not allowed").replace('%s', e.target.files[i].name)};
            }
        }

        if (error_msg !== null){

            this.props.showError(error_msg);

        } else {

            this.props.onUploadFile(this.props.row, this.props.column.name, idx, e.target.files).then(x => {
                var value_array = [];
                if(this.state.editor_value){
                    value_array = this.state.editor_value.split(';');
                }
                var new_download_available = this.state.download_available;
                if (idx < 0){
                    value_array.push(x);
                    new_download_available.push(false);
                } else {
                    value_array[idx] = x;
                    new_download_available[idx] = false;
                }
                var new_value = value_array.join(';');
                this.setState({editor_value: new_value, download_available:new_download_available, editor_modified: true}, () => {this.validateAndSend()});
            });

        }

    }

    onDownloadClicked(e){
        var idx = parseInt(unwind_button_or_link(e).dataset['index']);
        this.props.onDownloadFile(this.props.row, this.props.column.name, idx);
    }

    onUploadDelete(e){
        this.props.askUser(_("Remove uploaded file?")).then(x => {
            var idx = parseInt(unwind_button_or_link(e).dataset['index']);
            var new_value = this.state.editor_value.split(';').filter((x,i) => i != idx).join(';');
            var new_download_available = this.state.download_available.filter((x,i) => i != idx);
            this.setState({editor_value: new_value, download_available:new_download_available, editor_modified: true}, () => {this.validateAndSend()});
        });
    }

    /**
     * Request to set value to Default
     *
     * @method
     * @listens CEditorFrame#cteditorreset
     */

    onResetClicked(){
        this.setState({editor_value: this.props.column.editor_default, editor_modified: false}, () => {this.validateAndSend()});
    }

    /**
     * Request to set value to NULL.
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

        var comp = [];

        if(Object.keys(this.state).length == 0) return;

        if (self.state.editor_value !== null && self.state.editor_value !== ""){
            self.state.editor_value.split(';').forEach(x => {
                var m = x.split(':');
                comp.push({file:m[0], size:m[1], name:m[2]});
            });
        }


        return <div class={cls("control", self.state.editor_value === null ? "has-icons-left" : "")} oncteditortonull={self.onNullClicked} oncteditorreset={self.onResetClicked} oncteditorundo={self.onUndoClicked} oncteditorchanged={self.onOtherEditorChanged}>
                 {comp.map((x,i) => {

                     return <>
                     <div class="file has-name" style="display:inline-block;">
                       <label class="file-label">
                         <input class="file-input" type="file" data-index={i} onChange={self.onUploadChange} accept={self.props.column.editor_allowed_ext.join(',')}/>
                         <span class="file-cta">
                           <span class="material-symbols-outlined">upload</span>
                         </span>
                         <span class="file-name" style="border-radius: 0; max-width:9em;">{x.name}</span>
                       </label>
                     </div>
                     {self.state.download_available[i] ?
                     <button class="button" style="border-radius: 0;" data-index={i} onClick={self.onDownloadClicked}>
                         <span class="material-symbols-outlined">download</span>
                     </button> : "" }
                     <button class="button" style="border-top-left-radius: 0; border-bottom-left-radius: 0;" data-index={i} onClick={self.onUploadDelete}>
                         <span class="material-symbols-outlined">delete</span>
                     </button>
                     <br/>
                     </>;
                })}

                {self.props.column.editor_max_upload_count > comp.length ?
                <div>
                  <div class={cls("file", "has-name", self.state.editor_valid ? "" : "is-danger")} style="display:inline-block;">
                    <label class="file-label">
                      <input class="file-input" type="file"  data-index="-1" onChange={self.onUploadChange} />
                      <span class="file-cta">
                        <span class="material-symbols-outlined">upload</span>
                      </span>
                      <span class="file-name" style="max-width:9em;">{_("Upload...")}</span>
                    </label>
                  </div>
               </div> : "" }

            </div>;

    }
}
