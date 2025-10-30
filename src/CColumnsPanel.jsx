/**
 * Column panel class.
 *
 * @arg this.props.table {Object} Table object.
 * @arg this.props.width {int} Width in em.
 *
 */

class CColumnsPanel extends Component {

    constructor() {
      super();

      this.onColumnEnableChanged = this.onColumnEnableChanged.bind(this);
      this.onColumnUp = this.onColumnUp.bind(this);
      this.onColumnDown = this.onColumnDown.bind(this);
    }

    onColumnEnableChanged(x){
      var colname = x.target.dataset['column'];
      var newcol = this.props.table.state.view_columns;
      newcol.forEach(y => {if (y.name == colname) y.enabled = x.target.checked;});
      this.props.table.setState({view_columns: newcol});
    }

    onColumnUp(x){
      var colname = unwind_button_or_link(x).dataset['column'];
      var colindex = -1;
      var newcol = this.props.table.state.view_columns;
      newcol.forEach((y,i) => {if (y.name == colname) colindex = i;});
      if(colindex > 0){
        [newcol[colindex-1], newcol[colindex]] = [newcol[colindex], newcol[colindex-1]];
        this.props.table.setState({view_columns: newcol});
      }
    }

    onColumnDown(x){
      var colname = unwind_button_or_link(x).dataset['column'];
      var colindex = -1;
      var newcol = this.props.table.state.view_columns;
      newcol.forEach((y,i) => {if (y.name == colname) colindex = i;});
      if(colindex < newcol.length-1){
        [newcol[colindex+1], newcol[colindex]] = [newcol[colindex], newcol[colindex+1]];
        this.props.table.setState({view_columns: newcol});
      }
    }

    render() {

        var self = this;


        return  <section class="section ctable-editor-section" >
          <div class="ctable-editor-panel box" style={sty("width","min("+self.props.width+ "em,100%)", "min-height" , "40vh")} >
            <div class="field has-text-right mb-4">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-warning is-soft" onClick={self.props.onResetColumns}><span class="material-symbols-outlined">refresh</span> {_("Reset")}</button>
              </div>
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-soft" onClick={self.props.onCloseColumns}><span class="material-symbols-outlined">close</span> {_("Close")}</button>
              </div>
            </div>
             {self.props.table.state.view_columns.map(x => {
              return <div>
                          <label class="checkbox" style="min-width:10em; width:10em; overflow: hidden;"><input type="checkbox" checked={x.enabled} data-column={x.name} onChange={self.onColumnEnableChanged}/>&nbsp;{this.props.table.state.table_columns.filter(y => y.name == x.name)[0].label}</label>
                          &nbsp;<button class="button is-small" data-column={x.name} onClick={self.onColumnUp}><span class="material-symbols-outlined">keyboard_arrow_up</span></button>
                          &nbsp;<button class="button is-small" data-column={x.name} onClick={self.onColumnDown}><span class="material-symbols-outlined">keyboard_arrow_down</span></button>
                    </div>;
            })}

            <div class="field has-text-right mt-5">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-warning is-soft" onClick={self.props.onResetColumns}><span class="material-symbols-outlined">refresh</span> {_("Reset")}</button>
              </div>
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-soft" onClick={self.props.onCloseColumns}><span class="material-symbols-outlined">close</span> {_("Close")}</button>
              </div>
            </div>
        </div>
        </section>;
    }
}



