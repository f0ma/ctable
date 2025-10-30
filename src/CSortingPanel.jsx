/**
 * Column panel class.
 *
 * @arg this.props.table {Object} Table object.
 * @arg this.props.columns {Array} Link to CTable state table_columns
 * @arg this.props.width {int} Width in em.
 *
 */

class CSortingPanel extends Component {

    constructor() {
      super();

      this.onSortChange = this.onSortChange.bind(this);
      this.onColumnUp = this.onColumnUp.bind(this);
      this.onColumnDown = this.onColumnDown.bind(this);
    }

    onSortChange(x){
      var colname = unwind_button_or_link(x).dataset['column'];

      var col = this.props.columns.filter(y => y.name == colname)[0];
      if(col.sorting === false) return;

      var newcol = this.props.table.state.view_sorting;
      newcol.forEach(y => {if (y.name == colname){
        if (y.sorting == ""){
          y.sorting = "asc";
          return;
        }
        if (y.sorting == "asc"){
          y.sorting = "desc";
          return;
        }
        if (y.sorting == "desc"){
          y.sorting = "";
          return;
        }
      }});
      this.props.table.state.view_sorting = newcol;
      this.props.table.onSortingChange();
    }

    onColumnUp(x){
      var colname = unwind_button_or_link(x).dataset['column'];
      var colindex = -1;
      var newcol = this.props.table.state.view_sorting;
      newcol.forEach((y,i) => {if (y.name == colname) colindex = i;});
      if(colindex > 0){
        [newcol[colindex-1], newcol[colindex]] = [newcol[colindex], newcol[colindex-1]];
        this.props.table.state.view_sorting = newcol;
        this.props.table.onSortingChange();
      }
    }

    onColumnDown(x){
      var colname = unwind_button_or_link(x).dataset['column'];
      var colindex = -1;
      var newcol = this.props.table.state.view_sorting;
      newcol.forEach((y,i) => {if (y.name == colname) colindex = i;});
      if(colindex < newcol.length-1){
        [newcol[colindex+1], newcol[colindex]] = [newcol[colindex], newcol[colindex+1]];
        this.props.table.state.view_sorting = newcol;
        this.props.table.onSortingChange();
      }
    }

    render() {

        var self = this;


        return  <section class="section ctable-editor-section" >
          <div class="ctable-editor-panel box" style={sty("width","min("+self.props.width+ "em,100%)", "min-height" , "40vh")} >
            <div class="field has-text-right mb-4">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-warning is-soft" onClick={self.props.onResetSorting}><span class="material-symbols-outlined">refresh</span> {_("Reset")}</button>
              </div>
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-soft" onClick={self.props.onCloseSorting}><span class="material-symbols-outlined">close</span> {_("Close")}</button>
              </div>
            </div>
             {self.props.table.state.view_sorting.map(x => {
               return <div style="white-space: nowrap;">
                          <button class="button is-small" data-column={x.name} onClick={self.onSortChange}><span class="material-symbols-outlined">{x.sorting == "" ? "reorder" : ""}{x.sorting == "asc" ? "arrow_upward" : ""}{x.sorting == "desc" ? "arrow_downward" : ""}</span></button>&nbsp;
                          <span class="ml-2 mr-2" style="min-width:10em; width:10em; display:inline-block; overflow: hidden;">{this.props.table.state.table_columns.filter(y => y.name == x.name)[0].label}</span>
                          &nbsp;<button class="button is-small" data-column={x.name} onClick={self.onColumnUp}><span class="material-symbols-outlined">keyboard_arrow_up</span></button>
                          &nbsp;<button class="button is-small" data-column={x.name} onClick={self.onColumnDown}><span class="material-symbols-outlined">keyboard_arrow_down</span></button>
                    </div>;
            })}

            <div class="field has-text-right mt-5">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-warning is-soft" onClick={self.props.onResetSorting}><span class="material-symbols-outlined">refresh</span> {_("Reset")}</button>
              </div>
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-soft" onClick={self.props.onCloseSorting}><span class="material-symbols-outlined">close</span> {_("Close")}</button>
              </div>
            </div>
        </div>
        </section>;
    }
}



