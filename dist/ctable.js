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
} // This functions adopted from Just Clone library
// https://github.com/angus-c/just
// Copyright by Contributors:
// https://github.com/angus-c/just/graphs/contributors
// Under the terms of MIT License
// Source file:
// https://github.com/angus-c/just/blob/master/packages/collection-clone/index.mjs


function clone(obj) {
  if (typeof obj == 'function') {
    return obj;
  }

  var result = Array.isArray(obj) ? [] : {};

  for (var key in obj) {
    // include prototype properties
    var value = obj[key];
    var type = {}.toString.call(value).slice(8, -1);

    if (type == 'Array' || type == 'Object') {
      result[key] = clone(value);
    } else if (type == 'Date') {
      result[key] = new Date(value.getTime());
    } else if (type == 'RegExp') {
      result[key] = RegExp(value.source, getRegExpFlags(value));
    } else {
      result[key] = value;
    }
  }

  return result;
}

function getRegExpFlags(regExp) {
  if (typeof regExp.source.flags == 'string') {
    return regExp.source.flags;
  } else {
    var flags = [];
    regExp.global && flags.push('g');
    regExp.ignoreCase && flags.push('i');
    regExp.multiline && flags.push('m');
    regExp.sticky && flags.push('y');
    regExp.unicode && flags.push('u');
    return flags.join('');
  }
} // End of adopted code
var ctable_lang = {
  en: {
    current_page: 'Page',
    no_pages: 'No pages',
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
    file_present: 'File present',
    multiple_files: 'Files: ',
    file_to_large: 'File too large',
    file_wrong_extention: 'File have a wrong type',
    file_filter_no: 'No file',
    file_filter_yes: 'Have a file',
    reload: 'Reload',
    loading: 'Loading...',
    all: 'All',
    file_only_one: 'Only one file should be uploaded'
  },
  ru: {
    current_page: 'Страница',
    no_pages: 'Нет страниц',
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
    file_present: 'Файл загружен',
    multiple_files: 'Файлы: ',
    file_to_large: 'Файл слишком велик',
    file_wrong_extention: 'Файл имеет недопустимый тип',
    file_filter_no: 'Нет файла',
    file_filter_yes: 'Файл загружен',
    reload: 'Перезагрузить',
    loading: 'Загрузка...',
    all: 'Все',
    file_only_one: 'Может быть загружен только один файл'
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
 * @arg this.props.tab {int} Editor page, -1 for show on all pages.
 * @arg this.props.sorting {undefined|string} Column sorting order: 'ASC', 'DESC' or ''. No sorting in `undefined`.
 * @arg this.props.searching {undefined|string} Column searching: query string or ''. No search in `undefined`.
 * @arg this.props.exact {undefined|boolean} Search only on exact match.
 */
class CTableColumn extends Component {
  /**
   * Trivial constructor. Call super() to create Component correctly.
   */
  constructor() {
    super();
    this.searchCleared = this.searchCleared.bind(this);
    this.searchChanged = this.searchChanged.bind(this);
    this.sortingChanged = this.sortingChanged.bind(this);
  }

  componentDidMount() {
    this.setState({
      searching: this.props.search
    });
  }

  searchCleared(e) {
    this.setState({
      searching: null
    });

    if (typeof this.props.exact === 'undefined' || this.props.exact == false) {
      this.props.table.change_search_for_column(this.props.column, null);
    } else {
      this.props.table.change_filter_for_column(this.props.column, null);
    }
  }

  searchChanged(e) {
    if (e.target.value === "") {
      this.searchCleared(e);
      return;
    }

    this.setState({
      searching: e.target.value
    });

    if (typeof this.props.exact === 'undefined' || this.props.exact == false) {
      this.props.table.change_search_for_column(this.props.column, e.target.value);
    } else {
      this.props.table.change_filter_for_column(this.props.column, e.target.value);
    }
  }

  sortingChanged(e) {
    var order = null;

    if (this.props.sorting == 'ASC') {
      order = 'DESC';
    } else if (this.props.sorting == 'DESC') {
      order = null;
    } else if (this.props.sorting == null) {
      order = 'ASC';
    }

    this.props.table.change_sort_for_column(this.props.column, order);
  }
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
      }, h("span", {
        class: "material-icons"
      }, "cancel")));
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
      } else if (this.props.sorting == null) {
        arrow = '⇵';
      }

      return h("b", null, h("a", {
        onClick: this.sortingChanged
      }, h("span", {
        class: "icon",
        style: "display:inline"
      }, arrow), "\xA0", this.title()));
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
    var self = this;
    var changes = this.props.table.changes.filter(function (item) {
      return item[0] == self.props.row && item[1] == self.props.column;
    });

    if (changes.length == 1) {
      return changes[0][2];
    }

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
  /**
   * Main render method.
   *
   * Call specific method by this.props.role.
   *
   * @return {PreactNode} Cell control.
   */


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
 * @arg this.props.left_align {undefined|Boolean} Disable force right align.
 */
class CActionColumn extends CTableColumn {
  constructor() {
    super();
    this.newClicked = this.newClicked.bind(this);
    this.additionalClicked = this.additionalClicked.bind(this);
    this.menuLeave = this.menuLeave.bind(this);
    this.reloadClicked = this.reloadClicked.bind(this);
    this.editClicked = this.editClicked.bind(this);
    this.discardClicked = this.discardClicked.bind(this);
    this.saveClicked = this.saveClicked.bind(this);
    this.deleteClicked = this.deleteClicked.bind(this);
    this.menu_actions = [];
    this.setState({
      menu_active: false,
      search_menu_id: makeID()
    });
  }

  componentDidMount() {
    super.componentDidMount();
    this.menu_actions = [[this.reloadClicked, this.props.table.props.lang.reload]];
  }

  newClicked(e) {
    this.props.table.edit_row(-1);
  }

  additionalClicked(e) {
    this.setState({
      menu_active: !this.state.menu_active
    });
  }

  menuLeave(e) {
    if (e.relatedTarget !== null) {
      e.relatedTarget.click();
    }

    this.setState({
      menu_active: false
    });
  }

  reloadClicked(e) {
    e.preventDefault();
    this.props.table.reload();
  }

  editClicked(e) {
    this.props.table.edit_row(this.props.row);
  }

  discardClicked(e) {
    this.props.table.edit_row(this.props.row);
  }

  saveClicked(e) {
    this.props.table.save_row(this.props.row);
  }

  deleteClicked(e) {
    if (window.confirm(this.props.table.props.lang.delete_row_ask)) {
      this.props.table.delete_row(this.props.row);
    }
  }

  render_header() {
    return h("b", null, this.title());
  }

  render_editor() {
    return h("div", {
      class: "field has-addons",
      style: this.props.left_align ? "" : "justify-content: right;"
    }, h("div", {
      class: "control"
    }, h("button", {
      class: "button is-primary",
      onClick: this.saveClicked
    }, h("span", {
      class: "material-icons"
    }, "save"), " ", this.props.table.props.lang.save)), h("div", {
      class: "control"
    }, h("button", {
      class: "button is-warning",
      onClick: this.discardClicked
    }, h("span", {
      class: "material-icons"
    }, "cancel"), " ", this.props.table.props.lang.discard)));
  }

