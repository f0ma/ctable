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


class CTiledMultiLinkEditor extends Component {

    constructor() {
        super();

        this.onInputChange = this.onInputChange.bind(this);
        this.onResetClicked = this.onResetClicked.bind(this);
        this.onNullClicked = this.onNullClicked.bind(this);
        this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
        this.onUndoClicked = this.onUndoClicked.bind(this);
        this.onToggleLink = this.onToggleLink.bind(this);

    }

    componentDidMount() {

        var self = this;

        this.setState({
            editor_value: (this.props.add || this.props.batch) ? this.props.column.editor_default : this.props.row[this.props.column.name],
                      editor_modified: false,
                      editor_valid: true,
                      options_history: clone(this.props.options[this.props.column.cell_link]),
                      options_current: clone(this.props.options[this.props.column.cell_link])
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


    onToggleLink(e){
        if(e.target.tagName == "LABEL") return;
        var id = parseInt(unwind_data(e, 'value'));

        var selectedids = [];

        if (this.state.editor_value !== undefined && this.state.editor_value !== null) {
            selectedids = this.state.editor_value.split(";").filter(x => {return x != "";}).map(x => {return parseInt(x)});
        }

        if(selectedids.includes(id)){
            selectedids = selectedids.filter(x => x != id);
        } else {
            selectedids.push(id);
        }
        this.setState({editor_value: selectedids.join(";"), editor_modified: true}, () => {this.validateAndSend()});
    }


    render () {

        var self = this;

        var selectedids = [];

        if (self.state.editor_value !== undefined && self.state.editor_value !== null) {
            selectedids = self.state.editor_value.split(";").filter(x => {return x != "";}).map(x => {return parseInt(x)});
        }

        var selectedkv = selectedids.map(x => {
           return  [x, self.state.options_history && (x in self.state.options_history) ? String(self.state.options_history[x]) : ("("+x+")")];
        });




        return  <div class={cls("input", self.state.editor_valid ? "" : "is-danger")} style="width:100%;display:flex;flex-wrap:wrap;height:unset;">
                    {self.state.options_current ? Object.keys(self.state.options_current).map(x => {
                        return <div class={cls("button mr-2 mb-2", selectedids.includes(parseInt(x)) ? "is-info is-soft" : "")} data-value={x} onClick={self.onToggleLink} title={self.state.options_current[x] +  " ("+x+")"}><label class="checkbox"><input type="checkbox" checked={selectedids.includes(parseInt(x))}/> {self.state.options_current[x]} </label></div>;

                    }) : ""}
                </div>;
    }
}

ctable_register_class("CTiledMultiLinkEditor", CTiledMultiLinkEditor);
