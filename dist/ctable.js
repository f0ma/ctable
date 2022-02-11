var {
  Component,
  h,
  render,
  Fragment,
  createRef
} = window.preact;

function makeID() {
  let ID = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < 12; i++) {
    ID += characters.charAt(Math.floor(Math.random() * 36));
  }

  return ID;
}
var ctable_lang = {
  en: {
    current_page: 'Current page',
    from: 'from',
    show_by: 'Show by',
    to_last_page: 'To last page',
    to_next_page: 'To next page',
    to_prev_page: 'To previous page',
    to_first_page: 'To first page',
    delete_row_ask: 'Delete this row?',
    save: 'Save',
    discard: 'Discard',
    edit_rec: 'Edit this row',
    delete_rec: 'Delete this row',
    add_rec: 'Add row',
    actions: 'Other actions',
    open_subtable: 'Open subtable',
    no_data: 'No rows',
    error: 'Error: ',
    server_error: 'Server side error: ',
    no_filter: 'No filter',
    no_file: 'No file',
    multiple_files: 'Files: ',
    file_to_large: 'File too large',
    file_wrong_extention: 'File have a wrong type',
    file_filter_no: 'No file',
    file_filter_yes: 'Have a file',
    reload: 'Reload'
  },
  ru: {
    current_page: 'Текущая страница',
    from: 'из',
    show_by: 'Показывать по',
    to_last_page: 'На последнюю страницу',
    to_next_page: 'На следующую страницу',
    to_prev_page: 'На предыдущую страницу',
    to_first_page: 'На первую страницу',
    delete_row_ask: 'Удалить запись?',
    save: 'Сохранить',
    discard: 'Отменить',
    edit_rec: 'Изменить запись',
    delete_rec: 'Удалить запись',
    add_rec: 'Добавить запись',
    actions: 'Другие действия',
    open_subtable: 'Открыть подтаблицу',
    no_data: 'Нет данных',
    error: 'Ошибка: ',
    server_error: 'Ошибка сервера: ',
    no_filter: 'Нет фильтра',
    no_file: 'Нет файла',
    multiple_files: 'Файлы: ',
    file_to_large: 'Файл слишком велик',
    file_wrong_extention: 'Файл имеет недопустимый тип',
    file_filter_no: 'Файла нет',
    file_filter_yes: 'Файл есть',
    reload: 'Перезагрузить'
  }
};
/**
 * Base column class.
 *
 * This basic implementation can make search and sorting.
 *
 * @arg this.props.role {string} Control role: 'header', 'search', 'cell', 'footer', 'editor'.
 * @arg this.props.column {int} Currnet column index.
 * @arg this.props.row {int} Currnet row index, -1 for new row.
 * @arg this.props.sorting {undefined|string} Column sorting order: 'ASC', 'DESC' or ''. No sorting in `undefined`.
 * @arg this.props.searching {undefined|string} Column searching: query string or ''. No search in `undefined`.
 */
class CTableColumn extends Component {
  /**
   * Trivial constructor. Call super() to create Component correctly.
   */
  constructor() {
    super();
  }

  componentDidMount() {
    this.setState({
      searching: this.props.search
    });
  }

  searchCleared = e => {
    this.setState({
      searching: ''
    });
    this.props.table.change_search_for_column(this.props.column, '');
  };
  searchChanged = e => {
    this.setState({
      searching: e.target.value
    });
    this.props.table.change_search_for_column(this.props.column, e.target.value);
  };
  sortingChanged = e => {
    var order = '';

    if (this.props.sorting == 'ASC') {
      order = 'DESC';
    } else if (this.props.sorting == 'DESC') {
      order = '';
    } else if (this.props.sorting == '') {
      order = 'ASC';
    }

    this.props.table.change_sort_for_column(this.props.column, order);
  };
  /**
   * Build search bar for column.
   *
   * For override in subclesses.
   *
   * @return {PreactNode} Search control.
   */

  render_search() {
    if (typeof this.props.searching === 'undefined') {// do nothing
    } else {
      return h("div", {
        class: "control has-icons-right"
      }, h("input", {
        class: "input",
        value: this.state.searching,
        onChange: this.searchChanged,
        type: "text"
      }), h("span", {
        class: "icon is-small is-right",
        style: "pointer-events: all; cursor: pointer",
        onClick: this.searchCleared
      }, "\u2297"));
    }
  }
  /**
   * Build header of column.
   *
   * For override in subclesses.
   *
   * @return {PreactNode} Header control.
   */


  render_header() {
    if (typeof this.props.sorting === 'undefined') {
      return h("b", null, this.title());
    } else {
      var arrow = '';

      if (this.props.sorting == 'ASC') {
        arrow = '↓';
      } else if (this.props.sorting == 'DESC') {
        arrow = '↑';
      } else if (this.props.sorting == '') {
        arrow = '⇵';
      }

      return h("b", null, h("a", {
        onClick: this.sortingChanged
      }, h("span", {
        class: "icon"
      }, arrow), " ", this.props.table.state.columns[this.props.column].title));
    }
  }
  /**
   * Return current cell value.
   *
   * For use in subclesses.
   *
   * @return {*} Current cell value, default for new record or null if default is not set.
   */