  render_cell() {
    return h("div", {
      class: "field has-addons",
      style: this.props.left_align ? "" : "justify-content: right;"
    }, this.props.no_edit ? '' : h("div", {
      class: "control"
    }, h("button", {
      class: this.props.table.state.opened_editors.includes(this.props.row) ? "button is-warning  is-inverted" : "button is-warning",
      title: this.props.table.props.lang.edit_rec,
      onClick: this.editClicked
    }, h("span", {
      class: "icon"
    }, h("span", {
      class: "material-icons"
    }, "edit")))), this.props.no_delete ? '' : h("div", {
      class: "control"
    }, h("button", {
      class: "button is-danger",
      title: this.props.table.props.lang.delete_rec,
      onClick: this.deleteClicked
    }, h("span", {
      class: "icon"
    }, h("span", {
      class: "material-icons"
    }, "delete")))));
  }

  render_search() {
    return h("div", {
      class: this.state.menu_active ? 'field has-addons dropdown is-active' + (this.props.left_align ? '' : ' is-right') : 'field has-addons dropdown' + (this.props.left_align ? '' : ' is-right'),
      style: this.props.left_align ? "" : "justify-content: right;"
    }, this.props.no_add ? '' : h("div", {
      class: "control"
    }, h("button", {
      class: this.props.table.state.opened_editors.includes(this.props.row) ? "button is-warning is-inverted" : "button is-warning",
      title: this.props.table.props.lang.add_rec,
      onClick: this.newClicked
    }, h("span", {
      class: "icon"
    }, h("span", {
      class: "material-icons"
    }, "add_circle")))), this.props.no_menu ? '' : h("div", {
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
    }, h("span", {
      class: "material-icons"
    }, "menu"))), h("div", {
      class: "dropdown-menu",
      id: this.state.search_menu_id,
      role: "menu",
      style: this.state.menu_active ? "display:inherit;" : ""
    }, h("div", {
      class: "dropdown-content"
    }, this.menu_actions.map(function (item) {
      return h("a", {
        href: "",
        class: "dropdown-item",
        onClick: item[0]
      }, item[1]);
    })))));
  }

}
/**
 * Date edit class.
 *
 * This column for date editing.
 * @arg this.props.years_range {int[]} Years range.
 * @arg this.props.years_range.0 {int} Minimum.
 * @arg this.props.years_range.1 {int} Maximum.
 *
 */
function parseISOString(s) {
  var b = s.split(/\D+/);
  return new Date(Date.UTC(b[0], --b[1], b[2]));
}

function createGOSTString(d) {
  return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getFullYear());
}

function createISOString(d) {
  return String(d.getFullYear()) + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

class CDateColumn extends CTableColumn {
  constructor() {
    super();
    this.editorChanged = this.editorChanged.bind(this);
    this.hintClicked = this.hintClicked.bind(this);
    this.ref_day = createRef();
    this.ref_month = createRef();
    this.ref_year = createRef();
  }

  componentDidMount() {
    this.setState({
      editor_valid: true,
      value: this.value()
    });
  }

  render_cell() {
    if (this.value()) {
      var d = parseISOString(this.value());
      return h("span", null, createGOSTString(d));
    } else {
      return h("span", null);
    }
  }

  editorChanged(e) {
    var ed_value = this.ref_year.current.value + '-' + this.ref_month.current.value + '-' + this.ref_day.current.value;
    this.setState({
      value: ed_value
    });
    this.props.table.notify_changes(this.props.row, this.props.column, ed_value);

    if (ed_value.match(/^\d\d\d\d-\d\d-\d\d$/)) {
      this.props.table.notify_valids(this.props.row, this.props.column, true);
      this.setState({
        editor_valid: true
      });
    }
  }

  hintClicked(e) {
    this.setState({
      value: e.target.dataset.hintvalue
    });
    this.props.table.notify_changes(this.props.row, this.props.column, e.target.dataset.hintvalue);
  }

  value() {
    var v = super.value();

    if (v === null || v === "") {
      var ds = createISOString(new Date());
      this.props.table.notify_changes(this.props.row, this.props.column, ds);
      return ds;
    }

    return v;
  }

  render_editor() {
    var self = this;
    var date = parseISOString(this.value());
    var ymin = 1900;
    var maxscale = 200;

    if (this.props.years_range) {
      ymin = this.props.years_range[0];
      maxscale = this.props.years_range[1] - this.props.years_range[0] + 1;
    }

    return h("div", {
      class: "field",
      ref: this.ref
    }, h("label", {
      class: "label"
    }, this.title()), h("div", {
      class: "field has-addons"
    }, h("div", {
      class: "control"
    }, h("div", {
      class: "select"
    }, h("select", {
      value: String(date.getDate()).padStart(2, '0'),
      onChange: this.editorChanged,
      ref: this.ref_day
    }, [...Array(31).keys()].map(function (k) {
      return h("option", {
        value: String(k + 1).padStart(2, '0')
      }, String(k + 1).padStart(2, '0'));
    })))), h("div", {
      class: "control"
    }, h("div", {
      class: "select"
    }, h("select", {
      value: String(date.getMonth() + 1).padStart(2, '0'),
      onChange: this.editorChanged,
      ref: this.ref_month
    }, [...Array(12).keys()].map(function (k) {
      return h("option", {
        value: String(k + 1).padStart(2, '0')
      }, String(k + 1).padStart(2, '0'));
    })))), h("div", {
      class: "control"
    }, h("div", {
      class: "select"
    }, h("select", {
      value: String(date.getFullYear()).padStart(2, '0'),
      onChange: this.editorChanged,
      ref: this.ref_year
    }, [...Array(maxscale).keys()].map(function (k) {
      return h("option", {
        value: String(k + ymin)
      }, String(k + ymin));
    }))))), this.props.input_hints ? h("div", {
      class: "tags",
      style: "margin-top: 0.2em;"
    }, this.props.input_hints.map(function (c, i) {
      return h("span", {
        class: "tag button",
        "data-hintvalue": c[0],
        onClick: self.hintClicked
      }, c[1]);
    })) : '', this.props.footnote ? h("div", {
      class: "help"
    }, this.props.footnote) : '');
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
    this.filterChanged = this.filterChanged.bind(this);
    this.editorChanged = this.editorChanged.bind(this);
    this.state = {
      options: []
    };
    this.ref = createRef();
  }

  componentDidMount() {
    this.props.table.load_options(this.props.endpoint, this.props.params, this, this.ref);
  }

  render_cell() {
    var self = this;
    var cvalues = this.state.options.filter(function (item) {
      return item[0] == self.value();
    });

    if (cvalues.length > 0) {
      return h("span", null, cvalues[0][1]);
    }

    return h("span", null);
  }

  filterChanged(e) {
    if (e.target.value == '') {
      this.props.table.change_filter_for_column(this.props.column, null);
    } else {
      this.props.table.change_filter_for_column(this.props.column, e.target.value);
    }
  }

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
      }, this.props.table.props.lang.no_filter), this.state.options.map(function (item) {
        return h("option", {
          value: item[0]
        }, item[1]);
      })));
    }
  }

  editorChanged(e) {
    if (e.target.value == '') {
      this.props.table.notify_changes(this.props.row, this.props.column, null);
    } else {
      this.props.table.notify_changes(this.props.row, this.props.column, e.target.value);
    }
  }

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
    }, this.state.options.map(function (item) {
      return h("option", {
        value: item[0]
      }, item[1]);
    })))), this.props.footnote ? h("div", {
      class: "help"
    }, this.props.footnote) : '');
  }

}
/**
 * Numeric edit class.
 *
 * This column for numbers editing (integer or float).
 *
 * @arg this.props.placeholder {string} Placeholder for column editor.
 * @arg this.props.domain {string} Domain numbers: 'integer' or 'float'
 * @arg this.props.minimum {float} Minimum.
 * @arg this.props.maximum {float} Maximum.
 * @arg this.props.step {float} Step.
 * @arg this.props.round {float} Step.
 * @arg this.props.input_hints {string[]} Input hints list.
 * @arg this.props.input_hints.0 {float} Hints text added to input.
 * @arg this.props.input_hints.1 {string} Hints button text.
 */
