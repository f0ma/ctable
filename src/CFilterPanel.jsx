/**
 * Column panel class.
 *
 * @arg this.props.table {Object} Table object.
 * @arg this.props.width {int} Width in em.
 *
 */

class CFilterPanel extends Component {

    constructor() {
      super();

      this.onColumnChange = this.onColumnChange.bind(this);
      this.onOperatorChange = this.onOperatorChange.bind(this);
      this.onValueChange = this.onValueChange.bind(this);
      this.onDeleteClick =  this.onDeleteClick.bind(this);
      this.onAddClick =  this.onAddClick.bind(this);

    }

//    onColumnEnableChanged(x){
//      var colname = x.target.dataset['column'];
//      var newcol = this.props.table.state.view_columns;
//      newcol.forEach(y => {if (y.name == colname) y.enabled = x.target.checked;});
//      this.props.table.setState({view_columns: newcol});
//    }
//
//    onColumnUp(x){
//      var colname = unwind_button_or_link(x).dataset['column'];
//      var colindex = -1;
//      var newcol = this.props.table.state.view_columns;
//      newcol.forEach((y,i) => {if (y.name == colname) colindex = i;});
//      if(colindex > 0){
//        [newcol[colindex-1], newcol[colindex]] = [newcol[colindex], newcol[colindex-1]];
//        this.props.table.setState({view_columns: newcol});
//      }
//    }
//
//    onColumnDown(x){
//      var colname = unwind_button_or_link(x).dataset['column'];
//      var colindex = -1;
//      var newcol = this.props.table.state.view_columns;
//      newcol.forEach((y,i) => {if (y.name == colname) colindex = i;});
//      if(colindex < newcol.length-1){
//        [newcol[colindex+1], newcol[colindex]] = [newcol[colindex], newcol[colindex+1]];
//        this.props.table.setState({view_columns: newcol});
//      }
//    }

    onColumnChange(x){
      var i = Number(x.target.dataset['filterindex']);
      this.props.table.state.view_filtering[i].column = x.target.value;
      this.props.table.setState({});
      this.props.table.onFilterChange();
    }

    onOperatorChange(x){
      var i = Number(x.target.dataset['filterindex']);
      this.props.table.state.view_filtering[i].operator = x.target.value;

      if(this.props.table.state.view_filtering[i].operator == 'in' || this.props.table.state.view_filtering[i].operator == 'not_in'){
        if(!Array.isArray(this.props.table.state.view_filtering[i].value)){
          this.props.table.state.view_filtering[i].value = this.props.table.state.view_filtering[i].value.split(",").map(x => x.trim());
        }
      } else {
        if(Array.isArray(this.props.table.state.view_filtering[i].value)){
          this.props.table.state.view_filtering[i].value = this.props.table.state.view_filtering[i].value.join(",");
        }
      }

      this.props.table.setState({});
      this.props.table.onFilterChange();
    }

    onValueChange(x){
      var i = Number(x.target.dataset['filterindex']);
      this.props.table.state.view_filtering[i].value = x.target.value;

      if(this.props.table.state.view_filtering[i].operator == 'in' || this.props.table.state.view_filtering[i].operator == 'not_in'){
        if(!Array.isArray(this.props.table.state.view_filtering[i].value)){
          this.props.table.state.view_filtering[i].value = this.props.table.state.view_filtering[i].value.split(",").map(x => x.trim());
        }
      } else {
        if(Array.isArray(this.props.table.state.view_filtering[i].value)){
          this.props.table.state.view_filtering[i].value = this.props.table.state.view_filtering[i].value.join(",");
        }
      }

      this.props.table.setState({});
      this.props.table.onFilterChange();
    }

    onDeleteClick(x){
      var i = Number(x.target.dataset['filterindex']);
      this.props.table.state.view_filtering.splice(i, 1);
      this.props.table.setState({});
      this.props.table.onFilterChange();
    }

    onAddClick(x){
      this.props.table.state.view_filtering.push({column: this.props.table.state.table_columns[0].name, operator:"neq", value:""});
      this.props.table.setState({});
      this.props.table.onFilterChange();
    }

    render() {

        var self = this;


        return  <section class="section ctable-editor-section" >
          <div class="ctable-editor-panel box" style={sty("width","min("+self.props.width+ "em,100%)", "min-height" , "30vh")} >
            <div class="field has-text-right mb-0">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-warning is-soft" onClick={self.props.onResetFilter}><span class="material-symbols-outlined">refresh</span> {_("Reset")}</button>
              </div>
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-soft" onClick={self.props.onCloseFilter}><span class="material-symbols-outlined">close</span> {_("Close")}</button>
              </div>
            </div>
            {
              // onChange={this.onInputChange} self.props.table.state.table_columns}
            }

             {self.props.table.state.view_filtering.map((x,i) => {
              return <div>
                      <div class="select">
                        <select  value={x.column} data-filterindex={i} onChange={self.onColumnChange}>
                          {self.props.table.state.table_columns.map(y => {
                            return <option value={y.name}>{y.label}</option>;
                          }) }
                        </select>
                      </div>
                      <div class="select">
                        <select  value={x.operator}  data-filterindex={i} onChange={self.onOperatorChange}>
                          <option value="eq">=</option>
                          <option value="neq">!=</option>
                          <option value="ge">&gt;=</option>
                          <option value="gt">&gt;</option>
                          <option value="le">&lt;=</option>
                          <option value="lt">&lt;</option>
                          <option value="in">IN</option>
                          <option value="not_in">NOT IN</option>
                          <option value="is_null">Is NULL</option>
                          <option value="is_not_null">Is not NULL</option>
                          <option value="like_lr">…A…</option>
                          <option value="like_l">…A</option>
                          <option value="like_r">A…</option>
                        </select>
                      </div>
                      <div style="display: inline-block;">
                        <input class="input" type="text" value={x.value} data-filterindex={i}  onChange={self.onValueChange}/>
                      </div>
                      <button class="button is-danger is-soft" data-filterindex={i} onClick={self.onDeleteClick}><span class="material-symbols-outlined">delete</span></button>
                    </div>;
            })}

            <button class="button is-primary is-soft mt-4" onClick={self.onAddClick}> {_("Add")} </button>

            <div class="field has-text-right mt-5">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-warning is-soft" onClick={self.props.onResetFilter}><span class="material-symbols-outlined">refresh</span> {_("Reset")}</button>
              </div>
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-soft" onClick={self.props.onCloseFilter}><span class="material-symbols-outlined">close</span> {_("Close")}</button>
              </div>
            </div>
        </div>
        </section>;
    }
}