  value() {
    if (this.props.row >= 0) {
      return this.props.table.state.records[this.props.row][this.props.table.state.columns[this.props.column].name];
    }

    if (typeof this.props.table.state.columns[this.props.column].default === 'undefined') {
      return null;
    } else {
      return this.props.table.state.columns[this.props.column].default;
    }
  }
  /**
   * Return current row values.
   *
   * For use in subclesses.
   *
   * @return {Object|null} Current row dictionary.
   */


  row() {
    if (this.props.row >= 0) {
      return this.props.table.state.records[this.props.row];
    }

    return null;
  }
  /**
   * Return column name.
   *
   * For use in subclesses.
   *
   * @return {string} Current column name.
   */


  name() {
    return this.props.table.state.columns[this.props.column].name;
  }
  /**
   * Return column title.
   *
   * For use in subclesses.
   *
   * @return {string} Current column title.
   */


  title() {
    return this.props.table.state.columns[this.props.column].title;
  }
  /**
   * Build view cell of table.
   *
   * For override in subclesses.
   *
   * @return {PreactNode} Header control.
   */


  render_cell() {
    return h("span", null, this.value());
  }
  /**
   * Build editor control for cell.
   *
   * For override in subclesses.
   *
   * @return {PreactNode} Editor control: `div` with `class="field"`.
   */


  render_editor() {}
  /**
   * Build footer of column.
   *
   * For override in subclesses.
   *
   * @return {PreactNode} Footer control.
   */


  render_footer() {}
  /**
   * Callback called if changes in another editor happens.
   *
   * For use in subclesses with `CTable.notify_changes` and `CTable.subscribe_to_changes`.
   *
   * @param {int} row Affected row
   * @param {int} col Affected column
   * @param {*} value New value
   */


  on_changes(row, col, value) {}

  render() {
    if (this.props.role == 'header') {
      return this.render_header();
    }

    if (this.props.role == 'search') {
      return this.render_search();
    }

    if (this.props.role == 'footer') {
      return this.render_footer();
    }

    if (this.props.role == 'cell') {
      return this.render_cell();
    }

    if (this.props.role == 'editor') {
      return this.render_editor();
    }
  }

}
/**
 * Action buttons column.
 *
 * @arg this.props.no_edit {undefined|Boolean} Disable Edit button if true.
 * @arg this.props.no_delete {undefined|Boolean} Disable Delete button if true.
 * @arg this.props.no_add {undefined|Boolean} Disable Add button if true.
 * @arg this.props.no_menu {undefined|Boolean} Disable Extra menu.
 */
class CActionColumn extends CTableColumn {
  constructor() {
    super();
    this.setState({
      menu_active: false,
      search_menu_id: makeID()
    });
  }

  newClicked = e => {
    this.props.table.edit_row(-1);
  };
  additionalClicked = e => {
    this.setState({
      menu_active: !this.state.menu_active
    });
  };
  menuLeave = e => {
    this.setState({
      menu_active: false
    });
  };
  reloadClicked = e => {
    this.props.table.reload();
    this.setState({
      menu_active: false
    });
  };
  editClicked = e => {
    this.props.table.edit_row(this.props.row);
  };
  discardClicked = e => {
    this.props.table.edit_row(this.props.row);
  };
  saveClicked = e => {
    this.props.table.save_row(this.props.row);
  };
  deleteClicked = e => {
    if (window.confirm(this.props.table.props.lang.delete_row_ask)) {
      this.props.table.delete_row(this.props.row);
    }
  };

  render_header() {
    return h("b", null, this.title());
  }

  render_editor() {
    return h("div", {
      class: "field has-addons",
      style: "justify-content: right;"
    }, h("div", {
      class: "control"
    }, h("button", {
      class: "button is-primary",
      onClick: this.saveClicked
    }, this.props.table.props.lang.save)), h("div", {
      class: "control"
    }, h("button", {
      class: "button is-warning",
      onClick: this.discardClicked
    }, this.props.table.props.lang.discard)));
  }

  render_cell() {
    return h("div", {
      class: "field has-addons",
      style: "justify-content: right;"
    }, this.props.no_edit ? '' : h("div", {
      class: "control"
    }, h("button", {
      class: this.props.table.state.opened_editors.includes(this.props.row) ? "button is-warning  is-inverted" : "button is-warning",
      title: this.props.table.props.lang.edit_rec,
      onClick: this.editClicked
    }, h("span", {
      class: "icon"
    }, "\u270E"))), this.props.no_delete ? '' : h("div", {
      class: "control"
    }, h("button", {
      class: "button is-danger",
      title: this.props.table.props.lang.delete_rec,
      onClick: this.deleteClicked
    }, h("span", {
      class: "icon"
    }, "\u2297"))));
  }