class CNumericColumn extends CTableColumn {
  constructor() {
    super();
    this.editorChanged = this.editorChanged.bind(this);
    this.hintClicked = this.hintClicked.bind(this);
    this.addStep = this.addStep.bind(this);
    this.removeStep = this.removeStep.bind(this);
    this.numeric_validator = this.numeric_validator.bind(this);
    this.numeric_value_extractor = this.numeric_value_extractor.bind(this);
    this.ref = createRef();
  }

  componentDidMount() {
    this.setState({
      editor_valid: true,
      value: this.value()
    });
  }

  render_cell() {
    if (this.props.domain == 'integer') return h("span", null, this.value());
    if (this.props.domain == 'float') if (this.props.round) return h("span", null, parseFloat(this.value()).toFixed(this.props.round));else return h("span", null, parseFloat(this.value()).toFixed(2));
  }

  numeric_value_extractor(v) {
    var val = 0;
    if (this.props.domain == 'integer') if (typeof v == "string") val = parseInt(v);else val = v;
    if (this.props.domain == 'float') if (typeof v == "string") val = parseFloat(v.replace(',', '.'));else val = v;
    if (this.props.minimum) if (val < this.props.minimum) val = this.props.minimum;
    if (this.props.maximum) if (val > this.props.maximum) val = this.props.maximum;
    return val;
  }

  numeric_validator(v) {
    if (this.props.domain == 'integer') if (typeof v == "string") return v.match(/^[+-]\d+$/);
    if (this.props.domain == 'float') if (typeof v == "string") return !/^\s*$/.test(v) && !isNaN(v.replace(',', '.'));
    return true;
  }

  editorChanged(e) {
    var ed_value = this.numeric_value_extractor(e.target.value);
    this.setState({
      value: ed_value
    });
    this.props.table.notify_changes(this.props.row, this.props.column, ed_value);

    if (this.numeric_validator(ed_value)) {
      this.props.table.notify_valids(this.props.row, this.props.column, true);
      this.setState({
        editor_valid: true
      });
    }
  }

  hintClicked(e) {
    this.setState({
      value: e.target.dataset.hintvalue
    });
    this.props.table.notify_changes(this.props.row, this.props.column, e.target.dataset.hintvalue);
  }

  addStep(e) {
    var v = this.numeric_value_extractor(this.state.value);

    if (this.props.step) {
      v = v + this.props.step;
    } else {
      v = v + 1;
    }

    if (this.props.maximum) if (v > this.props.maximum) v = this.props.maximum;
    this.setState({
      value: v
    });
    this.props.table.notify_changes(this.props.row, this.props.column, v);
  }

  removeStep(e) {
    var v = this.numeric_value_extractor(this.state.value);

    if (this.props.step) {
      v = v - this.props.step;
    } else {
      v = v - 1;
    }

    if (this.props.minimum) if (v < this.props.minimum) v = this.props.minimum;
    this.setState({
      value: v
    });
    this.props.table.notify_changes(this.props.row, this.props.column, v);
  }

  render_editor() {
    var self = this;
    var minput = '';
    var mvalue = '0';

    if (this.value() != null && this.value() != "") {
      mvalue = this.value();
    }

    if (self.props.domain == 'integer') {
      minput = h("input", {
        class: !this.state.editor_valid ? "input is-danger" : "input",
        type: "text",
        value: mvalue,
        onChange: this.editorChanged,
        placeholder: this.props.placeholder
      });
    }

    if (self.props.domain == 'float') {
      if (this.props.round) minput = h("input", {
        class: !this.state.editor_valid ? "input is-danger" : "input",
        type: "text",
        value: parseFloat(mvalue).toFixed(this.props.round),
        onChange: this.editorChanged,
        placeholder: this.props.placeholder
      });else minput = h("input", {
        class: !this.state.editor_valid ? "input is-danger" : "input",
        type: "text",
        value: parseFloat(mvalue).toFixed(2),
        onChange: this.editorChanged,
        placeholder: this.props.placeholder
      });
    }

    return h("div", {
      class: "field",
      ref: this.ref
    }, h("label", {
      class: "label"
    }, this.title()), h("div", {
      class: "field has-addons"
    }, h("div", {
      class: "control"
    }, minput), h("div", {
      class: "control"
    }, h("button", {
      class: "button is-info",
      onClick: this.addStep
    }, "+")), h("div", {
      class: "control"
    }, h("button", {
      class: "button is-info",
      onClick: this.removeStep
    }, "-"))), this.props.input_hints ? h("div", {
      class: "tags",
      style: "margin-top: 0.2em;"
    }, this.props.input_hints.map(function (c, i) {
      return h("span", {
        class: "tag button",
        "data-hintvalue": c[0],
        onClick: self.hintClicked
      }, c[1]);
    })) : '', this.props.footnote ? h("div", {
      class: "help"
    }, this.props.footnote) : '');
  }

}
/**
 * Plain upload column.
 *
 * Simple column for uploading files.
 *
 * @arg {string} this.props.upload_endpoint - Endpoint for uploading files.
 * @arg {string} this.props.links_endpoint -  Endpoint for links to files.
 * @arg {undefined | int} this.props.max_file_size - Maximum file size.
 * @arg {undefined | string[]} this.props.allowed_extentions - Allowed file extention.
 */
class CPlainUploadColumn extends CTableColumn {
  constructor() {
    super();
    this.filterChanged = this.filterChanged.bind(this);
    this.uploadChanged = this.uploadChanged.bind(this);
    this.editorChanged = this.editorChanged.bind(this);
    this.editorCleared = this.editorCleared.bind(this);
    this.ref = createRef();
  }

  componentDidMount() {
    this.setState({
      value: this.value()
    });
  }

  render_cell() {
    if (!this.value()) {
      return h("a", {
        class: "button is-info",
        disabled: "true"
      }, h("span", {
        class: "material-icons"
      }, "attach_file"), " ", this.props.table.props.lang.no_file);
    }

    if (typeof this.props.links_endpoint === 'undefined') {
      return h("a", {
        class: "button is-info"
      }, h("span", {
        class: "material-icons"
      }, "attach_file"), this.props.table.props.lang.file_present);
    }

    return h("a", {
      class: "button is-info",
      href: this.props.links_endpoint + this.value()
    }, h("span", {
      class: "material-icons"
    }, "attach_file"), this.props.table.props.lang.file_present);
  }

