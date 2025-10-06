/**
 * @event CEditorFrame#cteditorreset
 */

/**
 * @event CEditorFrame#cteditortonull
 */

/**
 * @event CEditorFrame#cteditorundo
 */

/**
 * Editor frame class.
 *
 * @arg this.props.table {Object} Link to CTable instance
 * @arg this.props.column {Object} Table column.
 * @arg this.props.column.name {string} Column name
 * @arg this.props.column.label {string} Column label
 * @arg this.props.column.editor_hint {string} Editor hint
 * @arg this.props.column.editor_allow_null {bool} Allow null
 * @arg this.props.column.editor_default {*} Editor default value
 *
 * @arg this.props.onEditorChanges {function} Editor changes callback.
 * @arg this.props.row {Object} Row to edit, null if add, first if batch.
 * @arg this.props.add {bool} Is adding.
 * @arg this.props.batch {bool} Is batch editing.
 *
 *
 * @fires CEditorFrame#cteditorreset
 * @fires CEditorFrame#cteditortonull
 * @fires CEditorFrame#cteditorundo
 */

class CEditorFrame extends Component {

    constructor() {
        super();
        this.onEnabledChanged = this.onEnabledChanged.bind(this);
        this.onEditorChanges = this.onEditorChanges.bind(this);
        this.onResetClicked = this.onResetClicked.bind(this);
        this.onNullClicked = this.onNullClicked.bind(this);
        this.onUndoClicked = this.onUndoClicked.bind(this);
    }

    componentDidMount() {
        this.setState({
            editor_enabled: this.props.add ? true : false,
            editor_value: null,
            editor_valid: null,
        });
    }

    onEnabledChanged(e){
        this.setState({editor_enabled: e.target.checked}, () => {this.props.onEditorChanges(this.props.column.name, false, this.state.editor_value, this.state.editor_valid)});
    }

    onEditorChanges(colname, is_modified, value, valid){
        this.setState({editor_value: value, editor_valid: valid});
        if(this.state.editor_enabled) {
            this.props.onEditorChanges(colname, true, value, valid);
        } else {
            if(is_modified){
                this.setState({editor_enabled: true});
                this.props.onEditorChanges(colname, true, value, valid);
            } else {
                this.props.onEditorChanges(colname, false, value, valid);
            }
        }
    }

    onResetClicked(){
        this.base.querySelector(".ctable-editor-control div").dispatchEvent(new CustomEvent("cteditorreset"));
    }

    onNullClicked(){
        this.base.querySelector(".ctable-editor-control div").dispatchEvent(new CustomEvent("cteditortonull"));
    }

    onUndoClicked(){
        this.base.querySelector(".ctable-editor-control div").dispatchEvent(new CustomEvent("cteditorundo"));
    }

    render () {

        var self = this;

        return <div>
        <div class="field is-grouped">
        <p class="control is-expanded mt-2">
        <label class="checkbox label"> {this.props.batch ? <input type="checkbox" checked={self.state.editor_enabled} onChange={self.onEnabledChanged}/> : "" } {self.props.column.label}:</label>
        </p>
        {self.props.column.editor_allow_null ? <p class="control">
        <button class="button is-small" tabindex="-1" onClick={self.onNullClicked}><span class="material-symbols-outlined">hide_source</span></button>
        </p> : "" }
        {typeof self.props.column.editor_default !== 'undefined' ? <p class="control">
        <button class="button is-small" tabindex="-1" onClick={self.onResetClicked}><span class="material-symbols-outlined">restart_alt</span></button>
        </p> : "" }
        {self.props.add || self.props.batch ? "" : <p class="control">
            <button class="button is-small" tabindex="-1" onClick={self.onUndoClicked}><span class="material-symbols-outlined">undo</span></button>
        </p>}
        </div>
        <div class="field ctable-editor-control">

        {self.props.batch ? (self.state.editor_enabled ? "" : <div class="control"><input class="input" type="text" disabled></input></div>) : "" }

        {((self.props.batch == true && self.state.editor_enabled) || (self.props.batch == false)) && self.props.column.editor_actor == "CSelectEditor" ? <CSelectEditor column={self.props.column} onEditorChanges={self.onEditorChanges} row={self.props.row} add={self.props.add} batch={self.props.batch}/> : "" }
        {((self.props.batch == true && self.state.editor_enabled) || (self.props.batch == false)) && self.props.column.editor_actor == "CLineEditor" ? <CLineEditor column={self.props.column} onEditorChanges={self.onEditorChanges} row={self.props.row} add={self.props.add} batch={self.props.batch}/> : "" }
        {((self.props.batch == true && self.state.editor_enabled) || (self.props.batch == false)) && self.props.column.editor_actor == "CDateEditor" ? <CDateEditor column={self.props.column} onEditorChanges={self.onEditorChanges} row={self.props.row} add={self.props.add} batch={self.props.batch}/> : "" }
        {((self.props.batch == true && self.state.editor_enabled) || (self.props.batch == false)) && self.props.column.editor_actor == "CFilesEditor" ? <CFilesEditor column={self.props.column} onEditorChanges={self.onEditorChanges} row={self.props.row} add={self.props.add} batch={self.props.batch}/> : "" }
        {((self.props.batch == true && self.state.editor_enabled) || (self.props.batch == false)) && self.props.column.editor_actor == "CBoolEditor" ? <CBoolEditor column={self.props.column} onEditorChanges={self.onEditorChanges} row={self.props.row} add={self.props.add} batch={self.props.batch}/> : "" }
        {((self.props.batch == true && self.state.editor_enabled) || (self.props.batch == false)) && self.props.column.editor_actor == "CMultilineTextEditor" ? <CMultilineTextEditor column={self.props.column} onEditorChanges={self.onEditorChanges} row={self.props.row} add={self.props.add} batch={self.props.batch}/> : "" }
        {((self.props.batch == true && self.state.editor_enabled) || (self.props.batch == false)) && self.props.column.editor_actor == "CTagsEditor" ? <CTagsEditor column={self.props.column} onEditorChanges={self.onEditorChanges} row={self.props.row} add={self.props.add} batch={self.props.batch}/> : "" }
        {((self.props.batch == true && self.state.editor_enabled) || (self.props.batch == false)) && self.props.column.editor_actor == "CLinkEditor" ? <CLinkEditor column={self.props.column} onEditorChanges={self.onEditorChanges} row={self.props.row} add={self.props.add} batch={self.props.batch} options={self.props.table.state.table_options} getOptionsForField={self.props.table.getOptionsForField} /> : "" }
        {((self.props.batch == true && self.state.editor_enabled) || (self.props.batch == false)) && self.props.column.editor_actor == "CMultiLinkEditor" ? <CMultiLinkEditor column={self.props.column} onEditorChanges={self.onEditorChanges} row={self.props.row} add={self.props.add} batch={self.props.batch} options={self.props.table.state.table_options} getOptionsForField={self.props.table.getOptionsForField} /> : "" }

        {self.props.column.editor_hint ? <p class="help">{self.props.column.editor_hint}</p> : <p class="help mt-4">{self.props.column.editor_hint}</p>}
        </div>
        </div>;
    }

}