  render_search() {
    return h("div", {
      class: this.state.menu_active ? 'field has-addons dropdown is-right is-active' : 'field has-addons dropdown is-right',
      style: "justify-content: right;"
    }, this.props.no_add ? '' : h("div", {
      class: "control"
    }, h("button", {
      class: this.props.table.state.opened_editors.includes(this.props.row) ? "button is-warning is-inverted" : "button is-warning",
      title: this.props.table.props.lang.add_rec,
      onClick: this.newClicked
    }, h("span", {
      class: "icon"
    }, "\u2295"))), this.props.no_menu ? '' : h("div", {
      class: "control"
    }, h("button", {
      class: this.state.menu_active ? "button is-info dropdown-trigger is-inverted" : "button is-info dropdown-trigger",
      title: this.props.table.props.lang.actions,
      "aria-haspopup": "true",
      "aria-controls": this.state.search_menu_id,
      onClick: this.additionalClicked,
      onBlur: this.menuLeave
    }, h("span", {
      class: "icon"
    }, "\u2261")), h("div", {
      class: "dropdown-menu",
      id: this.state.search_menu_id,
      role: "menu"
    }, h("div", {
      class: "dropdown-content"
    }, h("a", {
      href: "#",
      class: "dropdown-item",
      onClick: this.reloadClicked
    }, this.props.table.props.lang.reload)))));
  }

}
/**
 * Select column with dynamic items loaded from server.
 *
 * This column for selecting from dropdown.
 *
 * @arg {string} this.props.endpoint - Endpoint for loading options.
 * @arg {Object} this.props.params - Additional parameters to select query
 */
class CDynamicSelectColumn extends CTableColumn {
  constructor() {
    super();
    this.state = {
      options: []
    };
    this.ref = createRef();
  }

  componentDidMount() {
    this.props.table.load_options(this.props.endpoint, this.props.params, this, this.ref);
  }

  render_cell() {
    var cvalues = this.state.options.filter(item => item[0] == this.value());

    if (cvalues.length > 0) {
      return h("span", null, cvalues[0][1]);
    }

    return h("span", null);
  }

  filterChanged = e => {
    this.props.table.change_filter_for_column(this.props.column, e.target.value);
  };

  render_search() {
    if (typeof this.props.filtering === 'undefined') {// do nothing
    } else {
      return h("div", {
        class: "select"
      }, h("select", {
        onChange: this.filterChanged,
        value: this.props.filtering
      }, h("option", {
        value: ""
      }, this.props.table.props.lang.no_filter), this.state.options.map(item => h("option", {
        value: item[0]
      }, item[1]))));
    }
  }

  editorChanged = e => {
    this.props.table.notify_changes(this.props.row, this.props.column, e.target.value);
  };

  render_editor() {
    return h("div", {
      class: "field",
      ref: this.ref
    }, h("label", {
      class: "label"
    }, this.title()), h("div", {
      class: "control"
    }, h("div", {
      class: "select"
    }, h("select", {
      onChange: this.editorChanged,
      value: this.value()
    }, this.state.options.map(item => h("option", {
      value: item[0]
    }, item[1]))))), this.props.footnote ? h("div", {
      class: "help"
    }, this.props.footnote) : '');
  }

}
/**
 * Select column.
 *
 * This column for selecting from dropdown.
 *
 * @arg {List[]} this.props.options - Options list.
 * @arg {string} this.props.options[].0 - Key.
 * @arg {string} this.props.options[].1 - Text.
 */
class CSelectColumn extends CTableColumn {
  constructor() {
    super();
    this.state = {
      options: []
    };
    this.ref = createRef();
  }

  componentDidMount() {
    this.setState({
      options: this.props.options
    });
  }

  render_cell() {
    var cvalues = this.state.options.filter(item => item[0] == this.value());

    if (cvalues.length > 0) {
      return h("span", null, cvalues[0][1]);
    }

    return h("span", null);
  }

  filterChanged = e => {
    this.props.table.change_filter_for_column(this.props.column, e.target.value);
  };

  render_search() {
    if (typeof this.props.filtering === 'undefined') {// do nothing
    } else {
      return h("div", {
        class: "select"
      }, h("select", {
        onChange: this.filterChanged,
        value: this.props.filtering
      }, h("option", {
        value: ""
      }, this.props.table.props.lang.no_filter), this.state.options.map(item => h("option", {
        value: item[0]
      }, item[1]))));
    }
  }

  editorChanged = e => {
    this.props.table.notify_changes(this.props.row, this.props.column, e.target.value);
  };

  render_editor() {
    return h("div", {
      class: "field",
      ref: this.ref
    }, h("label", {
      class: "label"
    }, this.title()), h("div", {
      class: "control"
    }, h("div", {
      class: "select"
    }, h("select", {
      onChange: this.editorChanged,
      value: this.value()
    }, this.state.options.map(item => h("option", {
      value: item[0]
    }, item[1]))))), this.props.footnote ? h("div", {
      class: "help"
    }, this.props.footnote) : '');
  }

}
/**
 * Action buttons column.
 *
 * @arg this.props.config {Object} Config for subtable. See props of CTable for details.
 * @arg this.props.button_hint {string} Button title for this control.
 * @arg this.props.keys[] {Object} Key list.
 * @arg this.props.keys[][0] {string} Source table column name.
 * @arg this.props.keys[][1] {string} Target table column name.
 */
class CSubtableColumn extends CTableColumn {
  constructor() {
    super();
    this.setState({
      opened: false
    });
  }

  openSubtableClicked = e => {
    this.setState({
      opened: !this.state.opened
    });
    this.props.table.open_subtable(this.props.row, this.props.keys, this.props.config);
  };

  render_header() {
    return h("b", null, this.title());
  }

