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
 * @arg this.props.allow_guest {boolean} Allow getting data without login.
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

    this.onPanel0DropdownClick = this.onPanel0DropdownClick.bind(this);
    this.onPanel1DropdownClick = this.onPanel1DropdownClick.bind(this);

    this.askUser = this.askUser.bind(this);
    this.userResolveYes = this.userResolveYes.bind(this);
    this.userResolveNo = this.userResolveNo.bind(this);

    this.onResetColumns = this.onResetColumns.bind(this);
    this.onCloseColumns = this.onCloseColumns.bind(this);

    this.onResetSorting = this.onResetSorting.bind(this);
    this.onSortingChange = this.onSortingChange.bind(this);
    this.onCloseSorting = this.onCloseSorting.bind(this);

    this.onResetFilter = this.onResetFilter.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.onCloseFilter = this.onCloseFilter.bind(this);

    this.onDownloadFile = this.onDownloadFile.bind(this);
    this.onUploadFile = this.onUploadFile.bind(this);

    this.getOptionsForField = this.getOptionsForField.bind(this);


    this.setState({
      width: 50,
      fontSize: 100,
      table_list: [],
      current_table: {},
      links: [],
      progress: true,
      last_row_clicked: null,
      topline_buttons: [

        {name:"back", icon: "arrow_back", label:_("Go back"), enabled: false, style:"", icon_only:false, panel:1},

        {name:"enter", icon: "subdirectory_arrow_right", label:_("Enter"), enabled: false, style:"", icon_only:false, panel:1},
        {name:"enter", icon: "subdirectory_arrow_right", label:_("Enter"), enabled: false, style:"", icon_only:false, panel:1},
        {name:"enter", icon: "subdirectory_arrow_right", label:_("Enter"), enabled: false, style:"", icon_only:false, panel:1},
        {name:"enter", icon: "subdirectory_arrow_right", label:_("Enter"), enabled: false, style:"", icon_only:false, panel:1},
        {name:"enter", icon: "subdirectory_arrow_right", label:_("Enter"), enabled: false, style:"", icon_only:false, panel:1},

        {name:"add", icon: "add", label:_("Add"), enabled: true, style:"is-primary", icon_only:true, panel:1},
        {name:"edit", icon: "edit", label:_("Edit"), enabled: false, style:"is-warning", icon_only:true, panel:1},
        {name:"duplicate", icon: "content_copy", label:_("Duplicate"), enabled: false, style:"is-warning", icon_only:true, panel:1},
        {name:"delete", icon: "delete", label:_("Delete"), enabled: false, style:"is-danger", icon_only:true, panel:1},

        {name:"reload", icon: "refresh", label:_("Reload"), enabled: true, style:"", icon_only:true, panel:0},

        {name:"filter", icon: "filter_alt", label:_("Filter"), enabled: true, style:"", icon_only:true, panel:0},
        {name:"sort", icon: "sort", label:_("Sorting"), enabled: true, style:"", icon_only:true, panel:0},
        {name:"columns", icon: "list_alt", label:_("Columns"), enabled: true, style:"", icon_only:true, panel:0},

        {name:"select_all", icon: "select_all", label:_("Select all"), enabled: true, style:"", icon_only:true, panel:0},
        {name:"clear_all", icon: "remove_selection", label:_("Clear all"), enabled: true, style:"", icon_only:true, panel:0},

        {name:"zoom_in", icon: "zoom_in", label:_("Zoom In"), enabled: true, style:"", icon_only:true, panel:0},
        {name:"zoom_out", icon: "zoom_out", label:_("Zoom Out"), enabled: true, style:"", icon_only:true, panel:0},
        {name:"zoom_reset", icon: "search", label:_("Reset Zoom"), enabled: false, style:"", icon_only:true, panel:0},

      ],

      view_columns: [],
      view_sorting: [],
      view_filtering: [],

      table_path:[ ],
      table_path_labels:[ ],
      table_columns:[ ],
      table_subtables:[ ],
      table_rows:[ ],
      table_row_status:[ ],
      table_options: { },

      return_keys: null,

      table_select_menu_active: false,
      editor_show: false,
      columns_panel_show: false,
      sorting_panel_show: false,
      filtering_panel_show: false,
      editor_affected_rows: [],
      editor_changes: {},
      editor_operation: '',
      panel0_menu_active: false,
      panel1_menu_active: false,
      ask_dialog_active: false,
      ask_dialog_text:"text",
      ask_dialog_promise_resolve: null,
      ask_dialog_promise_reject: null,
    });

  }

  componentDidMount() {
      var self = this;
      self.props.server.version().then(x => console.log(x));
      let tables_p = self.props.server.CTableServer.tables();
      let links_p = self.props.server.CTableServer.links();

      //self.props.server.slots.tableChanged.push(this.reloadData); Slots support

      Promise.all([tables_p, links_p]).then(x => {
        self.state.table_list = x[0];
        self.state.links = x[1];

        var default_table = self.state.table_list.filter(x => x.is_default);
        if (default_table.length == 0){
          default_table = [self.state.table_list[0]];
        }

        self.loadTable(default_table[0].name, null);
        self.setState({});
      });
  }

  resetColumns(){
    var self = this;
    self.state.view_columns = self.state.table_columns.map(x => { return {name:x.name, enabled:x.enabled} } );
  }

  resetSorting(){
    var self = this;
    self.state.view_sorting = self.state.table_columns.map(x => {

      var sorting = self.state.current_table.default_sorting.filter(y => x.name in y);

      if (sorting.length > 0) {
        return {name:x.name, sorting:sorting[0][x.name]};
      } else {
        return {name:x.name, sorting:""};
      }

    });
  }

  resetFiltering(){
    this.state.view_filtering = deep_copy(this.state.current_table.default_filtering);
  }

  loadTable(name, path_part){
    var self = this;

    var table = self.state.table_list.filter(x => x.name == name)[0];

    let table_columns_p = self.props.server.CTableServer.columns(table.name);
    let table_subtables_p = self.props.server.CTableServer.subtables(table.name);

    Promise.all([table_columns_p, table_subtables_p]).then((mx) => {
      var c, sb;
      [c, sb] = mx;

      self.state.current_table = table;
      self.state.width = table.width;
      self.state.table_columns = c;

      self.resetColumns();
      self.resetSorting();
      self.resetFiltering();

      self.state.table_subtables = sb;
      this.state.table_rows = [];
      this.state.table_row_status = [];

      if(path_part !== null){
        this.state.view_columns = path_part.view_settings.view_columns;
        this.state.view_filtering = path_part.view_settings.view_filtering;
        this.state.view_sorting = path_part.view_settings.view_sorting;
        this.state.return_keys = path_part.keys;
      }

      self.setState({}, self.reloadData);
    });
  }

  reloadData(){
    this.setState({progress: true});

    var keys = [];
    if(this.state.return_keys === null){
      keys = this.getAffectedKeys();
    } else {
      keys = [this.state.return_keys];
    }

    var sorting = this.state.view_sorting.filter(x => x.sorting != "").map(function (x) {
      return {[x.name]: x.sorting};
    });

    var filters = this.state.view_filtering.map(x => [x.operator, x.column, x.value]);

    let table_rows_p = this.props.server.CTableServer.select(this.full_table_path(),filters,sorting).then((r) => {
      this.state.table_rows = r['rows'];
      this.state.table_row_status = [];
      this.state.table_rows.forEach(x => {
        var issel = false;
        keys.forEach(w =>{ if(!issel) {issel = Object.keys(w).map(q => w[q] == x[q]).every(u => u)} });
        this.state.table_row_status.push({selected: issel});
      })
      this.state.progress = false;
      this.state.last_row_clicked = null;
      this.state.return_keys = null;

      var cell_link_columns = this.state.table_columns.filter(x => x.cell_actor == "CLinkCell");
      var editor_link_columns = this.state.table_columns.filter(x => x.cell_actor == "CLinkEditor");

      var link_columns_names = [];
      var link_columns_tables = [];
      var link_columns_table_columns = [];
      var link_columns_values = [];

      cell_link_columns.forEach(x => { if(link_columns_names.indexOf(x.name)<0){
        link_columns_names.push(x.name);
        link_columns_tables.push(x.cell_link);
        link_columns_table_columns.push(x.cell_link_key);
        link_columns_values.push([]);
      }});
      editor_link_columns.forEach(x => { if(link_columns_names.indexOf(x.name)<0){
        link_columns_names.push(x.name);
        link_columns_tables.push(x.editor_link);
        link_columns_table_columns.push(x.editor_link_key);
        link_columns_values.push([]);
      }});

      this.state.table_rows.forEach(x => {
        link_columns_names.forEach((y,i) => {
          if(link_columns_values[i].indexOf(x[y]) < 0) {
            link_columns_values[i].push(x[y]);
          }
        });
      });

      this.state.table_options = {};

      var full_path = this.full_table_path();

      var table_option_p = link_columns_names.map((x,i) => {
        full_path[full_path.length-1].table = link_columns_tables[i];
        return this.props.server.CTableServer.options(full_path, [["in", link_columns_table_columns[i], link_columns_values[i]]]).then(w =>{
          this.state.table_options[link_columns_tables[i]] = {};
          w.rows.forEach(q => {this.state.table_options[link_columns_tables[i]][q[link_columns_table_columns[i]]] = q[w.label];});
        });
      });

      Promise.all(table_option_p).then( x => {
          this.setState({}, () => {
            this.enablePanelButtons()
          });
      });
    }).catch((e) => {this.showError(e); this.setState({progress: false});});
  }

  getOptionsForField(column_name, query){
    var column = this.state.table_columns.filter(x => x.name == column_name)[0];

    var full_path = this.full_table_path();
    full_path[full_path.length-1].table = column.editor_link;

    if (query != ""){
      return this.props.server.CTableServer.options(full_path, [["like_lr", "name", query]]);
    }

    return this.props.server.CTableServer.options(full_path);
  }

  topButtonClick(e) {
    var tg = unwind_button_or_link(e);


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

    if(tg.dataset['name'] == "enter"){
      var self = this;

      var gk = this.getAffectedKeys()[0];
      var subtab = this.state.table_subtables.filter(x => x.name == tg.dataset['table'])[0];

      var key_const = [];
      Object.keys(gk).forEach((k)=>{key_const.push(["eq",k,gk[k]])});

      this.props.server.CTableServer.options(this.full_table_path(), key_const).then((r) => {
        var uid_str = [];
        r["keys"].forEach(k => {uid_str.push(r["rows"][0][k])})

        this.state.table_path_labels.push(r["rows"][0][r["label"]]+" ("+uid_str.join(",")+")");
        self.setState({});
      }).catch((e) => {this.showError(e)});

      this.state.table_path.push({table: this.state.current_table.name, keys:gk, label:this.state.current_table.label, mapping:subtab.mapping, view_settings:deep_copy({view_columns: this.state.view_columns, view_filtering:this.state.view_filtering, view_sorting:this.state.view_sorting}), table_row_status:deep_copy(this.state.table_row_status)});

      this.hideAllEditors();
      this.loadTable(tg.dataset['table'], null);
      return;
    }

    if(tg.dataset['name'] == "back"){
      this.state.table_path_labels.pop();
      var path_part = this.state.table_path.pop();
      this.hideAllEditors();
      this.loadTable(path_part.table, path_part);
      return;
    }

    if(tg.dataset['name'] == "columns"){
      if(this.state.columns_panel_show){
        this.setState({columns_panel_show: false});
      } else {
        this.hideAllEditors();
        this.setState({columns_panel_show: true});
      }
      return;
    }

    if(tg.dataset['name'] == "sort"){
      if(this.state.sorting_panel_show){
        this.setState({sorting_panel_show: false});
      } else {
        this.hideAllEditors();
        this.setState({sorting_panel_show: true});
      }
      return;
    }

    if(tg.dataset['name'] == "filter"){
      if(this.state.filtering_panel_show){
        this.setState({filtering_panel_show: false});
      } else {
        this.hideAllEditors();
        this.setState({filtering_panel_show: true});
      }
      return;
    }

    if(tg.dataset['name'] == "reload"){
      this.reloadData();
      return;
    }

    if(tg.dataset['name'] == "add"){
      this.hideAllEditors();
      this.setState({editor_show: true, editor_affected_rows: [], editor_changes: {}, editor_operation: 'add'});
      return;
    }

    if(tg.dataset['name'] == "edit"){
      var nrecords = this.getAffectedKeys().length;
      if(nrecords == 0) return; // no rows affected
      this.hideAllEditors();
      this.setState({editor_show: true, editor_affected_rows: this.state.table_rows.filter((x,i) => this.state.table_row_status[i].selected), editor_changes: {}, editor_operation: 'edit'});
      return;
    }

    if(tg.dataset['name'] == "duplicate"){
      var nrecords = this.getAffectedKeys().length;
      if(nrecords == 0) return; // no rows affected
      this.askUser(N_("Duplicate %d record?","Duplicate %d records?", nrecords)).then(()=>{
        this.setState({progress: true});
        this.props.server.CTableServer.duplicate(this.full_table_path(), this.getAffectedKeys()).then(()=> {this.reloadData();}).catch((e) => {this.showError(e); this.setState({progress: false})});
      }, ()=>{});
    }

    if(tg.dataset['name'] == "delete"){
      var nrecords = this.getAffectedKeys().length;
      if(nrecords == 0) return; // no rows affected
      this.askUser(N_("Delete %d record?","Delete %d records?", nrecords)).then(()=>{
        this.setState({progress: true});
        this.props.server.CTableServer.delete(this.full_table_path(), this.getAffectedKeys()).then(()=> {this.reloadData();}).catch((e) => {this.showError(e); this.setState({progress: false})});
      }, ()=>{});

    }

  }

  full_table_path(){
    var path = this.state.table_path.map(x => { return {table:x.table, keys:x.keys, mapping:x.mapping}; });
    return [].concat(path, [{table: this.state.current_table.name}]);
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

  getKeysFromRow(row){
    var keys = this.state.table_columns.filter((x) => x.is_key).map((x) => x.name);
    var res = {};
    keys.forEach((k) => { res[k] = row[k]; });
    return res;
  }

  headerXScroll(e){
    document.querySelector(".ctable-scroll-main-table").scrollLeft = e.target.scrollLeft;
  }

  tableXScroll(e){
    document.querySelector(".ctable-scroll-head-table").scrollLeft = e.target.scrollLeft;
  }

  onRowClick(e){
    if(this.state.editor_show == true) return;

    this.state.table_return = {};

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

    var self = this;

    this.state.topline_buttons.filter(x => x.name == "back").forEach(x => x.enabled = self.state.table_path.length > 0);

    if(sel_count == 1 && this.state.table_subtables.length > 0) {
        this.state.table_subtables.forEach(function (t,i){
          self.state.topline_buttons.filter(x => x.name == "enter").forEach((x,j) => {
            if(i == j) {
              x.enabled = true;
              x.label = t.label;
              x.table = t.name;
            }
          });
        });
    } else {
        self.state.topline_buttons.filter(x => x.name == "enter").forEach(x => {
            x.enabled = false;
          });
    }

    this.setState({});
  }

  onTableSelectDropdownClick(){
    this.setState({table_select_menu_active: !this.state.table_select_menu_active});
  }

  onTableSelectClick(x){
    var tbl = this.state.table_list.filter(y => y.name == unwind_button_or_link(x).dataset.label)[0];
    this.setState({table_select_menu_active: false, table_path_labels: [], table_path: []});
    this.loadTable(tbl.name, null);
  }


  onSaveClick(){
    if (Object.keys(this.state.editor_changes).filter(x => this.state.editor_changes[x].valid == false).length > 0){
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
      this.props.server.CTableServer.insert(this.full_table_path(), data_to_send).then(()=> {this.setState({editor_show: false}); this.reloadData();}).catch((e) => {this.showError(e); this.setState({progress: false});});
    }

    if(this.state.editor_operation == 'edit'){
      var nrecords = this.state.editor_affected_rows.length;
      if(nrecords == 0) return; // no rows affected
      if(nrecords == 1) {
        this.setState({editor_show: false, progress: true});
        this.props.server.CTableServer.update(this.full_table_path(), this.getAffectedKeys(), data_to_send).then(()=> {this.setState({editor_show: false});  this.reloadData();}).catch((e) => {this.showError(e); this.setState({progress: false});});
      } else {
        this.askUser(N_("Update %d record?","Update %d records?", nrecords)).then(()=>{
          this.setState({editor_show: false, progress: true});
          this.props.server.CTableServer.update(this.full_table_path(), this.getAffectedKeys(), data_to_send).then(()=> {this.setState({editor_show: false});  this.reloadData();}).catch((e) => {this.showError(e); this.setState({progress: false});});
        }, ()=>{});
      }
    }

  }

  hideAllEditors(){
    this.setState({sorting_panel_show: false, columns_panel_show: false, editor_show: false});
  }

  /**
   * Show error for user
   *
   * @arg e {Object} Error object
   * @arg e.code {Integer} Error code
   * @arg e.message {String} Error text message
   */

  showError(e){
    alert(String(e.code) + ": " + e.message);
  }

  onCancelClick(){
    this.setState({editor_show: false, editor_changes: [], editor_operation: ''});
  }

  /**
   * Callback for very changes in editor
   *
   * @arg colname {string} Column name
   * @arg is_modified {bool} Is modified
   * @arg value {*} Column value
   * @arg valid {bool} Is vaid
   */

  onEditorChanges(colname, is_modified, value, valid){
      this.state.editor_changes[colname] = {is_modified: is_modified, value: value, valid: valid};

      this.base.querySelectorAll(".ctable-editor-control div").forEach(x => x.dispatchEvent(new CustomEvent("cteditorchanged", { detail: {initiator:colname, changes:this.state.editor_changes} })));
  }

  onCloseColumns(){
    this.setState({columns_panel_show: false});
  }

  onResetColumns(){
    this.resetColumns();
    this.setState({});

  }

  onSortingChange(){
    this.reloadData();
  }

  onFilterChange(){
    this.reloadData();
  }

  onResetSorting(){
    this.resetSorting();
    this.setState({});
    this.reloadData();
  }

  onCloseSorting(){
    this.setState({sorting_panel_show: false});
    this.reloadData();
  }


  onResetFilter(){
    this.resetFiltering();
    this.setState({});
    this.reloadData();
  }

  onCloseFilter(){
    this.setState({filtering_panel_show: false});
    this.reloadData();
  }

  onApplySorting(){
    this.reloadData();
  }

  onPanel0DropdownClick(){
    this.setState({panel0_menu_active: !this.state.panel0_menu_active});
  }

  onPanel1DropdownClick(){
    this.setState({panel1_menu_active: !this.state.panel1_menu_active});
  }

  /**
   * Callback for ask a question to user
   *
   * @arg question {string} Question text
   * @return {Promise} Promise which resolve if user select Yes and reject in No
   */

  askUser(question){
    return new Promise((resolve, reject) => {
      this.setState({ask_dialog_text: question, ask_dialog_active: true, ask_dialog_promise_resolve: resolve, ask_dialog_promise_reject: reject});
    });
  }

  userResolveYes(){
    this.setState({ask_dialog_active: false});
    this.state.ask_dialog_promise_resolve();
  }


  userResolveNo(){
    this.setState({ask_dialog_active: false});
    this.state.ask_dialog_promise_reject();
  }

  /**
   * Callback for downloading file
   *
   * @arg row {Object} Current row
   * @arg column {Object} Current column
   * @arg index {Integer} Index of downloading file in column
   */

  onDownloadFile(row, column, index){
    this.props.server.CTableServer.download(this.full_table_path(), this.getKeysFromRow(row), column, index);
  }

  /**
   * Callback for uploading file
   *
   * @arg row {Object} Current row
   * @arg column {Object} Current column
   * @arg index {Integer} Index of uploading file. -1 for appending
   * @arg files {Object} File-input control files field
   * @return {Promise} Promise which resolve when file succsessfuly uploaded. Argument is file description string
   */

  onUploadFile(row, column, index, files){
    var self = this;
    self.setState({progress: true});
    var prm = this.props.server.upload(files);
    prm.then(x => {
      self.setState({progress: false});
    });
    return prm;
  }


  render() {

  var self = this;

  return <div>
  <div class={cls("modal", self.state.ask_dialog_active ? "is-active" : "")}>
    <div class="modal-background" onClick={this.userResolveNo}></div>
    <div class="modal-content">
      <div class="mb-4" style="font-weight: bold;">
        <p>{self.state.ask_dialog_text}</p>
      </div>
      <div class="has-text-center">
        <button class="button is-primary is-soft mr-4" style="min-width: 8em;" onClick={this.userResolveYes}>{_("Yes")}</button>
        <button class="button is-warning is-soft" style="min-width: 8em;" onClick={this.userResolveNo}>{_("No")}</button>
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" onClick={this.userResolveNo}></button>
  </div>
  <section class="section pt-3 pb-0 pl-0 pr-0 ctable-top-panel">
    <div class="ctable-top-panel-block" style={sty("max-width",self.state.width+2+"em")}>
      <div  class="pl-3 pr-2">
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
                <div style="display:inline-block;">
                {self.state.table_path_labels.map(x =>
                  <><span class="material-symbols-outlined-small">check_box</span>&nbsp;{x}&nbsp;</>
                )}
                  <><span class="material-symbols-outlined-small">lists</span>&nbsp;{self.state.current_table.label}&nbsp;</>
                </div>
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
      <div  class="ctable-command-panel">
        <div class="ctable-button-row">
          <div class="ctable-button-row-left">
            {self.state.topline_buttons.filter(x => x.enabled  && x.panel == 0).map(x =>
              <div class="has-text-centered m-1"  style="display:inline-block;">
                <button class={cls("button","is-small","is-soft",x.style)} data-name={x.name} onClick={this.topButtonClick} title={x.label}><span class="material-symbols-outlined">{x.icon}</span>{x.icon_only ? "" : " "+x.label}</button>
              </div>
            )}
          </div>
          <div class="ctable-button-row-right has-text-right">
            <div class={cls("dropdown", "is-right", self.state.panel0_menu_active ? "is-active" : "")}>
              <div class="dropdown-trigger">
                <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu-panel0" onClick={this.onPanel0DropdownClick}>
                  <span class="icon"><span class="material-symbols-outlined">build</span></span>
                  <span class="icon is-small"><span class="material-symbols-outlined">arrow_drop_down</span></span>
                </button>
              </div>
              <div class="dropdown-menu" id="dropdown-menu-panel0" role="menu">
                <div class="dropdown-content has-text-left">
                  {self.state.topline_buttons.filter(x => x.enabled  && x.panel == 0).map(x =>
                    <a class={cls("dropdown-item",x.style)} data-name={x.name} onClick={this.topButtonClick} data-table={x.table}><span class="material-symbols-outlined-small">{x.icon}</span> {x.label}</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ctable-button-row">
          <div class="ctable-button-row-left">
            {self.state.topline_buttons.filter(x => x.enabled  && x.panel == 1).map(x =>
              <div class="has-text-centered m-1"  style="display:inline-block;">
              <button class={cls("button","is-small","is-soft",x.style)} data-name={x.name} onClick={this.topButtonClick} title={x.label} data-table={x.table}><span class="material-symbols-outlined">{x.icon}</span>{x.icon_only ? "" : " "+x.label}</button>
              </div>
            )}
          </div>
          <div class="ctable-button-row-right has-text-right">
            <div class={cls("dropdown", "is-right", self.state.panel1_menu_active ? "is-active" : "")}>
              <div class="dropdown-trigger">
                <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu-panel1" onClick={this.onPanel1DropdownClick}>
                  <span class="icon"><span class="material-symbols-outlined">more_vert</span></span>
                  <span class="icon is-small"><span class="material-symbols-outlined">arrow_drop_down</span></span>
                </button>
              </div>
              <div class="dropdown-menu" id="dropdown-menu-panel1" role="menu">
                <div class="dropdown-content has-text-left">
                  {self.state.topline_buttons.filter(x => x.enabled  && x.panel == 1).map(x =>
                    <a class={cls("dropdown-item", "is-soft", x.style)} data-name={x.name} onClick={this.topButtonClick}><span class="material-symbols-outlined-small">{x.icon}</span> {x.label}</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CHeaderTable width={self.state.width} fontSize={self.state.fontSize} table={self} columns={self.state.table_columns} view_columns={self.state.view_columns} view_sorting={self.state.view_sorting} view_filtering={self.state.view_filtering} onHeaderXScroll={self.headerXScroll} progress={self.state.progress} />
    </div>
  </section>
  <CPageTable width={self.state.width} fontSize={self.state.fontSize} table={self} columns={self.state.table_columns} view_columns={self.state.view_columns} row_status={self.state.table_row_status} rows={self.state.table_rows} onRowClick={self.onRowClick}  onTableXScroll={self.tableXScroll} editorShow={self.state.editor_show || self.state.sorting_panel_show || self.state.columns_panel_show || self.state.filtering_panel_show }/>
  {self.state.editor_show ? <CEditorPanel width={self.state.width} table={self} columns={self.state.table_columns} affectedRows={self.state.editor_affected_rows} noSaveClick={self.onSaveClick} noCancelClick={self.onCancelClick} onEditorChanges={self.onEditorChanges} /> : ""}
  {self.state.columns_panel_show ? <CColumnsPanel width={self.state.width} table={self} onColumnChange={self.onColumnChange} onResetColumns={self.onResetColumns}  onCloseColumns={self.onCloseColumns}/>: ""}
  {self.state.sorting_panel_show ? <CSortingPanel width={self.state.width} table={self} onResetSorting={self.onResetSorting}  onCloseSorting={self.onCloseSorting} onSortingChange={self.onSortingChange} />: ""}
  {self.state.filtering_panel_show ? <CFilterPanel width={self.state.width} table={self} onResetFilter={self.onResetFilter}  onCloseFilter={self.onCloseFilter} onChangeFilter={self.onFilterChange} />: ""}

  </div>;

  }


}
