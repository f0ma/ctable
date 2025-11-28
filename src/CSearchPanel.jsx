class CSearchPanel extends Component {

    constructor() {
      super();

      this.onColumnChange = this.onColumnChange.bind(this);
      this.onOperatorChange = this.onOperatorChange.bind(this);
      this.onValueChange = this.onValueChange.bind(this);
      this.onDeleteClick =  this.onDeleteClick.bind(this);
      this.onAddClick =  this.onAddClick.bind(this);

    }

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
          this.props.table.state.view_filtering[i].value = this.props.table.state.view_filtering[i].value.split(";").map(x => x.trim());
        }
      } else {
        if(Array.isArray(this.props.table.state.view_filtering[i].value)){
          this.props.table.state.view_filtering[i].value = this.props.table.state.view_filtering[i].value.join(",");
        }
      }

      this.props.table.setState({});
      this.props.table.onFilterChange();
    }

    onValueChange(value, index){
      this.props.table.state.view_filtering[index].value = value;

      if(this.props.table.state.view_filtering[index].operator == 'in' || this.props.table.state.view_filtering[index].operator == 'not_in'){
        if(!Array.isArray(this.props.table.state.view_filtering[index].value)){
          this.props.table.state.view_filtering[index].value = this.props.table.state.view_filtering[index].value.split(";").map(x => x.trim());
        }
      } else {
        if(Array.isArray(this.props.table.state.view_filtering[index].value)){
          this.props.table.state.view_filtering[index].value = this.props.table.state.view_filtering[index].value.join(",");
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
      this.props.table.state.view_filtering.push({column: this.props.table.state.table_columns[0].name, operator:"like_lr", value:""});
      this.props.table.setState({});
      this.props.table.onFilterChange();
    }

  render() {
    var self = this
    return  <section class="section ctable-editor-section" >
          <div class="ctable-editor-panel" style={sty("width","min("+self.props.width+ "em,100%)")} >
            <div class="field has-text-right mb-0">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-soft" onClick={self.props.onCloseSearch}><span class="material-symbols-outlined">close</span> {_("Close")}</button>
              </div>
            </div>
             {self.props.table.state.view_filtering.map((x,i) => {
              return <div>
                <CSearchFrame index={i} column={self.props.table.state.table_columns.filter(y => y.name == x.column)[0]} operator={x.operator} value={x.value} table={self.props.table} onDeleteClick={self.onDeleteClick} onColumnChange={self.onColumnChange} onOperatorChange={self.onOperatorChange} onValueChange={self.onValueChange}/>
                    </div>
            })}

            <button class="button is-primary is-soft mt-4" onClick={self.onAddClick}>{_("Add criteria")}</button>

            <div class="field has-text-right mt-5">
              <div class="has-text-centered m-2"  style="display:inline-block;">
                <button class="button is-small is-soft" onClick={self.props.onCloseSearch}><span class="material-symbols-outlined">close</span> {_("Close")}</button>
              </div>
            </div>
          </div>
        </section>;
  }
}