  render_cell() {
    return h("div", {
      class: "field has-addons"
    }, h("div", {
      class: "control"
    }, h("button", {
      class: this.state.opened ? "button is-info is-inverted" : "button is-info",
      title: typeof this.props.button_hint === 'undefined' ? this.props.table.props.lang.open_subtable : this.props.button_hint,
      onClick: this.openSubtableClicked
    }, h("span", {
      class: "icon"
    }, "\u2BA1"))));
  }

}
/**
 * Text edit class.
 *
 * This column for text editing.
 *
 * @arg this.props.textarea {undefined|Boolean} Switch editor to textarea.
 * @arg this.props.placeholder {string} Placeholder for column editor.
 * @arg this.props.validate {undefined|string} Input validation regex.
 */
class CTextColumn extends CTableColumn {
  constructor() {
    super();
    this.ref = createRef();
  }

  componentDidMount() {
    this.setState({
      editor_valid: true,
      value: this.value()
    });
  }

  render_cell() {
    return h("span", null, this.value());
  }

  editorChanged = e => {
    this.setState({
      value: e.target.value
    });
    this.props.table.notify_changes(this.props.row, this.props.column, e.target.value);

    if (this.props.validate) {
      if (e.target.value.match(this.props.validate)) {
        this.props.table.notify_valids(this.props.row, this.props.column, true);
        this.setState({
          editor_valid: true
        });
      } else {
        this.props.table.notify_valids(this.props.row, this.props.column, false);
        this.setState({
          editor_valid: false
        });
      }
    }
  }; //TODO: add input/textarea swith
  //TODO: validations

  render_editor() {
    var textarea = h("textarea", {
      class: !this.state.editor_valid ? "textarea is-danger" : "textarea",
      onChange: this.editorChanged,
      placeholder: this.props.placeholder
    }, this.state.value);
    var input = h("input", {
      class: !this.state.editor_valid ? "input is-danger" : "input",
      type: "text",
      value: this.state.value,
      onChange: this.editorChanged,
      placeholder: this.props.placeholder
    });
    return h("div", {
      class: "field",
      ref: this.ref
    }, h("label", {
      class: "label"
    }, this.title()), h("div", {
      class: "control"
    }, this.props.textarea == true ? textarea : input), this.props.footnote ? h("div", {
      class: "help"
    }, this.props.footnote) : '');
  }

}
/**
 * Upload column.
 *
 * This column for uploading files.
 *
 * @arg {string} this.props.upload_endpoint - Endpoint for uploading files.
 * @arg {undefined | Boolean} this.props.multiple - Multiple upload allowed. Not tested.
 * @arg {undefined | string} this.props.links_endpoint - Link endpoint. No link available if undefined.
 * @arg {undefined | int} this.props.filename_len - Max length for filename. 12 if undefined.
 * @arg {undefined | int} this.props.max_file_size - Maximum file size.
 * @arg {undefined | string[]} this.props.allowed_extentions - Allowed file extention.
 */
class CUploadColumn extends CTableColumn {
  constructor() {
    super();
    this.state = {
      fileinfo: {
        uploaded: false,
        count: 0,
        filelabel: [],
        uid: [],
        filelink: [],
        filedate: []
      }
    };
    this.ref = createRef();
  }

  file_name_shortifier(fname) {
    var length = 12;

    if (this.props.filename_len) {
      length = this.props.filename_len;
    }

    if (fname.length < length) return fname;
    return fname.substring(0, length - 5) + '...' + fname.substring(fname.length - 5);
  }

  value_parser(value) {
    if (value == '' || value == null) {
      return {
        uploaded: false,
        count: 0,
        filelabel: [],
        uid: [],
        filelink: [],
        filedate: []
      };
    }

    var links = null;

    if (this.props.links_endpoint) {
      links = this.props.links_endpoint;
    }

    var flines = value.split(';').filter(function (el) {
      return el.length != 0;
    });

    if (flines.length == 1) {
      var fcomp = flines[0].split(':');
      return {
        uploaded: true,
        count: 1,
        filelabel: [this.file_name_shortifier(fcomp[1])],
        uid: [fcomp[0]],
        filelink: [links ? links + fcomp[0] : '']
      };
    }

    var uids = [];
    var labels = [];
    var links = [];
    flines.forEach(function (frecord) {
      var fcomp = frecord.split(':').filter(function (el) {
        return el.length != 0;
      });
      uids.push(fcomp[0]);
      labels.push(this.file_name_shortifier(fcomp[1]));
      links.push(links ? links + fcomp[0] : '');
    });
    return {
      uploaded: true,
      count: flines.length,
      filelabel: labels,
      uid: uids,
      filelink: links
    };
  }

  componentDidMount() {
    this.setState({
      fileinfo: this.value_parser(this.value())
    });
  }

  render_cell() {
    var fileinfo = this.value_parser(this.value());

    if (!fileinfo.uploaded) {
      return h("a", {
        class: "button is-info is-outlined",
        disabled: "true"
      }, h("span", {
        class: "file-icon"
      }, "\u2296"), this.props.table.props.lang.no_file);
    }

    if (fileinfo.count == 1) {
      var filelink = {};

      if (this.props.links_endpoint) {
        filelink = {
          "href": fileinfo.filelink,
          "target": "_blank",
          "disabled": false
        };
      }

      return h("a", {
        "class": "button is-info is-outlined",
        "disabled": true,
        ...filelink
      }, h(Fragment, null, h("span", {
        class: "file-icon"
      }, "\u2296"), fileinfo.filelabel[0]));
    } else {
      return h("a", {
        class: "button is-info is-outlined",
        disabled: "true"
      }, h("span", {
        class: "file-icon"
      }, "\u2296"), this.props.table.props.lang.multiple_files, " ", fileinfo.count);
    }
  }