  filterChanged(e) {
    if (e.target.value == '') {
      this.props.table.change_filter_for_column(this.props.column, null);
    } else {
      this.props.table.change_filter_for_column(this.props.column, e.target.value);
    }

    this.setState({
      value: e.target.value
    });
  }

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
        value: "%nodata"
      }, this.props.table.props.lang.file_filter_no), h("option", {
        value: "%notempty"
      }, this.props.table.props.lang.file_filter_yes)));
    }
  }

  editorChanged(e) {
    this.props.table.notify_changes(this.props.row, this.props.column, e.target.value);
    this.setState({
      value: e.target.value
    });
  }

  editorCleared() {
    this.props.table.notify_changes(this.props.row, this.props.column, "");
    this.setState({
      value: ""
    });
  }

  uploadChanged(e) {
    var form_data = new FormData();

    if (e.target.files.length != 1) {
      alert(this.props.table.props.lang.file_only_one);
      return;
    }

    if (this.props.max_file_size) {
      if (e.target.files[0].size > this.props.max_file_size) {
        alert(this.props.table.props.lang.file_to_large);
        return;
      }
    }

    if (this.props.allowed_extentions) {
      if (this.props.allowed_extentions.filter(item => e.target.files[0].name.toLowerCase().endsWith(item)).length == 0) {
        alert(this.props.table.props.lang.file_wrong_extention);
        return;
      }
    }

    form_data.append("file", e.target.files[0]);
    var self = this;
    var xkeys = {};
    this.props.table.state.columns.map(function (item, i) {
      if (item.is_key == true && self.props.row >= 0) {
        xkeys[item.name] = self.props.table.state.records[self.props.row][item.name];
      }
    });
    form_data.append("keys", JSON.stringify(xkeys));
    this.props.table.setState({
      waiting_active: true
    });
    fetch(this.props.upload_endpoint, {
      method: 'POST',
      body: form_data
    }).then(function (response) {
      self.props.table.setState({
        waiting_active: false
      }); // always disable table waiting

      if (response.ok) {
        return response.json();
      } else {
        alert(self.props.table.props.lang.server_error + response.status);
      }
    }).then(function (result) {
      if (!result) return;

      if (result.Result == 'OK') {
        self.props.table.notify_changes(self.props.row, self.props.column, result.Filename);
        self.setState({
          value: result.Filename
        });
      }

      if (result.Result == 'Error') {
        alert(result.Message);
      }
    });
  }

  render_editor() {
    return h(Fragment, null, h("label", {
      class: "label"
    }, this.title()), h("div", {
      class: "field has-addons"
    }, h("div", {
      class: "control"
    }, h("input", {
      class: "input",
      value: this.state.value,
      onChange: this.editorChanged
    })), h("div", {
      class: "control"
    }, h("a", {
      class: "button is-info",
      target: "_blank",
      href: this.state.value === null || this.state.value === '' ? false : this.props.links_endpoint + this.state.value,
      disabled: this.state.value === null || this.state.value === '' ? true : false
    }, h("span", {
      class: "material-icons"
    }, "attach_file"))), h("div", {
      class: "control"
    }, h("button", {
      class: "button is-info"
    }, h("span", {
      class: "material-icons"
    }, "upload")), h("input", {
      class: "file-input",
      type: "file",
      name: "file",
      onChange: this.uploadChanged
    })), h("div", {
      class: "control"
    }, h("button", {
      class: "button is-danger",
      onClick: this.editorCleared
    }, h("span", {
      class: "material-icons"
    }, "cancel")))), this.props.footnote ? h("div", {
      class: "help"
    }, this.props.footnote) : '');
  }

}
class SearchableSelect extends Component {
  constructor() {
    super();
    this.dropdownMenuEnter = this.dropdownMenuEnter.bind(this);
    this.dropdownMenuLeave = this.dropdownMenuLeave.bind(this);
    this.filterCleared = this.filterCleared.bind(this);
    this.menuItemClicked = this.menuItemClicked.bind(this);
    this.menuFilterChanged = this.menuFilterChanged.bind(this);
    this.menuFilterCleared = this.menuFilterCleared.bind(this);
    this.state = {
      menu_active: false,
      menu_id: makeID(),
      input_id: makeID(),
      selected_id: makeID(),
      current_item: null,
      filter_text: '',
      top_index: -1
    };
  }

  componentDidMount() {
    this.setState({
      current_item: this.props.value
    });
  }

  value2text(value) {
    var items = this.props.options.filter(function (item) {
      return value == item[0];
    });

    if (items.length == 1) {
      return items[0][1];
    }

    return '';
  }

  dropdownMenuEnter(e) {
    this.setState({
      menu_active: true
    });
    var self = this;
    setTimeout(function () {
      document.getElementById(self.state.input_id).focus();
    }, 100);
  }

  dropdownMenuLeave(e) {
    if (e.relatedTarget !== null && e.relatedTarget.id == this.state.input_id) {
      return;
    }

    this.setState({
      menu_active: false
    });

    if (e.relatedTarget !== null && e.relatedTarget.classList.contains("dropdown-item")) {
      e.relatedTarget.click();
    }
  }

  filterCleared(e) {
    this.setState({
      current_item: null,
      filter_text: '',
      top_index: -1
    });
    this.props.valueChanged(null);
  }

  menuFilterCleared(e) {
    this.setState({
      filter_text: '',
      top_index: -1
    });
  }

  menuFilterChanged(e) {
    var aw_options = this.available_options();

    if (e.key == "Enter") {
      e.preventDefault();
      if (aw_options.length == 0) return;
      if (this.state.top_index == -1) return;
      this.setState({
        top_index: -1,
        menu_active: false,
        current_item: aw_options[this.state.top_index][0],
        filter_text: ''
      });
      this.props.valueChanged(aw_options[this.state.top_index][0]);
      return;
    }

    if (e.key == "ArrowDown") {
      if (this.state.top_index + 1 < aw_options.length) this.setState({
        top_index: this.state.top_index + 1
      });
      return;
    }

    if (e.key == "ArrowUp") {
      if (this.state.top_index - 1 >= -1) this.setState({
        top_index: this.state.top_index - 1
      });
      return;
    }

    this.setState({
      filter_text: e.target.value,
      top_index: -1
    });
  }

  menuItemClicked(e) {
    e.preventDefault();
    this.setState({
      menu_active: false,
      current_item: e.target.dataset['value'],
      filter_text: '',
      top_index: -1
    });
    this.props.valueChanged(e.target.dataset['value']);
  }

  available_options() {
    var aw_options = this.props.options;
    var self = this;

    if (this.state.filter_text != "") {
      var lowtext = self.state.filter_text.toLowerCase();
      var partA = aw_options.filter(function (item) {
        return item[1].toLowerCase().startsWith(lowtext);
      });
      var partB = aw_options.filter(function (item) {
        return item[1].toLowerCase().indexOf(lowtext) > 0;
      });
      aw_options = partA.concat(partB);
    }

    return aw_options;
  }

