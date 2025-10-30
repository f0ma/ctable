/**
 * Editor panel class.
 *
 * @arg this.props.columns {Object[]} Table columns
 * @arg this.props.columns[].editor_actor {string} Editor actor class
 *
 * @arg this.props.width {int} Width in em.
 * @arg this.props.affectedRows {Object[]} Rows affected by editor, empty if add.
 * @arg this.props.saveStatus {String} Options: `save`, `empty`, `invalid`
 * @arg this.props.noSaveClick {function} Save button callback.
 * @arg this.props.noCancelClick {function} Cancel button callback.
 * @arg this.props.onEditorChanges {function} Editor changes callback.
 *
 */

class CEditorPanel extends Component {

    constructor() {
      super();

      this.onSomeEditorChanged = this.onSomeEditorChanged.bind(this);
    }

    componentDidMount() {
      this.setState({save_status: "save"});

    }

    onSomeEditorChanged(e){
      this.setState({save_status: e.detail.save_status});
    }

    render() {

        var self = this;

        var saveLabel = _("Save");
        var saveEnable = true;

        if(self.props.affectedRows.length == 0){
          saveLabel = _("Add");
        }
        if(self.props.affectedRows.length > 1){
          saveLabel = _("Save all");
        }
        if(this.state.save_status == "empty"){
          saveLabel = _("Nothing to save");
          saveEnable = false;
        }
        if(this.state.save_status == "invalid"){
          saveLabel = _("Invalid values");
          saveEnable = false;
        }

        var current_action = "edit";
        if(self.props.affectedRows.length == 0)
          current_action = "add";
        if(self.props.affectedRows.length > 1)
          current_action = "batch-edit";

        return  <section class="section ctable-editor-section" oncteditorchanged={self.onSomeEditorChanged}>
          <div class="ctable-editor-panel box" style={sty("width","min("+self.props.width+ "em,100%)", "min-height" , "40vh")} >
            <div class="field has-text-right mb-0">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-primary is-soft" disabled={!saveEnable} onClick={self.props.noSaveClick}><span class="material-symbols-outlined">save</span> {saveLabel}</button>
              </div>
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-warning is-soft" onClick={self.props.noCancelClick}><span class="material-symbols-outlined">cancel</span> {_("Cancel")}</button>
              </div>
            </div>

            {self.props.columns.filter(x => x.editor_actor).filter(x => (x.editor_hide_on === undefined || (!x.editor_hide_on.includes(current_action)))).map(x => {
                  return <CEditorFrame column={x} onEditorChanges={self.props.onEditorChanges} table={self.props.table} row={self.props.affectedRows.length == 0 ? null : self.props.affectedRows[0]} add={self.props.affectedRows.length == 0} batch={self.props.affectedRows.length > 1}/>;
            })}

            <div class="field has-text-right mt-5">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-primary is-soft" disabled={!saveEnable} onClick={self.props.noSaveClick}><span class="material-symbols-outlined">save</span> {saveLabel}</button>
              </div>
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-warning is-soft" onClick={self.props.noCancelClick}><span class="material-symbols-outlined">cancel</span> {_("Cancel")}</button>
              </div>
            </div>
        </div>
        </section>;
    }
}