  filterChanged = e => {
    this.props.table.change_filter_for_column(this.props.column, e.target.value);
  };

  render_search() {
    if (typeof this.props.filtering === 'undefined') {// do nothing
    } else {
      return h("div", {
        class: "select"
      }, h("select", {
        onChange: this.filterChanged,
        value: this.props.filtering
      }, h("option", {
        value: ""
      }, this.props.table.props.lang.no_filter), h("option", {
        value: "%null"
      }, this.props.table.props.lang.file_filter_no), h("option", {
        value: "%notempty"
      }, this.props.table.props.lang.file_filter_yes)));
    }
  }

  editorCleared = e => {
    this.setState({
      fileinfo: this.value_parser('')
    });
    this.props.table.notify_changes(this.props.row, this.props.column, '');
  };
  editorChanged = e => {
    var form_data = new FormData();

    for (var file_index = 0; file_index < e.target.files.length; file_index++) {
      if (this.props.max_file_size) {
        if (e.target.files[file_index].size > this.props.max_file_size) {
          alert(this.props.table.props.lang.file_to_large);
          return;
        }
      }

      if (this.props.allowed_extentions) {
        if (this.props.allowed_extentions.filter(item => e.target.files[file_index].name.toLowerCase().endsWith(item)).length == 0) {
          alert(this.props.table.props.lang.file_wrong_extention);
          return;
        }
      }

      form_data.append("file" + file_index, e.target.files[file_index]);
    }

    var self = this;
    fetch(this.props.upload_endpoint, {
      method: 'POST',
      body: form_data
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        alert(self.props.table.props.lang.server_error + response.status);
      }
    }).then(function (result) {
      if (!result) return;

      if (result.Result == 'OK') {
        self.setState({
          fileinfo: self.value_parser(result.Files)
        });
        self.props.table.notify_changes(self.props.row, self.props.column, result.Files);
      }
    });
  };

  render_editor() {
    if (!this.state.fileinfo.uploaded) {
      return h(Fragment, null, h("label", {
        class: "label"
      }, this.title()), h("div", {
        class: "field has-addons"
      }, h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info",
        disabled: "true"
      }, h("span", {
        class: "file-icon"
      }, "\u2296"), this.props.table.props.lang.no_file)), h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info is-danger",
        disabled: "true"
      }, "\u2297")), h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info"
      }, "\u21A5"), h("input", {
        class: "file-input",
        type: "file",
        name: "file",
        multiple: this.props.multiple ? "true" : "false",
        onChange: this.editorChanged
      })), this.props.footnote ? h("div", {
        class: "help"
      }, this.props.footnote) : ''));
    }

    if (this.state.fileinfo.count == 1) {
      var filelink = {};

      if (this.props.links_endpoint) {
        filelink = {
          "href": this.state.fileinfo.filelink,
          "target": "_blank"
        };
      }

      return h(Fragment, null, h("label", {
        class: "label"
      }, this.title()), h("div", {
        class: "field has-addons"
      }, h("div", {
        class: "control"
      }, h("a", {
        "class": "button is-info",
        ...filelink
      }, h(Fragment, null, h("span", {
        class: "file-icon"
      }, "\u2296"), this.state.fileinfo.filelabel[0]))), h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info is-danger",
        onClick: this.editorCleared
      }, "\u2297")), h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info"
      }, "\u21A5"), h("input", {
        class: "file-input",
        type: "file",
        name: "file",
        multiple: this.props.multiple ? "true" : "false",
        onChange: this.editorChanged
      })), this.props.footnote ? h("div", {
        class: "help"
      }, this.props.footnote) : ''));
    } else {
      return h(Fragment, null, h("label", {
        class: "label"
      }, this.title()), h("div", {
        class: "field has-addons"
      }, h("div", {
        class: "control"
      }, h("a", {
        "class": "button is-info",
        "disabled": true
      }, h(Fragment, null, h("span", {
        class: "file-icon"
      }, "\u2296"), this.props.table.props.lang.multiple_files, " ", this.state.fileinfo.count))), h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info is-danger",
        onClick: this.editorCleared
      }, "\u2297")), h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info"
      }, "\u21A5"), h("input", {
        class: "file-input",
        type: "file",
        name: "file",
        multiple: this.props.multiple ? "true" : "false",
        onChange: this.editorChanged
      })), this.props.footnote ? h("div", {
        class: "help"
      }, this.props.footnote) : ''));
    }
  }

}
/**
 * Main component.
 *
 * Includes server interaction logic, pagination, and other.
 *
 * @arg {string} this.props.endpoint - Url to endpoint.
 * @arg {Object} this.props.params - Additional parameters to select query
 * @arg {undefined|Boolean} this.props.no_pagination - Disable pagination.
 * @arg {Object[]} this.props.columns -  List of columns. Each column will be passed as props to column object.
 * @arg {string} this.props.columns[].name - Name of column.
 * @arg {string} this.props.columns[].title - Title of column.
 * @arg {Class} this.props.columns[].kind - Column class derived from CTableColumn.
 * @arg {string} this.props.columns[].footnote - Footnote for column editor.
 */
