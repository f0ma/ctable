/**
 * @typedef {Function} CTable#OnEditorChanges
 * @param {string} colname
 * @param {bool} is_modified
 * @param {*} value
 * @param {bool} valid
 */

/**
 * @typedef {Object} CTable#EditorChange
 * @property {bool} is_modified
 * @property {*} value
 * @property {bool} valid
 */

/**
* @event CTable#cteditorchanged
* @property {string} initiator
* @property {CTable#EditorChange[]} changes
*/


/**
 * Base table class.
 *
 * @arg this.props.server {Object} JRPC object.
 *
 * @fires CTable#cteditorchanged
 */

class CTable extends Component {

  constructor() {
    super();

    this.topButtonClick = this.topButtonClick.bind(this);
    this.headerXScroll = this.headerXScroll.bind(this);
    this.tableXScroll = this.tableXScroll.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.onTableSelectDropdownClick = this.onTableSelectDropdownClick.bind(this);
    this.onTableSelectClick = this.onTableSelectClick.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
    this.onCancelClick = this.onCancelClick.bind(this);
    this.onEditorChanges = this.onEditorChanges.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.getAffectedKeys = this.getAffectedKeys.bind(this);
    this.showError = this.showError.bind(this);

    this.setState({
      width: 50,
      fontSize: 100,
      table_list: [],
      current_table: {},
      links: [],
      progress: true,
      last_row_clicked: null,
      topline_buttons: [

        {name:"add", icon: "add", label:_("Add"), enabled: true, style:"is-primary", icon_only:false},
        {name:"edit", icon: "edit", label:_("Edit"), enabled: false, style:"is-warning", icon_only:false},
        {name:"duplicate", icon: "content_copy", label:_("Duplicate"), enabled: false, style:"is-warning", icon_only:false},
        {name:"delete", icon: "delete", label:_("Delete"), enabled: false, style:"is-danger", icon_only:false},

        {name:"enter", icon: "subdirectory_arrow_right", label:_("Enter"), enabled: true, style:"", icon_only:false},
        {name:"back", icon: "arrow_back", label:_("Go back"), enabled: true, style:"", icon_only:false},

        {name:"filter", icon: "filter_alt", label:_("Filter"), enabled: true, style:"", icon_only:false},
        {name:"sort", icon: "sort", label:_("Sorting"), enabled: true, style:"", icon_only:false},
        {name:"columns", icon: "list_alt", label:_("Columns"), enabled: true, style:"", icon_only:false},


        {name:"select_all", icon: "select_all", label:_("Select all"), enabled: true, style:"", icon_only:true},
        {name:"clear_all", icon: "remove_selection", label:_("Clear all"), enabled: true, style:"", icon_only:true},


        {name:"zoom_in", icon: "zoom_in", label:_("Zoom In"), enabled: true, style:"", icon_only:true},
        {name:"zoom_out", icon: "zoom_out", label:_("Zoom Out"), enabled: true, style:"", icon_only:true},
        {name:"zoom_reset", icon: "search", label:_("Reset Zoom"), enabled: false, style:"", icon_only:true},
      ],
      table_columns :[ ],
      table_rows:[ ],
      table_row_status:[ ],
      table_select_menu_active: false,
      editor_show: false,
      editor_affected_rows: [],
      editor_changes: {},
      editor_operation: '',
    });

  }

  componentDidMount() {
      var self = this;
      self.props.server.version().then(x => console.log(x));
      let tables_p = self.props.server.CTableServer.tables();
      let links_p = self.props.server.CTableServer.links();

      self.props.server.slots.tableChanged.push(this.reloadData);

      Promise.all([tables_p, links_p]).then(x => {
        self.state.table_list = x[0];
        self.state.current_table = x[0][0];
        self.state.width = x[0][0].width;
        self.state.links = x[1];

        self.setState({});

        let table_columns_p = self.props.server.CTableServer.columns(self.state.current_table.name).then((c) => {
          this.setState({table_columns: c}, () => {self.reloadData()})
        });

      });
  }

