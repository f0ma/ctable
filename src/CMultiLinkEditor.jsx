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


class CMultiLinkEditor extends Component {

    constructor() {
        super();

        this.onInputChange = this.onInputChange.bind(this);
        this.onResetClicked = this.onResetClicked.bind(this);
        this.onNullClicked = this.onNullClicked.bind(this);
        this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
        this.onUndoClicked = this.onUndoClicked.bind(this);

        this.onRemoveLink = this.onRemoveLink.bind(this);
        this.onAddLink = this.onAddLink.bind(this);

        this.onSelectDropdownClick = this.onSelectDropdownClick.bind(this);
        this.onOptionsInputChange = this.onOptionsInputChange.bind(this);

    }

    componentDidMount() {

        var self = this;

        this.setState({
            editor_value: (this.props.add || this.props.batch) ? this.props.column.editor_default : this.props.row[this.props.column.name],
                      editor_modified: false,
                      editor_valid: true,
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


    onRemoveLink(e){
        var id = parseInt(unwind_button_or_link(e).dataset['value']);
        var selectedids = this.state.editor_value.split(";").filter(x => {return x != "";}).map(x => {return parseInt(x)}).filter(x => x != id);
        selectedids.sort();
        e.stopPropagation();
        this.setState({editor_value: selectedids.join(";"), editor_modified: true}, () => {this.validateAndSend()});
    }

    onAddLink(e){
        var id = parseInt(unwind_button_or_link(e).dataset['value']);
        var selectedids = this.state.editor_value.split(";").filter(x => {return x != "";}).map(x => {return parseInt(x)});
        if (selectedids.includes(id)) return;
        selectedids.push(id);
        selectedids.sort();
        this.setState({editor_value: selectedids.join(";"), select_dropdown_active: false, editor_modified: true}, () => {this.validateAndSend()});
    }

    render () {

        var self = this;

        if (self.state.editor_value === undefined) return;

        var selectedids = self.state.editor_value.split(";").filter(x => {return x != "";}).map(x => {return parseInt(x)});

        var selectedkv = selectedids.map(x => {
           return  [x, self.state.options_history && (x in self.state.options_history) ? String(self.state.options_history[x]) : ("ID: "+x)];
        });


        //onBlur={this.dropdownMenuLeave}

        return   <div class={cls("dropdown", self.state.select_dropdown_active ? "is-active is-hoverable" : "")}>
                   <div class="dropdown-trigger">
                   <div class={cls("input", self.state.editor_valid ? "" : "is-danger")}  aria-haspopup="true" aria-controls="dropdown-menu" onClick={this.onSelectDropdownClick}  style="height: auto;flex-flow: wrap; row-gap: 0.4em; min-height: 2.5em; min-width: 5em;">
                      {selectedkv.map(([id, label]) => {
                          return  <div class="control">
                            <div class="tags has-addons mr-2">
                              <button class="tag" title={"ID: "+id}>{label}</button><button class="tag is-delete" data-value={id} onClick={self.onRemoveLink}></button>
                            </div>
                          </div>;
                      })}
                      <span class="icon is-small"><span class="material-symbols-outlined">arrow_drop_down</span></span>
                   </div>
                   </div>
                   <div class="dropdown-menu" role="menu">
                       <div class="dropdown-content">
                           <p class="dropdown-item">
                               <input class="input" type="input" value={self.state.options_input} onInput={self.onOptionsInputChange} id={this.state.input_id}/>
                           </p>
                       </div>
                       <div class="dropdown-content" style="overflow: auto; max-height: 12em;">
                           {self.state.options_current ? Object.keys(self.state.options_current).map(x => <a class="dropdown-item" data-value={x} onClick={self.onAddLink}>{self.state.options_current[x]} ({x})</a>) : ""}
                       </div>
                   </div>
               </div>;
    }
}


// {aw_options.map(function(item){
// item_count += 1;
// return <a href="" class={item_count == self.state.top_index ? "dropdown-item is-active" :  "dropdown-item"} id={item_count == self.state.top_index ? self.state.selected_id : null} onClick={self.menuItemClicked} data-value={item[0]}>{item[1]}</a>;})}