class CTable extends Component {
  constructor() {
    super();
    this.state = {
      records: [],
      columns: [],
      endpoint: '',
      opened_editors: [],
      opened_subtables: [],
      current_page: 0,
      records_on_page: 25,
      total_records: 0,
      total_pages: 0
    };
    this.changes = [];
    this.valids = [];
    this.changes_handlers = [];
    this.subtables_params = {};
    this.options_cache = {};
  }

  componentDidMount() {
    this.state.columns = this.props.columns;
    this.state.endpoint = this.props.endpoint;
    this.setState({});
    this.reload();
  }
  /**
   * Getting column index by column name.
   *
   * For call from column class.
   *
   * @param {string} name - Column name.
   * @returns {int|null} Column index in current table or `null`.
   */


  column_by_name(name) {
    for (var i = 0; i < this.props.columns.length; i++) {
      if (this.props.columns[i].name == name) {
        return i;
      }
    }

    return null;
  }
  /**
   * Open subtable in table.
   *
   * For call from column class.
   *
   * @param {int} row - Row index.
   * @param {List[]} keys - Constrains for subtable.
   * @param {string} keys[].0 - Subtable column name.
   * @param {string} keys[].1 - Current table column name which value will be used as constrain.
   * @param {Object} config - Subtable props including columns.
   */


  open_subtable(row, keys, config) {
    if (this.state.opened_subtables.includes(row)) {
      this.state.opened_subtables = this.state.opened_subtables.filter(item => item !== row);
    } else {
      this.state.opened_subtables.push(row);
      this.subtables_params[row] = config;
      self = this;
      this.subtables_params[row].filters = keys.map(item => [item[0], self.state.records[row][item[1]]]);
    }

    this.setState({});
  }
  /**
   * Toggle row editor interface.
   *
   * For call from column class.
   *
   * @param {int} row - Row number. `-1` for new record.
   */


  edit_row(row) {
    var self = this;

    if (this.state.opened_editors.includes(row)) {
      this.state.opened_editors = this.state.opened_editors.filter(item => item !== row);
      this.changes = this.changes.filter(item => !(item[0] == row));
    } else {
      this.state.opened_editors.push(row);

      if (row < 0) {
        this.state.columns.map(function (item, i) {
          if (typeof self.state.columns[i].default !== 'undefined') {
            self.changes.push([row, i, self.state.columns[i].default]);
          }
        });
      }
    }

    this.setState({});
  }
  /**
   * Delete row action.
   *
   * For call from column class. Reload table.
   *
   * @param {int} row - Row number.
   */