  render() {
    var self = this;
    var aw_options = this.available_options();
    var item_count = -1;
    return h("div", {
      class: "field"
    }, h("div", {
      class: this.state.menu_active ? "dropdown is-active" : "dropdown"
    }, h("div", {
      class: "dropdown-trigger"
    }, h("div", {
      class: "field"
    }, this.props.title ? h("label", {
      class: "label"
    }, this.props.title) : '', h("p", {
      class: "control is-expanded has-icons-right"
    }, h("input", {
      class: "input",
      type: "input",
      onFocus: this.dropdownMenuEnter,
      onBlur: this.dropdownMenuLeave,
      value: this.value2text(this.state.current_item),
      readonly: true
    }), h("span", {
      class: "icon is-small is-right",
      style: "pointer-events: all; cursor: pointer",
      onClick: this.filterCleared
    }, h("span", {
      class: "material-icons"
    }, "cancel"))))), h("div", {
      class: "dropdown-menu",
      id: this.state.menu_id,
      role: "menu"
    }, h("div", {
      class: "dropdown-content",
      style: "max-height: 13em; overflow: auto;"
    }, h("div", {
      class: "field dropdown-item "
    }, h("p", {
      class: "control"
    }, h("input", {
      class: "input",
      type: "input",
      id: this.state.input_id,
      onBlur: this.dropdownMenuLeave,
      onKeyUp: this.menuFilterChanged,
      value: this.state.filter_text
    }))), aw_options.map(function (item) {
      item_count += 1;
      return h("a", {
        href: "",
        class: item_count == self.state.top_index ? "dropdown-item is-active" : "dropdown-item",
        id: item_count == self.state.top_index ? self.state.selected_id : null,
        onClick: self.menuItemClicked,
        "data-value": item[0]
      }, item[1]);
    }))), this.props.footnote ? h("div", {
      class: "help"
    }, this.props.footnote) : ''));
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


class CSearchDyncmicSelectColumn extends CTableColumn {
  constructor() {
    super();
    this.editorChanged = this.editorChanged.bind(this);
    this.searchChanged = this.searchChanged.bind(this);
    this.state = {
      options: []
    };
    this.ref = createRef();
  }

  componentDidMount() {
    this.props.table.load_options(this.props.endpoint, this.props.params, this, this.ref);
  }

  searchChanged(value) {
    this.props.table.change_filter_for_column(this.props.column, value);
  }

  editorChanged(value) {
    this.props.table.notify_changes(this.props.row, this.props.column, value);
  }

  render_cell() {
    var self = this;
    var cvalues = this.state.options.filter(function (item) {
      return item[0] == self.value();
    });

    if (cvalues.length > 0) {
      return h("span", null, cvalues[0][1]);
    }

    return h("span", null);
  }

  render_search() {
    if (typeof this.props.filtering === 'undefined') {// do nothing
    } else {
      return h(SearchableSelect, {
        valueChanged: this.searchChanged,
        options: this.state.options,
        value: this.props.filtering
      });
    }
  }

  render_editor() {
    return h(SearchableSelect, {
      ref: this.ref,
      valueChanged: this.editorChanged,
      options: this.state.options,
      value: this.value(),
      footnote: this.props.footnote,
      title: this.title()
    });
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
    this.filterChanged = this.filterChanged.bind(this);
    this.editorChanged = this.editorChanged.bind(this);
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
    var self = this;
    var cvalues = this.state.options.filter(function (item) {
      return item[0] == self.value();
    });

    if (cvalues.length > 0) {
      return h("span", null, cvalues[0][1]);
    }

    return h("span", null);
  }

  filterChanged(e) {
    if (e.target.value == '') {
      this.props.table.change_filter_for_column(this.props.column, null);
    } else {
      this.props.table.change_filter_for_column(this.props.column, e.target.value);
    }
  }

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
      }, this.props.table.props.lang.no_filter), this.state.options.map(function (item) {
        return h("option", {
          value: item[0]
        }, item[1]);
      })));
    }
  }

  editorChanged(e) {
    if (e.target.value == '') {
      this.props.table.notify_changes(this.props.row, this.props.column, null);
    } else {
      this.props.table.notify_changes(this.props.row, this.props.column, e.target.value);
    }
  }

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
    }, this.state.options.map(function (item) {
      return h("option", {
        value: item[0]
      }, item[1]);
    })))), this.props.footnote ? h("div", {
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
    this.openSubtableClicked = this.openSubtableClicked.bind(this);
  }

  openSubtableClicked(e) {
    this.props.table.open_subtable(this.props.row, this.props.keys, this.props.config);
  }

  render_header() {
    return h("b", null, this.title());
  }

  render_cell() {
    return h("div", {
      class: "field has-addons"
    }, h("div", {
      class: "control"
    }, h("button", {
      class: this.props.table.state.opened_subtables.includes(this.props.row) ? "button is-info is-inverted" : "button is-info",
      title: typeof this.props.button_hint === 'undefined' ? this.props.table.props.lang.open_subtable : this.props.button_hint,
      onClick: this.openSubtableClicked
    }, h("span", {
      class: "icon"
    }, h("span", {
      class: "material-icons"
    }, "menu_open")))));
  }

}
/**
 * Tags column.
 *
 * This column for tags multiselect. Value will be comma-separated set of tags or empty string.
 *
 * @arg {List[]} this.props.options - Tag list.
 * @arg {string} this.props.options[].0 - Tag key.
 * @arg {string} this.props.options[].1 - Tag text.
 * @arg {string} this.props.endpoint - Endpoint for loading options.
 * @arg {Object} this.props.params - Additional parameters to select query
 */
class CTagColumn extends CTableColumn {
  constructor() {
    super();
    this.filterChanged = this.filterChanged.bind(this);
    this.addClicked = this.addClicked.bind(this);
    this.deleteClicked = this.deleteClicked.bind(this);
    this.showTagPanel = this.showTagPanel.bind(this);
    this.hideTagPanel = this.hideTagPanel.bind(this);
    this.state = {
      options: [],
      values: [],
      editor_panel_opened: false
    };
    this.ref = createRef();
  }

  componentDidMount() {
    this.setState({
      values: this.value() === null ? [] : this.value().split(","),
      editor_panel_opened: false
    });

    if (typeof this.props.endpoint === 'undefined') {
      this.setState({
        options: this.props.options
      });
    } else {
      this.props.table.load_options(this.props.endpoint, this.props.params, this, this.ref);
    }
  }

  showTagPanel(e) {
    if (e.target.classList.contains("delete")) return;
    this.setState({
      editor_panel_opened: true
    });
  }

  hideTagPanel() {
    this.setState({
      editor_panel_opened: false
    });
  }

  render_cell() {
    var self = this;
    var cvl = this.value() === null ? [] : this.value().split(",");
    var cvalues = this.state.options.filter(function (item) {
      return cvl.indexOf(item[0]) != -1;
    });
    return h("div", {
      class: "tags"
    }, cvalues.map(function (c, i) {
      return h("span", {
        class: "tag is-medium"
      }, c[1]);
    }));
  }

  filterChanged(e) {
    if (e.target.value == '') {
      this.props.table.change_search_for_column(this.props.column, null);
    } else {
      this.props.table.change_search_for_column(this.props.column, e.target.value);
    }
  }

  render_search() {
    if (typeof this.props.searching === 'undefined') {// do nothing
    } else {
      return h("div", {
        class: "select"
      }, h("select", {
        onChange: this.filterChanged,
        value: this.props.searching
      }, h("option", {
        value: ""
      }, this.props.table.props.lang.no_filter), this.state.options.map(function (item) {
        return h("option", {
          value: item[0]
        }, item[1]);
      })));
    }
  }

  deleteClicked(e) {
    var tag = e.target.dataset.tagname;
    var del_filtred = this.state.values.filter(function (item) {
      return item != tag;
    });
    this.setState({
      values: del_filtred
    });
    this.props.table.notify_changes(this.props.row, this.props.column, del_filtred === [] ? null : del_filtred.join(','));
  }

  addClicked(e) {
    e.preventDefault();

    if (!this.state.values.includes(e.target.dataset.tagname)) {
      var add_filtred = this.state.values.concat(e.target.dataset.tagname);
      this.setState({
        values: add_filtred
      });
      this.props.table.notify_changes(this.props.row, this.props.column, add_filtred === [] ? null : add_filtred.join(','));
    }
  }

  render_editor() {
    var self = this;
    var alltag = h("div", {
      class: "tags",
      style: "margin-left: 1em; margin-right: 1em;"
    }, this.state.options.map(function (c, i) {
      return h("span", {
        class: "tag button",
        "data-tagname": c[0],
        onMouseDown: self.addClicked
      }, c[1]);
    }));
    var cvalues = this.state.options.filter(function (item) {
      return self.state.values.indexOf(item[0]) != -1;
    });
    var taglist = h("div", {
      class: "tags",
      style: "margin-right: 2em;"
    }, cvalues.map(function (c, i) {
      return h("span", {
        class: "tag"
      }, c[1], h("button", {
        class: "delete is-small",
        "data-tagname": c[0],
        onClick: self.deleteClicked
      }));
    }));
    return h("div", {
      class: "field",
      ref: this.ref
    }, h("label", {
      class: "label"
    }, this.title()), h("div", {
      class: "control"
    }, h("div", {
      class: this.state.editor_panel_opened ? "dropdown is-active" : "dropdown",
      style: "width: 100%;"
    }, h("div", {
      class: "dropdown-trigger",
      style: "width: 100%;"
    }, h("button", {
      class: "input select",
      onClick: this.showTagPanel,
      onBlur: this.hideTagPanel
    }, taglist)), h("div", {
      class: "dropdown-menu",
      id: "dropdown-menu",
      role: "menu"
    }, h("div", {
      class: "dropdown-content"
    }, alltag)))), this.props.footnote ? h("div", {
      class: "help"
    }, this.props.footnote) : '');
  }

}
/**
 * Text edit class.
 *
 * This column for text editing.
 *
 * @arg this.props.textarea {undefined|Boolean} Switch editor to textarea.
 * @arg this.props.richtext {undefined|Boolean} Switch editor to rich text editor with HTML content.
 * @arg this.props.placeholder {string} Placeholder for column editor.
 * @arg this.props.validate {undefined|string} Input validation regex.
 * @arg this.props.input_hints {string[]} Input hints list.
 * @arg this.props.input_hints.0 {string} Hints text added to input.
 * @arg this.props.input_hints.1 {string} Hints button text.
 */