  reloadData(){
    this.setState({progress: true});

    var keys = this.getAffectedKeys();

    let table_rows_p = this.props.server.CTableServer.select(this.state.current_table.name).then((r) => {
      this.state.table_rows = r;
      this.state.table_row_status = [];
      this.state.table_rows.forEach(x => {


        var issel = false;

        keys.forEach(w =>{ if(!issel) {issel = Object.keys(w).map(q => w[q] == x[q]).every(u => u)} });

        this.state.table_row_status.push({selected: issel});

      })
      this.state.progress = false;
      this.state.last_row_clicked = null;
      this.setState({}, () => {
        this.enablePanelButtons()
      });
    });
  }

  topButtonClick(e) {
    var tg = unwind_button(e);


    if(tg.dataset['name'] == "zoom_in" || tg.dataset['name'] == "zoom_out" || tg.dataset['name'] == "zoom_reset") {

        if(tg.dataset['name'] == "zoom_in"){
          if (this.state.fontSize < 300){
              this.state.fontSize = this.state.fontSize + 25;
          }

        }

        if(tg.dataset['name'] == "zoom_out"){
          if (this.state.fontSize > 25){
            this.state.fontSize = this.state.fontSize - 25;
          }
        }

        if(tg.dataset['name'] == "zoom_reset"){
          this.state.fontSize = 100;
        }


        if (this.state.fontSize != 100)
          this.state.topline_buttons.filter(x => x.name == "zoom_reset").forEach(x => x.enabled = true);
        else
          this.state.topline_buttons.filter(x => x.name == "zoom_reset").forEach(x => x.enabled = false);

        this.setState({});
        return;

    }


    if(tg.dataset['name'] == "select_all"){
      if(this.state.editor_show == true) return;
      this.state.table_row_status = [];
      this.state.table_rows.forEach(x => {this.state.table_row_status.push({selected: true})});
      this.setState({}, () => this.enablePanelButtons());
      return;
    }

    if(tg.dataset['name'] == "clear_all"){
      if(this.state.editor_show == true) return;
      this.state.table_row_status = [];
      this.state.table_rows.forEach(x => {this.state.table_row_status.push({selected: false})});
      this.setState({}, () => this.enablePanelButtons());
      return;
    }


    if(tg.dataset['name'] == "add"){
      this.setState({editor_show: true, editor_affected_rows: [], editor_changes: {}, editor_operation: 'add'});
      return;
    }

    if(tg.dataset['name'] == "edit"){
      this.setState({editor_show: true, editor_affected_rows: this.state.table_rows.filter((x,i) => this.state.table_row_status[i].selected), editor_changes: {}, editor_operation: 'edit'});
      return;
    }

    if(tg.dataset['name'] == "duplicate"){
      if(this.getAffectedKeys().length == 0) return; // no rows affected
      this.setState({progress: true});
      this.props.server.CTableServer.duplicate(this.state.current_table.name, this.getAffectedKeys()).then(()=> {this.reloadData();}).catch((e) => {this.showError(e); this.setState({progress: false})});
    }

    if(tg.dataset['name'] == "delete"){
      if(this.getAffectedKeys().length == 0) return; // no rows affected
      this.setState({progress: true});
      this.props.server.CTableServer.delete(this.state.current_table.name, this.getAffectedKeys()).then(()=> {this.reloadData();}).catch((e) => {this.showError(e); this.setState({progress: false})});

    }

  }

  getAffectedKeys(){
    var affected_rows = this.state.table_rows.filter((x,i) => this.state.table_row_status[i].selected);
    var keys = this.state.table_columns.filter((x) => x.is_key).map((x) => x.name);
    var keys_values = affected_rows.map((x) => {
      var res = {};
      keys.forEach((k) => res[k] = x[k]);
      return res;
    });
    return keys_values;
  }

  headerXScroll(e){
    document.querySelector(".ctable-scroll-main-table").scrollLeft = e.target.scrollLeft;
  }