  delete_row(row) {
    var xkeys = {};
    var self = this;
    this.state.columns.map(function (item, i) {
      if (item.is_key == true) {
        xkeys[item.name] = self.state.records[row][item.name];
      }
    });
    fetch(this.props.endpoint, {
      method: "POST",
      body: 'delete=' + JSON.stringify(xkeys),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        alert(self.props.lang.server_error + response.status);
      }
    }).then(function (result) {
      if (!result) return;

      if (result.Result == 'OK') {
        self.options_cache = {};
        self.state.opened_editors = self.state.opened_editors.filter(item => item !== row);
        self.reload();
      } else {
        alert(self.props.lang.error + result.Message);
      }
    });
  }
  /**
   * Save row action.
   *
   * For call from column class. Reload table.
   *
   * @param row {int} Row number. `-1` for new record.
   */


  save_row(row) {
    if (this.valids.filter(item => item[0] == row).filter(item => item[2] == false).length > 0) return;
    if (this.changes.length == 0) return;
    var xvalues = {};
    var self = this;
    var cmd = 'update=';

    if (row >= 0) {
      this.state.columns.map(function (item, i) {
        if (item.is_key == true) {
          xvalues[item.name] = self.state.records[row][item.name];
        }
      });
      this.changes.filter(item => item[0] == row).map(function (item) {
        if (self.state.columns[item[1]].name != '') {
          xvalues[self.state.columns[item[1]].name] = item[2];
        }
      });
    } else {
      cmd = 'insert=';
      this.changes.filter(item => item[0] == row).map(function (item) {
        if (!self.state.columns[item[1]].is_key && self.state.columns[item[1]].name != '') {
          xvalues[self.state.columns[item[1]].name] = item[2];
        }
      });
    }

    if (typeof this.props.filters !== 'undefined') {
      this.props.filters.forEach(item => xvalues[item[0]] = item[1]);
    }

    fetch(this.props.endpoint, {
      method: "POST",
      body: cmd + JSON.stringify(xvalues),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        alert(self.props.lang.server_error + response.status);
      }
    }).then(function (result) {
      if (!result) return;

      if (result.Result == 'OK') {
        self.options_cache = {};
        self.state.opened_editors = self.state.opened_editors.filter(item => item !== row);
        self.reload();
      } else {
        alert(self.props.lang.error + result.Message);
      }
    });
  }
  /**
   * Change filtering for column.
   *
   * For call from column class. Reload table.
   *
   * @param col {int} Column number.
   * @param value {*} Filter value.
   */


  change_filter_for_column(col, value) {
    this.state.columns[col].filtering = value;
    this.reload();
  }
  /**
   * Change searching for column.
   *
   * For call from column class. Reload table.
   *
   * @param col {int} Column number.
   * @param value {*} Search value.
   */


  change_search_for_column(col, value) {
    this.state.columns[col].searching = value;
    this.reload();
  }
  /**
   * Change sorting for column.
   *
   * For call from column class. Reload table.
   *
   * @param col {int} Column number.
   * @param value {string} Sort order: "ASC", "DESC" and "" for no sorting.
   */


  change_sort_for_column(col, value) {
    this.state.columns[col].sorting = value;
    this.reload();
  }
  /**
   * Notify that value in editor is changed.
   *
   * Value stored in table cache and will be sended then `save_row` called.
   * All subscribed widgets will be notifed by `on_changes` call.
   *
   * For call from column class.
   *
   * @param col {int} Column number.
   * @param row {int} Row number. -1 in new row.
   * @param value {*} Value.
   */


  notify_changes(row, col, value) {
    this.changes = this.changes.filter(item => !(item[0] == row && item[1] == col));
    this.changes.push([row, col, value]);
    this.changes_handlers = this.changes_handlers.filter(item => item[2].current != null);
    this.changes_handlers.filter(item => item[0] == row && item[1] == col).map(item => item[3].on_changes(row, col, value));
  }
  /**
   * Notify that value in editor is valid or invalid.
   *
   * If any editor notified about invalid value, row will not be saved.
   *
   * For call from column class.
   *
   * @param col {int} Column number.
   * @param row {int} Row number. -1 in new row.
   * @param is_valid {Boolean} Validation status.
   */


  notify_valids(row, col, is_valid) {
    this.valids = this.valids.filter(item => !(item[0] == row && item[1] == col));
    this.valids.push([row, col, is_valid]);
  }
  /**
   * Subscribe editor to notification about other column changed.
   *
   * Editor should provide ref for unsubscribe if closed.
   *
   * For call from column class.
   *
   * @param row {int} Current row number. -1 in new row.
   * @param col {int} Observed column number.
   * @param ref {PreactRef} Reference to editor.
   * @param obj {CTableColumn} Object to interact.
   */


  subscribe_to_changes(row, col, ref, obj) {
    this.changes_handlers.push([row, col, ref, obj]);
  }
  /**
   * Reloading table data.
   */


  reload() {
    if (this.state.columns.length == 0) return;
    var column_filters = {};
    var column_searches = {};
    var column_orders = {};
    var self = this;

    if (typeof this.props.filters !== 'undefined') {
      this.props.filters.forEach(item => column_filters[item[0]] = item[1]);
    }

    this.state.columns.forEach(item => item.name != '' && item.filtering ? column_filters[item.name] = item.filtering : '');
    this.state.columns.forEach(item => item.name != '' && item.searching ? column_searches[item.name] = item.searching : '');
    this.state.columns.forEach(item => item.name != '' && item.sorting ? column_orders[item.name] = item.sorting : '');
    var query = {
      start: this.props.no_pagination ? 0 : this.state.records_on_page * this.state.current_page,
      page: this.props.no_pagination ? 0 : this.state.records_on_page,
      column_filters: column_filters,
      column_searches: column_searches,
      column_orders: column_orders
    };
    var query_params = new URLSearchParams({
      select: JSON.stringify(query),
      ...this.props.params
    });
    fetch(this.props.endpoint + '?' + query_params.toString()).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        alert(self.props.lang.server_error + response.status);
      }
    }).then(function (result) {
      if (!result) return;

      if (result.Result == 'OK') {
        self.changes = [];
        self.setState({
          records: result.Records,
          total_records: result.TotalRecordCount,
          records_on_page: self.state.records_on_page,
          current_page: self.state.current_page,
          opened_editors: [],
          opened_subtables: [],
          total_pages: Math.floor(result.TotalRecordCount / self.state.records_on_page) - (result.TotalRecordCount % self.state.records_on_page == 0 ? 1 : 0)
        });
      } else {
        alert(self.props.lang.error + result.Message);
      }
    });
  }

  load_options(endpoint, params, elem, ref) {
    var query_params = new URLSearchParams({
      options: '{}',
      ...params
    });
    var url = endpoint + '?' + query_params.toString();
    var self = this;

    if (url in this.options_cache) {
      if (this.options_cache[url] == null) {
        setTimeout(function () {
          self.load_options(endpoint, params, elem, ref);
        }, 500);
      } else {
        elem.setState({
          options: this.options_cache[url]
        });
      }
    } else {
      this.options_cache[url] = null;
      fetch(url).then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          alert(self.props.lang.server_error + response.status);
        }
      }).then(function (result) {
        if (!result) return;

        if (result.Result == 'OK') {
          self.options_cache[url] = result.Options; //if(ref.current != null){

          elem.setState({
            options: self.options_cache[url]
          }); //}
        } else {
          alert(self.props.lang.error + result.Message);
        }
      });
    }
  }

  recordsOnPageChanged = e => {
    this.state.records_on_page = parseInt(e.target.value);
    this.state.current_page = 0;
    this.reload();
  };
  toFirstPage = e => {
    if (this.state.current_page != 0) {
      this.state.current_page = 0;
      this.reload();
    }
  };
  toLastPage = e => {
    if (this.state.current_page != this.state.total_pages) {
      this.state.current_page = this.state.total_pages;
      this.reload();
    }
  };
  toNextPage = e => {
    if (this.state.current_page < this.state.total_pages) {
      this.state.current_page = this.state.current_page + 1;
      this.reload();
    }
  };
  toPrevPage = e => {
    if (this.state.current_page - 1 >= 0) {
      this.state.current_page = this.state.current_page - 1;
      this.reload();
    }
  };
  toPage = e => {
    this.state.current_page = parseInt(e.target.value);
    this.reload();
  };

  get_pages() {
    if (this.state.total_records == 0) {
      return [0];
    }

    var pages = [];

    for (var i = 0; i <= Math.floor(this.state.total_records / this.state.records_on_page); i++) {
      pages.push(i);
    }

    if (this.state.total_records % this.state.records_on_page == 0) {
      pages.pop();
    }

    return pages;
  }
  /**
   * Return count of visible columns.
   */


  visible_column_count() {
    return this.state.columns.filter(c => c.hide_column != true).length;
  }

  render() {
    var tbody = h("tbody", null, this.state.opened_editors.includes(-1) ? h("tr", null, h("td", {
      colspan: this.visible_column_count()
    }, this.state.columns.map((column, j) => h(Fragment, null, column.hide_editor != true ? h(column.kind, {
      role: "editor",
      is_new: true,
      table: this,
      column: j,
      row: -1,
      key: j * 1000000,
      ...column
    }) : '')))) : '', this.state.records.map((cell, i) => h(Fragment, null, h("tr", {
      class: this.state.opened_editors.includes(i) || this.state.opened_subtables.includes(i) ? "is-selected" : ""
    }, " ", this.state.columns.map((column, j) => column.hide_column != true ? h("td", null, "                           ", h(column.kind, {
      role: "cell",
      table: this,
      column: j,
      row: i,
      key: j * 1000000 + i,
      ...column
    })) : ''), " "), this.state.opened_editors.includes(i) ? h("tr", null, h("td", {
      colspan: this.visible_column_count()
    }, this.state.columns.map((column, j) => h(Fragment, null, column.hide_editor != true ? h(column.kind, {
      role: "editor",
      is_new: false,
      table: this,
      column: j,
      row: i,
      key: j * 1000000 + i,
      ...column
    }) : '')))) : '', this.state.opened_subtables.includes(i) ? h("tr", null, h("td", {
      colspan: this.visible_column_count()
    }, h(CTable, {
      lang: this.props.lang,
      ...this.subtables_params[i]
    }))) : '')), this.state.records.length == 0 ? h("tr", null, h("td", {
      colspan: this.visible_column_count()
    }, h("div", {
      class: "has-text-centered"
    }, this.props.lang.no_data))) : '');
    var pager = h("div", {
      class: "field has-addons",
      style: "justify-content:center;"
    }, h("div", {
      class: "control"
    }, h("div", {
      class: "button",
      onClick: this.toFirstPage,
      title: this.props.lang.to_first_page
    }, h("span", {
      class: "icon"
    }, "\u21E4"))), h("div", {
      class: "control"
    }, h("div", {
      class: "button",
      onClick: this.toPrevPage,
      title: this.props.lang.to_prev_page
    }, h("span", {
      class: "icon"
    }, "\u2190"))), h("div", {
      class: "control"
    }, h("div", {
      class: "select"
    }, h("select", {
      value: this.state.current_page,
      onChange: this.toPage
    }, this.get_pages().map(page => h("option", {
      value: page
    }, page + 1))))), h("div", {
      class: "control"
    }, h("div", {
      class: "button",
      onClick: this.toNextPage,
      title: this.props.lang.to_next_page
    }, h("span", {
      class: "icon"
    }, "\u2192"))), h("div", {
      class: "control"
    }, h("div", {
      class: "button",
      onClick: this.toLastPage,
      title: this.props.lang.to_last_page
    }, h("span", {
      class: "icon"
    }, "\u21E5"))), h("div", {
      class: "control"
    }, h("div", {
      class: "button"
    }, this.props.lang.show_by)), h("div", {
      class: "control"
    }, h("div", {
      class: "select"
    }, h("select", {
      value: this.state.records_on_page,
      onChange: this.recordsOnPageChanged
    }, h("option", {
      value: "2"
    }, "2"), h("option", {
      value: "5"
    }, "5"), h("option", {
      value: "10"
    }, "10"), h("option", {
      value: "25"
    }, "25"), h("option", {
      value: "50"
    }, "50"), h("option", {
      value: "100"
    }, "100")))), h("div", {
      class: "control"
    }, h("div", {
      class: "button"
    }, " ", this.props.lang.current_page, " ", this.state.current_page + 1, " ", this.props.lang.from, " ", this.state.total_pages + 1, ".")));
    return h("div", {
      class: "table-container"
    }, h("table", {
      class: "table",
      style: "width: 100%;"
    }, h("thead", null, h("tr", null, this.state.columns.map((column, i) => column.hide_column != true ? h("th", null, h(column.kind, {
      role: "header",
      table: this,
      column: i,
      key: i,
      ...column
    }), " ") : '')), h("tr", null, this.state.columns.map((column, i) => column.hide_column != true ? h("th", null, h(column.kind, {
      role: "search",
      table: this,
      column: i,
      key: i,
      ...column
    }), " ") : ''))), h("tfoot", null, h("tr", null, this.state.columns.map((column, i) => column.hide_column != true ? h("th", null, h(column.kind, {
      role: "footer",
      table: this,
      column: i,
      key: i,
      ...column
    }), " ") : ''))), tbody), this.props.no_pagination ? '' : pager);
  }

}