class CTextColumn extends CTableColumn {
  constructor() {
    super();
    this.editorChanged = this.editorChanged.bind(this);
    this.hintClicked = this.hintClicked.bind(this);
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

  editorChanged(e) {
    var ed_value = null;

    if (e.target.tagName == 'DIV') {
      ed_value = e.target.innerHTML;
    } else {
      ed_value = e.target.value;
    }

    this.setState({
      value: ed_value
    });
    this.props.table.notify_changes(this.props.row, this.props.column, ed_value);

    if (this.props.validate) {
      if (ed_value.match(this.props.validate)) {
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
  }

  hintClicked(e) {
    var result = this.state.value !== null ? this.state.value + e.target.dataset.hintvalue : e.target.dataset.hintvalue;
    this.setState({
      value: result
    });
    this.props.table.notify_changes(this.props.row, this.props.column, result);
  }

  execRoleCommand(e) {
    var role = e.target.dataset.role ?? e.target.parentElement.dataset.role;
    document.execCommand(role, false, null);
  }

  render_editor() {
    var form_control = null;
    var self = this;

    if (this.props.textarea == true) {
      form_control = h("textarea", {
        class: !this.state.editor_valid ? "textarea is-danger" : "textarea",
        onChange: this.editorChanged,
        placeholder: this.props.placeholder
      }, this.state.value);
    }

    if (this.props.richtext == true) {
      form_control = h(Fragment, null, h("div", {
        style: "text-align:center; padding:5px;"
      }, h("span", {
        class: "is-grouped"
      }, h("a", {
        class: "button",
        "data-role": "undo",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "undo")), h("a", {
        class: "button",
        "data-role": "redo",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "redo"))), h("span", {
        class: "is-grouped"
      }, h("a", {
        class: "button",
        "data-role": "bold",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_bold")), h("a", {
        class: "button",
        "data-role": "italic",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_italic")), h("a", {
        class: "button",
        "data-role": "underline",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_underlined")), h("a", {
        class: "button",
        "data-role": "strikeThrough",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_strikethrough"))), h("span", {
        class: "is-grouped"
      }, h("a", {
        class: "button",
        "data-role": "justifyLeft",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_align_left")), h("a", {
        class: "button",
        "data-role": "justifyCenter",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_align_center")), h("a", {
        class: "button",
        "data-role": "justifyRight",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_align_right")), h("a", {
        class: "button",
        "data-role": "justifyFull",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_align_justify"))), h("span", {
        class: "is-grouped"
      }, h("a", {
        class: "button",
        "data-role": "indent",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_indent_increase")), h("a", {
        class: "button",
        "data-role": "outdent",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_indent_decrease"))), h("span", {
        class: "is-grouped"
      }, h("a", {
        class: "button",
        "data-role": "insertUnorderedList",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_list_bulleted")), h("a", {
        class: "button",
        "data-role": "insertOrderedList",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "format_list_numbered"))), h("span", {
        class: "is-grouped"
      }, h("a", {
        class: "button",
        "data-role": "subscript",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "subscript")), h("a", {
        class: "button",
        "data-role": "superscript",
        onClick: this.execRoleCommand
      }, h("span", {
        class: "material-icons"
      }, "superscript")))), h("div", {
        class: !this.state.editor_valid ? "textarea is-danger ctable-wysiwyg-editor" : "textarea ctable-wysiwyg-editor",
        onfocusout: this.editorChanged,
        dangerouslySetInnerHTML: {
          __html: this.state.value
        },
        contenteditable: true
      }));
    }

    if (form_control === null) {
      form_control = h("input", {
        class: !this.state.editor_valid ? "input is-danger" : "input",
        type: "text",
        value: this.state.value,
        onChange: this.editorChanged,
        placeholder: this.props.placeholder
      });
    }

    return h("div", {
      class: "field",
      ref: this.ref
    }, h("label", {
      class: "label"
    }, this.title()), h("div", {
      class: "control"
    }, form_control), this.props.input_hints ? h("div", {
      class: "tags",
      style: "margin-top: 0.2em;"
    }, this.props.input_hints.map(function (c, i) {
      return h("span", {
        class: "tag button",
        "data-hintvalue": c[0],
        onClick: self.hintClicked
      }, c[1]);
    })) : '', this.props.footnote ? h("div", {
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
    this.filterChanged = this.filterChanged.bind(this);
    this.editorCleared = this.editorCleared.bind(this);
    this.editorChanged = this.editorChanged.bind(this);
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
        disabled: true
      }, h("span", {
        class: "material-icons"
      }, "attach_file"), " ", this.props.table.props.lang.no_file);
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
        class: "material-icons"
      }, "attach_file"), fileinfo.filelabel[0]));
    } else {
      return h("a", {
        class: "button is-info is-outlined",
        disabled: true
      }, h("span", {
        class: "material-icons"
      }, "attach_file"), " ", this.props.table.props.lang.multiple_files, " ", fileinfo.count);
    }
  }

  filterChanged(e) {
    if (e.target.value == '') {
      this.props.table.change_filter_for_column(this.props.column, null);
    } else {
      this.props.table.change_filter_for_column(this.props.column, e.target.value);
    }
  }

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
        value: "%nodata"
      }, this.props.table.props.lang.file_filter_no), h("option", {
        value: "%notempty"
      }, this.props.table.props.lang.file_filter_yes)));
    }
  }

  editorCleared(e) {
    this.setState({
      fileinfo: this.value_parser('')
    });
    this.props.table.notify_changes(this.props.row, this.props.column, '');
  }

  editorChanged(e) {
    var form_data = new FormData();

    if (e.target.files.length > 1 && !this.props.multiple) {
      alert(this.props.table.props.lang.file_only_one);
      return;
    }

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
    this.props.table.setState({
      waiting_active: true
    });
    fetch(this.props.upload_endpoint, {
      method: 'POST',
      body: form_data
    }).then(function (response) {
      self.props.table.setState({
        waiting_active: false
      }); // always disable table waiting

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
  }

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
        disabled: true
      }, h("span", {
        class: "material-icons"
      }, "attach_file"), " ", this.props.table.props.lang.no_file)), h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info is-danger",
        disabled: true
      }, h("span", {
        class: "material-icons"
      }, "delete"))), h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info"
      }, h("span", {
        class: "material-icons"
      }, "upload")), h("input", {
        class: "file-input",
        type: "file",
        name: "file",
        multiple: this.props.multiple ? "true" : "false",
        onChange: this.editorChanged
      }))), this.props.footnote ? h("div", {
        class: "help"
      }, this.props.footnote) : '');
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
        class: "material-icons"
      }, "attach_file"), " ", this.state.fileinfo.filelabel[0]))), h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info is-danger",
        onClick: this.editorCleared
      }, h("span", {
        class: "material-icons"
      }, "delete"))), h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info"
      }, h("span", {
        class: "material-icons"
      }, "upload")), h("input", {
        class: "file-input",
        type: "file",
        name: "file",
        multiple: this.props.multiple ? "true" : "false",
        onChange: this.editorChanged
      }))), this.props.footnote ? h("div", {
        class: "help"
      }, this.props.footnote) : '');
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
      }, h("span", {
        class: "material-icons"
      }, "cancel"))), h("div", {
        class: "control"
      }, h("button", {
        class: "button is-info"
      }, "\u21A5"), h("input", {
        class: "file-input",
        type: "file",
        name: "file",
        multiple: this.props.multiple ? "true" : "false",
        onChange: this.editorChanged
      }))), this.props.footnote ? h("div", {
        class: "help"
      }, this.props.footnote) : '');
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
 * @arg {String[]} this.props.tabs - Tabs names.
 * @arg {Object} this.props.filters - Set presistent filter as column => value.
 * @arg {Object[]} this.props.columns -  List of columns. Each column will be passed as props to column object.
 * @arg {string} this.props.columns[].name - Name of column.
 * @arg {string} this.props.columns[].title - Title of column.
 * @arg {Class} this.props.columns[].kind - Column class derived from CTableColumn.
 * @arg {string} this.props.columns[].footnote - Footnote for column editor.
 */