  tableXScroll(e){
    document.querySelector(".ctable-scroll-head-table").scrollLeft = e.target.scrollLeft;
  }

  onRowClick(e){
    if(this.state.editor_show == true) return;
    var tg = unwind_tr(e);
    var ns = [];
    var nv = this.state.last_row_clicked;
    this.state.last_row_clicked = Number(tg.dataset['rowindex']);

    if (e.getModifierState("Shift")){
      if (nv !== null){
        if (nv > Number(tg.dataset['rowindex'])){
            while (nv >= Number(tg.dataset['rowindex'])){
              ns.push(nv);
              nv = nv - 1;
            }
        } else {
            while (nv <= Number(tg.dataset['rowindex'])){
              ns.push(nv);
              nv = nv + 1;
            }
        }
      }
    } else {
      ns = [Number(tg.dataset['rowindex'])];
    }

    //console.log(ns);

    var target_state = !this.state.table_row_status[Number(tg.dataset['rowindex'])].selected;
    ns.forEach((n) => {this.state.table_row_status[n].selected = target_state});
    this.setState({}, () => this.enablePanelButtons());
  }

  enablePanelButtons(){
    var sel_count = this.state.table_row_status.filter(x => x.selected == true).length;

    if(sel_count == 0) {
      this.state.topline_buttons.filter(x => x.name == "edit").forEach(x => x.enabled = false);
      this.state.topline_buttons.filter(x => x.name == "duplicate").forEach(x => x.enabled = false);
      this.state.topline_buttons.filter(x => x.name == "delete").forEach(x => x.enabled = false);
    } else {
      this.state.topline_buttons.filter(x => x.name == "edit").forEach(x => x.enabled = true);
      this.state.topline_buttons.filter(x => x.name == "duplicate").forEach(x => x.enabled = true);
      this.state.topline_buttons.filter(x => x.name == "delete").forEach(x => x.enabled = true);
    }

    this.setState({});
  }

  onTableSelectDropdownClick(){
    this.setState({table_select_menu_active: !this.state.table_select_menu_active});
  }

  onTableSelectClick(x){
    var tbl = this.state.table_list.filter(y => y.label == x.target.dataset.label)[0];
    this.setState({current_table: tbl, table_select_menu_active: false, width: tbl.width});
  }


  onSaveClick(){
    if (Object.keys(this.state.editor_changes).filter(x => this.state.editor_changes[x].is_modified == true && this.state.editor_changes[x].valid == false).length > 0){
      return; //Has invalid fields
    }

    if (Object.keys(this.state.editor_changes).filter(x => this.state.editor_changes[x].is_modified == true).length == 0){
      return; //Has no modified fields
    }

    var modified_data = Object.keys(this.state.editor_changes).filter(x => this.state.editor_changes[x].is_modified == true && this.state.editor_changes[x].valid == true);
    var data_to_send = {};
    modified_data.forEach(x => {data_to_send[x] = this.state.editor_changes[x].value});


    if(this.state.editor_operation == 'add'){
      this.setState({progress: true});
      this.props.server.CTableServer.insert(this.state.current_table.name, data_to_send).then(()=> {this.setState({editor_show: false}); this.reloadData();}).catch((e) => {this.showError(e); this.setState({progress: false});});
    }

    if(this.state.editor_operation == 'edit'){
      if(this.state.editor_affected_rows.length == 0) return; // no rows affected
      this.setState({editor_show: false, progress: true});
      this.props.server.CTableServer.update(this.state.current_table.name, this.getAffectedKeys(), data_to_send).then(()=> {this.setState({editor_show: false});  this.reloadData();}).catch((e) => {this.showError(e); this.setState({progress: false});});
    }

  }

  showError(e){
    alert(String(e.code) + ": " + e.message);
  }

  onCancelClick(){
    this.setState({editor_show: false, editor_changes: [], editor_operation: ''});
  }

