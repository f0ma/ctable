/**
 * Link editor class.
 *
 * @arg this.props.column {Object} Table column.
 * @arg this.props.column.name {string} Column name
 * @arg this.props.column.editor_default {*} Editor default value
 *
 * @arg this.props.row {Object} Row to edit, null if add, first if batch.
 * @arg this.props.add {bool} Is adding.
 * @arg this.props.batch {bool} Is batch editing.
 * @arg this.props.onEditorChanges {CTable#OnEditorChanges} Editor changes callback.
 *
 */


class CLinkEditor extends Component {

    constructor() {
        super();

        this.onInputChange = this.onInputChange.bind(this);
        this.onResetClicked = this.onResetClicked.bind(this);
        this.onNullClicked = this.onNullClicked.bind(this);
        this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
        this.onUndoClicked = this.onUndoClicked.bind(this);

        this.onSelectDropdownClick = this.onSelectDropdownClick.bind(this);
        this.onSelectItem = this.onSelectItem.bind(this);
        this.onOptionsInputChange = this.onOptionsInputChange.bind(this);

    }

    componentDidMount() {

        var self = this;

        this.setState({
            editor_value: (this.props.add || this.props.batch) ? this.props.column.editor_default : this.props.row[this.props.column.name],
                      editor_modified: false,
                      editor_valid: false,
                      select_dropdown_active: false,
                      options_history: clone(this.props.options[this.props.column.cell_link]),
                      options_current: clone(this.props.options[this.props.column.cell_link]),
                      options_input: "",
                      input_id: makeID()
        }, () => {this.validateAndSend()});


        this.props.getOptionsForField(this.props.column.name, "").then(w => {
            var opt = {};
            w.rows.forEach(q => { opt[q[w.keys[0]]] = q[w.label]; });
            self.setState({options_current: opt, options_history: {...opt, ...self.state.options_history}});
        });

    }

    validateAndSend() {
        this.sendChanges();
    }

    sendChanges(){
        if (this.props.row === null){
            this.props.onEditorChanges(this.props.column.name, true, this.state.editor_value, true);
        } else {
            this.props.onEditorChanges(this.props.column.name, this.state.editor_value == this.props.row[this.props.column.name], this.state.editor_value, true);
        }

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

    onSelectDropdownClick(){
        this.setState({select_dropdown_active: !this.state.select_dropdown_active}, () => {
            document.getElementById(this.state.input_id).focus();
        });

    }

    onSelectItem(e){
        var el = unwind_button_or_link(e);
        this.setState({editor_value: parseInt(el.dataset['value']), select_dropdown_active: false},
                      () => {this.validateAndSend()});

    }

    onOptionsInputChange(e){
        var self = this;

        this.setState({options_input: e.target.value}, () => {
            self.props.getOptionsForField(this.props.column.name, self.state.options_input).then(w => {
                var opt = {};
                w.rows.forEach(q => { opt[q[w.keys[0]]] = q[w.label]; });
                self.setState({options_current: opt, options_history: {...opt, ...self.state.options_history}});
            });
        });
    }


    render () {

        var self = this;

        //onBlur={this.dropdownMenuLeave}

        return   <div class={cls("dropdown", self.state.select_dropdown_active ? "is-active is-hoverable" : "")} style="width:100%;">
                   <div class="dropdown-trigger" style="width:100%;">
                    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" onClick={this.onSelectDropdownClick} title={ self.state.options_history && (self.state.editor_value in self.state.options_history) ? String(self.state.options_history[self.state.editor_value]) + ' ('+self.state.editor_value+')' : self.state.editor_value } style="width:100%;justify-content:left;min-height: 2.5em;">
                      <span>{ self.state.options_history && (self.state.editor_value in self.state.options_history) ? String(self.state.options_history[self.state.editor_value]) : self.state.editor_value }</span>
                      <span class="icon is-small" style="position: absolute; right: 1em;"><span class="material-symbols-outlined">arrow_drop_down</span></span>
                    </button>
                   </div>
                   <div class="dropdown-menu" role="menu">
                       <div class="dropdown-content">
                           <p class="dropdown-item">
                               <input class="input" type="input" value={self.state.options_input} onInput={self.onOptionsInputChange} id={this.state.input_id}/>
                           </p>
                       </div>
                       <div class="dropdown-content" style="overflow: auto; max-height: 12em;">
                           {self.state.options_current ? Object.keys(self.state.options_current).map(x => <a class="dropdown-item" data-value={x} onClick={self.onSelectItem}>{self.state.options_current[x]}</a>) : ""}
                       </div>
                   </div>
               </div>;
    }
}


ctable_register_class("CLinkEditor", CLinkEditor);