class CTable extends Component {
  constructor() {
    super();
    this.recordsOnPageChanged = this.recordsOnPageChanged.bind(this);
    this.toFirstPage = this.toFirstPage.bind(this);
    this.toLastPage = this.toLastPage.bind(this);
    this.toNextPage = this.toNextPage.bind(this);
    this.toPrevPage = this.toPrevPage.bind(this);
    this.toPage = this.toPage.bind(this);
    this.toTab = this.toTab.bind(this);
    this.state = {
      records: [],
      columns: [],
      endpoint: '',
      opened_editors: [],
      opened_subtables: [],
      current_page: 0,
      records_on_page: 25,
      total_records: 0,
      total_pages: 0,
      current_tab: 0,
      waiting_active: false
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
      this.state.opened_subtables = this.state.opened_subtables.filter(function (item) {
        return item !== row;
      });
    } else {
      this.state.opened_subtables.push(row);
      this.subtables_params[row] = clone(config);
      self = this;
      this.subtables_params[row].filters = keys.map(function (item) {
        return [item[0], self.state.records[row][item[1]]];
      });
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
      this.state.opened_editors = this.state.opened_editors.filter(function (item) {
        return item !== row;
      });
      this.changes = this.changes.filter(function (item) {
        return !(item[0] == row);
      });
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
    this.setState({
      waiting_active: true
    });
    var fd = new FormData();
    fd.append('delete', JSON.stringify(xkeys));
    fetch(this.props.endpoint, {
      method: "POST",
      body: fd
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        alert(self.props.lang.server_error + response.status);
        self.setState({
          waiting_active: false
        });
      }
    }).then(function (result) {
      if (!result) return;

      if (result.Result == 'OK') {
        self.options_cache = {};
        self.state.opened_editors = self.state.opened_editors.filter(function (item) {
          return item !== row;
        });
        self.reload();
      } else {
        alert(self.props.lang.error + result.Message);
        self.setState({
          waiting_active: false
        });
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
    if (this.valids.filter(function (item) {
      return item[0] == row;
    }).filter(function (item) {
      return item[2] == false;
    }).length > 0) return;
    if (this.changes.length == 0) return;
    var xvalues = {};
    var self = this;
    var cmd = 'update';

    if (row >= 0) {
      this.state.columns.map(function (item, i) {
        if (item.is_key == true) {
          xvalues[item.name] = self.state.records[row][item.name];
        }
      });
      this.changes.filter(function (item) {
        return item[0] == row;
      }).map(function (item) {
        if (self.state.columns[item[1]].name != '') {
          xvalues[self.state.columns[item[1]].name] = item[2];
        }
      });
    } else {
      cmd = 'insert';
      this.changes.filter(function (item) {
        return item[0] == row;
      }).map(function (item) {
        if (self.state.columns[item[1]].name != '') {
          //                if ((!self.state.columns[item[1]].is_key) && (self.state.columns[item[1]].name != '')){
          xvalues[self.state.columns[item[1]].name] = item[2];
        }
      });
    }

    if (typeof this.props.filters !== 'undefined') {
      this.props.filters.forEach(function (item) {
        xvalues[item[0]] = item[1];
      });
    }

    this.setState({
      waiting_active: true
    });
    var fd = new FormData();
    fd.append(cmd, JSON.stringify(xvalues));
    fetch(this.props.endpoint, {
      method: "POST",
      body: fd
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        alert(self.props.lang.server_error + response.status);
        self.setState({
          waiting_active: false
        });
      }
    }).then(function (result) {
      if (!result) return;

      if (result.Result == 'OK') {
        self.options_cache = {};
        self.state.opened_editors = self.state.opened_editors.filter(function (item) {
          return item !== row;
        });
        self.reload();
      } else {
        alert(self.props.lang.error + result.Message);
        self.setState({
          waiting_active: false
        });
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
    this.state.current_page = 0;
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
    this.state.current_page = 0;
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
   * @param value {Any|null} Value. Set null - reset changes.
   */


  notify_changes(row, col, value) {
    this.changes = this.changes.filter(function (item) {
      return !(item[0] == row && item[1] == col);
    });
    this.changes_handlers = this.changes_handlers.filter(function (item) {
      return item[2].current != null;
    });
    this.changes_handlers.filter(function (item) {
      return item[0] == row && item[1] == col;
    }).map(function (item) {
      item[3].on_changes(row, col, value);
    });
    if (value !== null) this.changes.push([row, col, value]);
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
    this.valids = this.valids.filter(function (item) {
      return !(item[0] == row && item[1] == col);
    });
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
      this.props.filters.forEach(function (item) {
        column_filters[item[0]] = item[1];
      });
    }

    this.state.columns.forEach(function (item) {
      if (item.name != '' && typeof item.filtering != 'undefined' && item.filtering !== null) column_filters[item.name] = item.filtering;
    });
    this.state.columns.forEach(function (item) {
      if (item.name != '' && typeof item.searching != 'undefined' && item.searching !== null) column_searches[item.name] = item.searching;
    });
    this.state.columns.forEach(function (item) {
      if (item.name != '' && typeof item.sorting != 'undefined' && item.sorting !== null) column_orders[item.name] = item.sorting;
    });
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
    this.setState({
      waiting_active: true
    });
    fetch(this.props.endpoint + '?' + query_params.toString()).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        alert(self.props.lang.server_error + response.status);
        self.setState({
          waiting_active: false
        });
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
          waiting_active: false,
          total_pages: Math.floor(result.TotalRecordCount / self.state.records_on_page) - (result.TotalRecordCount % self.state.records_on_page == 0 ? 1 : 0)
        });
      } else {
        alert(self.props.lang.error + result.Message);
        self.setState({
          waiting_active: false
        });
      }
    });
  }
  /**
   * Getting row with unsaved changes.
   *
   * @param row {int} Row index. -1 in new row.
   * @param only_changes {Boolean} Getting only changes or full row with changes.
   *
   * @return {Object} Unsaved values.
   */


