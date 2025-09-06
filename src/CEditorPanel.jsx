/**
 * Editor panel class.
 *
 * @arg this.props.columns {Object[]} Table columns
 * @arg this.props.columns[].editor_actor {string} Editor actor class
 *
 * @arg this.props.width {int} Width in em.
 * @arg this.props.affectedRows {Object[]} Rows affected by editor, empty if add.
 * @arg this.props.noSaveClick {function} Save button callback.
 * @arg this.props.noCancelClick {function} Cancel button callback.
 * @arg this.props.onEditorChanges {function} Editor changes callback.
 *
 */

class CEditorPanel extends Component {

    render() {

        var self = this;


        return  <section class="section ctable-editor-section" >
          <div class="ctable-editor-panel" style={sty("width","min("+self.props.width+ "em,100%)")} >
            <div class="field has-text-right mb-0">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-primary is-soft" onClick={self.props.noSaveClick}><span class="material-symbols-outlined">save</span> {self.props.affectedRows.length == 0 ? _("Add") : ""}{self.props.affectedRows.length == 1 ? _("Save") : ""}{self.props.affectedRows.length > 1 ? _("Save all") : ""}</button>
              </div>
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-warning is-soft" onClick={self.props.noCancelClick}><span class="material-symbols-outlined">cancel</span> {_("Cancel")}</button>
              </div>
            </div>

            {self.props.columns.filter(x => x.editor_actor).map(x => {
                  return <CEditorFrame column={x} onEditorChanges={self.props.onEditorChanges} table={self.props.table} row={self.props.affectedRows.length == 0 ? null : self.props.affectedRows[0]} add={self.props.affectedRows.length == 0} batch={self.props.affectedRows.length > 1}/>;
            })}

            <div class="field has-text-right mt-5">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-primary is-soft" onClick={self.props.noSaveClick}><span class="material-symbols-outlined">save</span> {self.props.affectedRows.length == 0 ? _("Add") : ""}{self.props.affectedRows.length == 1 ? _("Save") : ""}{self.props.affectedRows.length > 1 ? _("Save all") : ""}</button>
              </div>
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-warning is-soft" onClick={self.props.noCancelClick}><span class="material-symbols-outlined">cancel</span> {_("Cancel")}</button>
              </div>
            </div>
        </div>
        </section>;
    }
}



