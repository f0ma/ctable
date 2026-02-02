class CTagsSearcher extends Component {
  constructor() {
    super();
    this.onRemoveTag = this.onRemoveTag.bind(this);
    this.onAddTag = this.onAddTag.bind(this);
    this.renderTags = this.renderTags.bind(this);
    this.renderToolbar = this.renderToolbar.bind(this);
  }

  componentDidMount(){
      this.setState({
        search_value: (this.props.value ?? "")
      })
  }

  onRemoveTag(e){
    var tag = unwind_button_or_link(e).dataset['tag'];

    var nv = this.state.search_value;
    if(this.state.search_value == null || this.state.search_value == ""){
            return;
    } else {
            var actived = this.state.search_value.split(";");
            actived = actived.filter(x => x != tag);
            actived.sort();
            nv = actived.join(";");
    }
    this.setState({search_value: nv}, () => this.props.onValueChange(this.state.search_value, Number(e.target.dataset['filterindex'])));
  }

  onAddTag(e){
      var tag = unwind_button_or_link(e).dataset['tag'];

      var nv = "";
      if((this.state.search_value === null) || (this.state.search_value == "")){
          nv = tag;
      } else {
          var actived = this.state.search_value.split(";");
          actived.push(tag);
          actived.sort();
          nv = actived.join(";");
      }
      //console.log(e.target.dataset)
      this.setState({search_value: nv}, () => this.props.onValueChange(nv, Number(e.target.dataset['filterindex'])));
  }

  renderTags(){
    var self = this;
    //console.log(self)
    if (self.state.search_value === undefined) return;
    if (self.state.search_value == null || self.state.search_value == ""){
      return <div class="input"></div>;
    } else if (self.props.column.cell_actor == "CTagsCell") {

      var actived = [];
      if (Array.isArray(self.state.search_value))
          actived = self.state.search_value
      else
          actived = self.state.search_value.split(";");

      var tags = self.props.column.options.filter(x => actived.includes(String(x[0])));
      return (
                <div class="input" style="height: auto;flex-flow: wrap;row-gap: 0.4em; min-height: 2.5em; min-width: 5em;">
                {tags.map(([tag, label]) => {
                    return  <div class="control">
                                <div class="tags has-addons mr-2">
                                    <button class="tag">{label}</button><button class="tag is-delete" data-filterindex={self.props.index} data-tag={tag} onClick={self.onRemoveTag}></button>
                                </div>
                            </div>;
                })}
                </div>
            );
    } else if (self.props.column.cell_actor == "CBoolCell") {

      var actived = [];
      if (Array.isArray(self.state.search_value))
          actived = self.state.search_value
      else
          actived = self.state.search_value.split(";");


      var tags = [{value: "1", label: _("Yes")},{value: "0", label: _("No")}].filter(x => actived.includes(x.value));
      //console.log(tags);
      //console.log(actived);
      return (
          <div class="input" style="height: auto;flex-flow: wrap;row-gap: 0.4em; min-height: 2.5em; min-width: 5em;">
              {tags.map(x => {
                  return <div class="control">
                              <div class="tags has-addons mr-2">
                                  <button class="tag">{x.label}</button><button class="tag is-delete" data-filterindex={self.props.index} data-tag={x.value} onClick={self.onRemoveTag}></button>
                              </div>
                          </div>;
              })}
          </div>
      );
    } else if (self.props.column.cell_actor == "CSelectCell") {

      var actived = [];
      if (Array.isArray(self.state.search_value))
          actived = self.state.search_value
      else
          actived = self.state.search_value.split(";");

      var tags = self.props.column.options.filter(x => actived.includes(String(x.value)));
      return (
          <div class="input" style="height: auto;flex-flow: wrap;row-gap: 0.4em; min-height: 2.5em; min-width: 5em;">
              {tags.map(x => {
                  return <div class="control">
                              <div class="tags has-addons mr-2">
                                  <button class="tag">{x.label}</button><button class="tag is-delete" data-filterindex={self.props.index} data-tag={x.value} onClick={self.onRemoveTag}></button>
                              </div>
                          </div>;
              })}
          </div>
      );
    }
  }


  renderToolbar(){
    var self = this;
    var buttons = self.props.column.options
    //console.log(self)

    if (self.state.search_value === undefined) return;
    if (self.props.column.cell_actor == "CTagsCell"){
        var actived = [];
        if (this.state.search_value !== undefined && this.state.search_value !== null) {
            actived = self.state.search_value.split(";");
        }
        var tags = self.props.column.options.filter(x => !actived.includes(x[0]))
        return (
          <div class="field">
              <div class="control">
                  <div class="buttons are-small is-flex is-flex-wrap-wrap">
                    {tags.map(([val, label]) => (
                      <button type="button" class="button is-small" data-filterindex={self.props.index} data-tag={val} onClick={self.onAddTag}
                          title={label.slice(0, self.props.column.max_length) + (label.length > 32 ? "..." : "")}>
                          {label}
                      </button>
                  ))}
                  </div>
              </div>
          </div>
      );
    } else if (self.props.column.cell_actor == "CBoolCell") {
        var actived = [];
        if (this.state.search_value !== undefined && this.state.search_value !== null) {
            actived = self.state.search_value.split(";");
        }
        var tags = [{value: 1, label: _("Yes")},{value: 0, label: _("No")}].filter(x => !actived.includes(x.value));
        return (
          <div class="field">
              <div class="control">
                  <div class="buttons are-small is-flex is-flex-wrap-wrap">
                    {tags.map(x => (
                      <button type="button" class="button is-small" data-filterindex={self.props.index} data-tag={x.value} onClick={self.onAddTag}
                          title={x.label.slice(0, self.props.column.max_length) + (x.label.length > 32 ? "..." : "")}>
                          {x.label}
                      </button>
                  ))}
                  </div>
              </div>
          </div>
        );
    } else if (self.props.column.cell_actor == "CSelectCell") {
        //console.log(self.state)
        var actived = [];
        if (this.state.search_value !== undefined && this.state.search_value !== null) {
            actived = self.state.search_value.split(";");
        }

        var tags = self.props.column.options.filter(x => !actived.includes(x.value));
        return (
          <div class="field">
              <div class="control">
                  <div class="buttons are-small is-flex is-flex-wrap-wrap">
                    {tags.map(x => (
                      <button type="button" class="button is-small" data-filterindex={self.props.index} data-tag={x.value} onClick={self.onAddTag}
                          title={x.label.slice(0, self.props.column.max_length) + (x.label.length > 32 ? "..." : "")}>
                          {x.label}
                      </button>
                  ))}
                  </div>
              </div>
          </div>
        );
    }
  }


  render(){
      var self = this;
      return  <div>
                  <div class="select ml-2 mb-2">
                      <select value={self.props.column.name} data-filterindex={self.props.index} onChange={self.props.onColumnChange} title={_("Column to search")}>
                          {self.props.table.state.table_columns.filter(w =>  w.search_actor !== null).map(y => {
                              return <option value={y.name}>{y.label}</option>;
                          }) }
                      </select>
                  </div>
                  <div class="select ml-2 mb-2">
                      <select  value={self.props.operator ?? "neq"}  data-filterindex={self.props.index} onChange={self.props.onOperatorChange} title={_("Search kind")}>
                          <option value="eq">=</option>
                          <option value="neq">!=</option>
                          <option value="in">IN</option>
                          <option value="not_in">NOT IN</option>
                          {self.props.column.editor_allow_null ? <option value="is_null">Is NULL</option> : ""}
                          {self.props.column.editor_allow_null ? <option value="is_not_null">Is not NULL</option> : ""}
                      </select>
                  </div>
                  {self.props.operator === "is_null" || self.props.operator === "is_not_null" ? "" :(
                  <div class={cls("control field is-grouped is-grouped-multiline", self.state.editor_value === null ? "has-icons-left" : "")}>
                      {self.renderTags()}
                      {self.renderToolbar()}
                  </div>)}
                  <div class="ml-2 mb-2" style="display: inline-block;">
                      <button class="button is-danger is-soft" data-filterindex={self.props.index} onClick={self.props.onDeleteClick} title={_("Delete criteria")}><span class="material-symbols-outlined">delete</span></button>
                  </div>
              </div>
  }
}

ctable_register_class("CTagsSearcher", CTagsSearcher);