  row_changes_summary(row, only_changes = false) {
    var xvalues = {};
    var self = this;

    if (row >= 0) {
      if (!only_changes) {
        xvalues = this.state.records[row];
      }
    }

    this.changes.filter(function (item) {
      return item[0] == row;
    }).map(function (item) {
      if (self.state.columns[item[1]].name != '') {
        xvalues[self.state.columns[item[1]].name] = item[2];
      }
    });
    return xvalues;
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
        }, 100);
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
          self.setState({
            waiting_active: false
          });
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
          self.setState({
            waiting_active: false
          });
        }
      });
    }
  }

  recordsOnPageChanged(e) {
    var new_rec_on_page = parseInt(e.target.value);
    if (new_rec_on_page == this.state.records_on_page) return;
    this.state.records_on_page = new_rec_on_page;
    this.state.current_page = 0;
    this.reload();
  }

  toFirstPage(e) {
    if (this.state.current_page != 0) {
      this.state.current_page = 0;
      this.reload();
    }
  }

  toLastPage(e) {
    if (this.state.current_page != this.state.total_pages) {
      this.state.current_page = this.state.total_pages;
      this.reload();
    }
  }

  toNextPage(e) {
    if (this.state.current_page < this.state.total_pages) {
      this.state.current_page = this.state.current_page + 1;
      this.reload();
    }
  }

  toPrevPage(e) {
    if (this.state.current_page - 1 >= 0) {
      this.state.current_page = this.state.current_page - 1;
      this.reload();
    }
  }

  toPage(e) {
    this.state.current_page = parseInt(e.target.value);
    this.reload();
  }

  toTab(e) {
    this.setState({
      current_tab: e.target.dataset.tabindex
    });
  }

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
    return this.state.columns.filter(function (item) {
      return item.hide_column != true;
    }).length;
  }

  render() {
    var self = this;
    var tbody = h("tbody", null, self.state.opened_editors.includes(-1) ? h("tr", null, h("td", {
      colspan: self.visible_column_count()
    }, h("div", {
      class: "panel",
      style: "padding: 0.5em"
    }, typeof self.props.tabs !== 'undefined' ? h("div", {
      class: "panel-tabs"
    }, " ", self.props.tabs.map(function (tab, k) {
      return h("a", {
        class: self.state.current_tab == k ? "" : "is-active",
        "data-tabindex": k,
        onClick: self.toTab
      }, tab);
    }), " ") : '', typeof self.props.tabs !== 'undefined' ? h(Fragment, null, self.props.tabs.map(function (tab, k) {
      return h("div", {
        class: self.state.current_tab == k ? "" : "is-hidden"
      }, self.state.columns.map(function (column, j) {
        return h(Fragment, null, column.hide_editor != true && column.tab == k ? h(column.kind, {
          role: "editor",
          is_new: true,
          table: self,
          column: j,
          row: -1,
          key: j * 1000000,
          ...column
        }) : '');
      }));
    }), self.state.columns.map(function (column, j) {
      return h(Fragment, null, column.hide_editor != true && column.tab == -1 ? h(column.kind, {
        role: "editor",
        is_new: true,
        table: self,
        column: j,
        row: -1,
        key: j * 1000000,
        ...column
      }) : '');
    })) : self.state.columns.map(function (column, j) {
      return h(Fragment, null, column.hide_editor != true ? h(column.kind, {
        role: "editor",
        is_new: true,
        table: self,
        column: j,
        row: -1,
        key: j * 1000000,
        ...column
      }) : '');
    })))) : '', self.state.records.map(function (cell, i) {
      return h(Fragment, null, " ", h("tr", {
        class: self.state.opened_editors.includes(i) || self.state.opened_subtables.includes(i) ? "is-selected" : ""
      }, " ", self.state.columns.map(function (column, j) {
        return column.hide_column != true ? h("td", null, "                           ", h(column.kind, {
          role: "cell",
          table: self,
          column: j,
          row: i,
          key: j * 1000000 + i,
          ...column
        })) : '';
      }), " "), self.state.opened_editors.includes(i) ? h("tr", null, h("td", {
        colspan: self.visible_column_count()
      }, h("div", {
        class: "panel",
        style: "padding: 0.5em"
      }, typeof self.props.tabs !== 'undefined' ? h("div", {
        class: "panel-tabs"
      }, " ", self.props.tabs.map(function (tab, k) {
        return h("a", {
          class: self.state.current_tab == k ? "" : "is-active",
          "data-tabindex": k,
          onClick: self.toTab
        }, tab);
      }), " ") : '', typeof self.props.tabs !== 'undefined' ? h(Fragment, null, self.props.tabs.map(function (tab, k) {
        return h("div", {
          class: self.state.current_tab == k ? "" : "is-hidden"
        }, self.state.columns.map(function (column, j) {
          return h(Fragment, null, column.hide_editor != true && column.tab == k ? h(column.kind, {
            role: "editor",
            is_new: false,
            table: self,
            column: j,
            row: i,
            key: j * 1000000 + i,
            ...column
          }) : '');
        }));
      }), self.state.columns.map(function (column, j) {
        return h(Fragment, null, column.hide_editor != true && column.tab == -1 ? h(column.kind, {
          role: "editor",
          is_new: false,
          table: self,
          column: j,
          row: i,
          key: j * 1000000 + i,
          ...column
        }) : '');
      })) : self.state.columns.map(function (column, j) {
        return h(Fragment, null, column.hide_editor != true ? h(column.kind, {
          role: "editor",
          is_new: false,
          table: self,
          column: j,
          row: i,
          key: j * 1000000 + i,
          ...column
        }) : '');
      })))) : '', self.state.opened_subtables.includes(i) ? h("tr", null, h("td", {
        colspan: self.visible_column_count()
      }, h(CTable, {
        lang: self.props.lang,
        ...self.subtables_params[i]
      }))) : '');
    }), self.state.records.length == 0 ? h("tr", null, h("td", {
      colspan: self.visible_column_count()
    }, h("div", {
      class: "has-text-centered"
    }, this.state.waiting_active ? self.props.lang.loading : self.props.lang.no_data))) : '');
    var current_page_block = h("div", {
      class: "button"
    }, " ", this.props.lang.current_page, " ", this.state.current_page + 1, " ", this.props.lang.from, " ", this.state.total_pages + 1, ".");

    if (this.state.total_pages < 0) {
      var current_page_block = h("div", {
        class: "button"
      }, " ", this.props.lang.no_pages, ".");
    }

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
    }, this.get_pages().map(function (page) {
      return h("option", {
        value: page
      }, page + 1);
    })))), h("div", {
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
    }, "100"), h("option", {
      value: "50000"
    }, this.props.lang.all)))), h("div", {
      class: "control"
    }, current_page_block));
    return h("div", {
      class: "table-container ctable-table-container"
    }, h("div", {
      class: this.state.waiting_active ? "ctable-loader-wrapper-active" : "ctable-loader-wrapper"
    }, h("div", {
      class: "button is-large is-loading is-info"
    })), h("table", {
      class: "table",
      style: "width: 100%;"
    }, h("thead", null, h("tr", null, this.state.columns.map(function (column, i) {
      return column.hide_column != true ? h("th", null, h(column.kind, {
        role: "header",
        table: self,
        column: i,
        key: i,
        ...column
      }), " ") : '';
    })), h("tr", null, this.state.columns.map(function (column, i) {
      return column.hide_column != true ? h("th", null, h(column.kind, {
        role: "search",
        table: self,
        column: i,
        key: i,
        ...column
      }), " ") : '';
    }))), h("tfoot", null, h("tr", null, this.state.columns.map(function (column, i) {
      return column.hide_column != true ? h("th", null, h(column.kind, {
        role: "footer",
        table: self,
        column: i,
        key: i,
        ...column
      }), " ") : '';
    }))), tbody), this.props.no_pagination ? '' : pager);
  }

}