  onEditorChanges(colname, is_modified, value, valid){
      this.state.editor_changes[colname] = {is_modified: is_modified, value: value, valid: valid};

      this.base.querySelectorAll(".ctable-editor-control div").forEach(x => x.dispatchEvent(new CustomEvent("cteditorchanged", { detail: {initiator:colname, changes:this.state.editor_changes} })));
  }

  render() {

  var self = this;

  return <div>
  <section class="section pt-3 pb-0 pl-0 pr-0 ctable-top-panel">
    <div class="ctable-top-panel-block" style={sty("max-width", (self.state.width+2)+"em")}>
      <div  class="pl-3 pr-3">
        <table class="ctable-title-table">
          <colgroup>
            <col span="1" style="width: 20%;"/>
            <col span="1" style="width: 60%;"/>
            <col span="1" style="width: 20%;"/>
          </colgroup>
          <tr>
            <td>
              <div class={cls("dropdown", self.state.table_select_menu_active ? "is-active" : "")}>
                <div class="dropdown-trigger">
                  <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu" onClick={this.onTableSelectDropdownClick}>
                    <span class="icon"><span class="material-symbols-outlined">menu</span></span>
                    <span class="icon is-small"><span class="material-symbols-outlined">arrow_drop_down</span></span>
                  </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                  <div class="dropdown-content">
                    {self.state.table_list.map(x =>
                        <a class={cls("dropdown-item", x.name == self.state.current_table.name ? "is-active" : "")} data-label={x.name} onClick={this.onTableSelectClick}><span class="material-symbols-outlined-small">lists</span> {x.label}</a>
                    )}
                    <hr class="dropdown-divider" />
                    {self.state.links.map(x =>
                      <a class="dropdown-item" href={x.url}><span class="material-symbols-outlined-small">link</span> {x.label}</a>
                    )}
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div class="ctable-top-panel-text">
                <div class="is-hidden-mobile" style="display:inline-block;"><span class="material-symbols-outlined-small">lists</span>&nbsp;{self.state.current_table.label}</div>
              </div>
            </td>
            <td class="has-text-right">
              <div class="dropdown is-right">
                <div class="dropdown-trigger">
                  <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu">
                    <span class="icon"><span class="material-symbols-outlined">person</span></span>
                    <span class="icon is-small"><span class="material-symbols-outlined">arrow_drop_down</span></span>
                  </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                  <div class="dropdown-content has-text-left">
                    <a class="dropdown-item"><span class="material-symbols-outlined-small">login</span> Войти в систему</a>
                    <hr class="dropdown-divider" />
                    <a class="dropdown-item"><span class="material-symbols-outlined-small">logout</span> Выйти из системы</a>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
      <div  class="ctable-scroll-button-panel">
        <div class="ctable-button-panel" style={sty("width", "80em")}>
          {self.state.topline_buttons.filter(x => x.enabled).map(x =>
            <div class="has-text-centered m-2"  style="display:inline-block;">
              <button class={cls("button","is-small","is-soft",x.style)} data-name={x.name} onClick={this.topButtonClick}><span class="material-symbols-outlined">{x.icon}</span>{x.icon_only ? "" : " "+x.label}</button>
            </div>
          )}
        </div>
      </div>
      <CHeaderTable width={self.state.width} fontSize={self.state.fontSize} columns={self.state.table_columns} onHeaderXScroll={self.headerXScroll} progress={self.state.progress} />
    </div>
  </section>
  <CPageTable width={self.state.width} fontSize={self.state.fontSize} columns={self.state.table_columns} row_status={self.state.table_row_status} rows={self.state.table_rows} onRowClick={self.onRowClick}  onTableXScroll={self.tableXScroll} editorShow={self.state.editor_show}/>
  {self.state.editor_show ? <CEditorPanel width={self.state.width} columns={self.state.table_columns} affectedRows={self.state.editor_affected_rows} noSaveClick={self.onSaveClick} noCancelClick={self.onCancelClick} onEditorChanges={self.onEditorChanges} /> : ""}
  </div>;

  }


}
