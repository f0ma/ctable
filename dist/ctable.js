var {
  Component,
  h,
  render,
  Fragment,
  createRef
} = window.preact;
function makeID() {
  let ID = "";
  let characters = _("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
  for (var i = 0; i < 12; i++) {
    ID += characters.charAt(Math.floor(Math.random() * 36));
  }
  return ID;
}

//Quick multilanguage support

function _(s) {
  if (navigator.language == "ru-RU") {
    if (s in ctable_lang_ru && ctable_lang_ru[s] !== "") return ctable_lang_ru[s];else return s;
  } else return s;
}

// This functions adopted from Just Clone library
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
}

// End of adopted code

function cls(...x) {
  return x.join(' ');
}
function sty(...x) {
  var stychunks = [];
  for (var i = 0; i < x.length; i += 2) {
    stychunks.push(x[i] + ":" + x[i + 1] + ";");
  }
  return stychunks.join(' ');
}
function unwind_button(e) {
  var tg = e.target;
  if (tg.tagName != "BUTTON") {
    tg = tg.parentElement;
  }
  return tg;
}
function unwind_tr(e) {
  var tg = e.target;
  if (tg.tagName != "TR") {
    tg = tg.parentElement;
  }
  return tg;
}
class CPlainTextCell extends Component {
  render() {
    return h(Fragment, null, this.props.value === null ? h("span", {
      class: "has-text-grey"
    }, "NULL") : String(this.props.value));
  }
}
class CSelectCell extends Component {
  render() {
    var labels = this.props.column.options.filter(x => x.value == this.props.value).map(x => x.label);
    return h(Fragment, null, this.props.value === null ? h("span", {
      class: "has-text-grey"
    }, "NULL") : labels.length == 0 ? h("span", {
      class: "has-text-grey"
    }, this.props.value) : String(labels[0]));
  }
}
/**
 * Table head class.
 *
 * This class render header table. This is stateless class.
 *
 * @arg this.props.width {int} Link to CTable state width
 * @arg this.props.fontSize {int} Link to CTable state fontSize
 * @arg this.props.columns {Array} Link to CTable state table_columns
 * @arg this.props.onHeaderXScroll {function} Link to CTable action handler
 *
 */

class CHeaderTable extends Component {
  render() {
    var self = this;
    return h("div", {
      class: "ctable-scroll-head-table pl-3 pr-3",
      onScroll: self.props.onHeaderXScroll
    }, self.props.progress ? h("progress", {
      class: "progress is-small is-primary ctable-progress",
      max: "100",
      style: sty("width", self.props.width + "em")
    }) : h("progress", {
      class: "progress is-small is-primary ctable-progress",
      max: "100",
      value: "0",
      style: sty("width", self.props.width + "em")
    }), h("table", {
      class: "ctable-head-table",
      style: sty("width", self.props.width + "em", "font-size", self.props.fontSize + "%")
    }, h("colgroup", null, self.props.columns.filter(x => x.enabled).map(x => h("col", {
      span: "1",
      style: sty("width", x.width + "em")
    }))), h("thead", null, h("tr", null, self.props.columns.filter(x => x.enabled).map(x => h("th", null, x.label))))));
  }
}
/**
 * Table class.
 *
 * This class render main table. This is stateless class.
 *
 * @arg this.props.width {int} Link to CTable state width
 * @arg this.props.fontSize {int} Link to CTable state fontSize
 * @arg this.props.columns {Array} Link to CTable state table_columns
 * @arg this.props.row_status {Array} Link to CTable state table_row_status
 * @arg this.props.rows {Array} Link to CTable state table_rows
 * @arg this.props.onRowClick {function} Link to CTable action handler
 * @arg this.props.onTableXScroll {function} Link to CTable action handler
 *
 */

class CPageTable extends Component {
  render() {
    var self = this;
    return h("section", {
      class: "section  pt-0 pl-0 pr-0 pb-0"
    }, h("div", {
      class: "ctable-scroll-main-table pl-3 pr-3",
      style: sty("max-width", self.props.width + 2 + "em", self.props.editorShow ? "max-height" : "", self.props.editorShow ? "12em" : ""),
      onScroll: self.props.onTableXScroll
    }, h("table", {
      class: "ctable-main-table",
      style: sty("width", self.props.width + "em", "font-size", self.props.fontSize + "%")
    }, h("colgroup", null, self.props.columns.filter(x => x.enabled).map(x => h("col", {
      span: "1",
      style: sty("width", x.width + "em")
    }))), h("tbody", null, self.props.rows.map((r, i) => h("tr", {
      "data-rowindex": i,
      class: cls(self.props.row_status[i].selected ? "ctable-selected-row" : "")
    }, self.props.columns.filter(c => c.enabled).map(c => {
      if (c.cell_actor == "CPlainTextCell") return h("td", {
        onClick: self.props.onRowClick
      }, h(CPlainTextCell, {
        column: c,
        value: r[c.name],
        row: r
      }));
      if (c.cell_actor == "CSelectCell") return h("td", {
        onClick: self.props.onRowClick
      }, h(CSelectCell, {
        column: c,
        value: r[c.name],
        row: r
      }));
    })))))));
  }
}
/**
 * Select editor class.
 *
 * @arg this.props.column {Object} Table column.
 * @arg this.props.column.name {string} Column name
 * @arg this.props.column.editor_default {*} Editor default value
 * @arg this.props.column.options {Object[]} List of options {name:, value:}
 *
 * @arg this.props.row {Object} Row to edit, null if add, first if batch.
 * @arg this.props.add {bool} Is adding.
 * @arg this.props.batch {bool} Is batch editing.
 * @arg this.props.onEditorChanges {CTable#OnEditorChanges} Editor changes callback.
 *
 */

class CSelectEditor extends Component {
  constructor() {
    super();
    this.onInputChange = this.onInputChange.bind(this);
    this.onResetClicked = this.onResetClicked.bind(this);
    this.onNullClicked = this.onNullClicked.bind(this);
    this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
    this.onUndoClicked = this.onUndoClicked.bind(this);
    this.validateAndSend = this.validateAndSend.bind(this);
  }
  componentDidMount() {
    this.setState({
      editor_value: this.props.add || this.props.batch ? this.props.column.editor_default : this.props.row[this.props.column.name],
      editor_modified: false,
      editor_valid: false
    }, () => {
      this.validateAndSend();
    });
  }
  onInputChange(e) {
    this.setState({
      editor_value: e.target.value,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }
  validateAndSend() {
    var is_valid = true;
    if (this.props.column.options.filter(x => x.value == this.state.editor_value).length == 0) {
      is_valid = false;
      if (this.state.editor_value === null && this.props.column.editor_allow_null) {
        is_valid = true;
      }
    }
    this.setState({
      editor_valid: is_valid
    }, () => {
      this.props.onEditorChanges(this.props.column.name, this.state.editor_modified, this.state.editor_value, true);
    });
  }

  /**
   * Request to set value to NULL.
   *
   * @method
   * @listens CEditorFrame#cteditortonull
   */

  onResetClicked() {
    this.setState({
      editor_value: this.props.column.editor_default,
      editor_modified: false
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to Default
   *
   * @method
   * @listens CEditorFrame#cteditorreset
   */

  onNullClicked() {
    this.setState({
      editor_value: null,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to value at start editing.
   *
   * @method
   * @listens CEditorFrame#cteditorundo
   */

  onUndoClicked() {
    this.setState({
      editor_value: this.props.add ? this.props.column.editor_default : this.props.row[this.props.column.name],
      editor_modified: false
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Notifiaction for changes in some editor.
   *
   * @method
   * @listens CTable#cteditorchanged
   */

  onOtherEditorChanged(e) {
    if (e.detail.initiator == this.props.column.name) return;
  }
  render() {
    var self = this;
    return h("div", {
      class: cls("control", self.state.editor_value === null ? "has-icons-left" : ""),
      oncteditortonull: self.onNullClicked,
      oncteditorreset: self.onResetClicked,
      oncteditorundo: self.onUndoClicked,
      oncteditorchanged: self.onOtherEditorChanged
    }, h("div", {
      class: cls("select", self.state.editor_valid ? "" : "is-danger")
    }, h("select", {
      onChange: this.onInputChange,
      value: self.state.editor_value
    }, self.props.column.options.map(item => {
      return h("option", {
        value: item.value
      }, item.label);
    }), self.state.editor_value === null ? h("option", {
      value: self.state.editor_value,
      selected: true
    }, "NULL") : "")), self.state.editor_value === null ? h("span", {
      class: "icon is-small is-left"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "hide_source")) : "");
  }
}
/**
 * Line editor class.
 *
 * @arg this.props.column {Object} Table column.
 * @arg this.props.column.name {string} Column name
 * @arg this.props.column.editor_default {*} Editor default value
 * @arg this.props.column.editor_placeholder {string} Editor placeholder
 * @arg this.props.column.editor_validate {string} Validate regex
 *
 * @arg this.props.row {Object} Row to edit, null if add, first if batch.
 * @arg this.props.add {bool} Is adding.
 * @arg this.props.batch {bool} Is batch editing.
 * @arg this.props.onEditorChanges {CTable#OnEditorChanges} Editor changes callback.
 *
 */

class CLineEditor extends Component {
  constructor() {
    super();
    this.onInputChange = this.onInputChange.bind(this);
    this.onResetClicked = this.onResetClicked.bind(this);
    this.onNullClicked = this.onNullClicked.bind(this);
    this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
    this.onUndoClicked = this.onUndoClicked.bind(this);
  }
  componentDidMount() {
    this.setState({
      editor_value: this.props.add || this.props.batch ? this.props.column.editor_default : this.props.row[this.props.column.name],
      editor_modified: false,
      editor_valid: false
    }, () => {
      this.validateAndSend();
    });
  }
  validateAndSend() {
    if (this.props.column.editor_validate) {
      var re = new RegExp(this.props.column.editor_validate);
      if (re.test(this.state.editor_value)) {
        this.setState({
          editor_valid: true
        }, () => {
          this.sendChanges();
        });
      } else {
        this.setState({
          editor_valid: false
        }, () => {
          this.sendChanges();
        });
      }
    } else {
      this.setState({
        editor_valid: true
      }, () => {
        this.sendChanges();
      });
    }
  }
  sendChanges() {
    this.props.onEditorChanges(this.props.column.name, this.state.editor_modified, this.state.editor_value, this.state.editor_valid);
  }
  onInputChange(e) {
    this.setState({
      editor_value: e.target.value,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to NULL.
   *
   * @method
   * @listens CEditorFrame#cteditortonull
   */

  onResetClicked() {
    this.setState({
      editor_value: this.props.column.editor_default,
      editor_modified: false
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to Default
   *
   * @method
   * @listens CEditorFrame#cteditorreset
   */

  onNullClicked() {
    this.setState({
      editor_value: null,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to value at start editing.
   *
   * @method
   * @listens CEditorFrame#cteditorundo
   */

  onUndoClicked() {
    this.setState({
      editor_value: this.props.add ? this.props.column.editor_default : this.props.row[this.props.column.name],
      editor_modified: false
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Notifiaction for changes in some editor.
   *
   * @method
   * @listens CTable#cteditorchanged
   */

  onOtherEditorChanged(e) {
    if (e.detail.initiator == this.props.column.name) return;
  }
  render() {
    var self = this;
    return h("div", {
      class: cls("control", self.state.editor_value === null ? "has-icons-left" : ""),
      oncteditortonull: self.onNullClicked,
      oncteditorreset: self.onResetClicked,
      oncteditorundo: self.onUndoClicked,
      oncteditorchanged: self.onOtherEditorChanged
    }, h("input", {
      class: cls("input", self.state.editor_valid ? "" : "is-danger"),
      type: "text",
      placeholder: self.state.editor_value === null ? "NULL" : self.props.column.editor_placeholder,
      value: self.state.editor_value === null ? "" : self.state.editor_value,
      onInput: self.onInputChange
    }), self.state.editor_value === null ? h("span", {
      class: "icon is-small is-left"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "hide_source")) : "");
  }
}
/**
 * @event CEditorFrame#cteditorreset
 */

/**
 * @event CEditorFrame#cteditortonull
 */

/**
 * @event CEditorFrame#cteditorundo
 */

/**
 * Editor frame class.
 *
 * @arg this.props.column {Object} Table column.
 * @arg this.props.column.name {string} Column name
 * @arg this.props.column.label {string} Column label
 * @arg this.props.column.editor_hint {string} Editor hint
 * @arg this.props.column.editor_allow_null {bool} Allow null
 * @arg this.props.column.editor_default {*} Editor default value
 *
 * @arg this.props.onEditorChanges {function} Editor changes callback.
 * @arg this.props.row {Object} Row to edit, null if add, first if batch.
 * @arg this.props.add {bool} Is adding.
 * @arg this.props.batch {bool} Is batch editing.
 *
 *
 * @fires CEditorFrame#cteditorreset
 * @fires CEditorFrame#cteditortonull
 * @fires CEditorFrame#cteditorundo
 */

class CEditorFrame extends Component {
  constructor() {
    super();
    this.onEnabledChanged = this.onEnabledChanged.bind(this);
    this.onEditorChanges = this.onEditorChanges.bind(this);
    this.onResetClicked = this.onResetClicked.bind(this);
    this.onNullClicked = this.onNullClicked.bind(this);
    this.onUndoClicked = this.onUndoClicked.bind(this);
  }
  componentDidMount() {
    this.setState({
      editor_enabled: this.props.add ? true : false,
      editor_value: null,
      editor_valid: null
    });
  }
  onEnabledChanged(e) {
    this.setState({
      editor_enabled: e.target.checked
    }, () => {
      this.props.onEditorChanges(this.props.column.name, false, this.state.editor_value, this.state.editor_valid);
    });
  }
  onEditorChanges(colname, is_modified, value, valid) {
    this.setState({
      editor_value: value,
      editor_valid: valid
    });
    if (this.state.editor_enabled) {
      this.props.onEditorChanges(colname, true, value, valid);
    } else {
      if (is_modified) {
        this.setState({
          editor_enabled: true
        });
        this.props.onEditorChanges(colname, true, value, valid);
      } else {
        this.props.onEditorChanges(colname, false, value, valid);
      }
    }
  }
  onResetClicked() {
    this.base.querySelector(".ctable-editor-control div").dispatchEvent(new CustomEvent("cteditorreset"));
  }
  onNullClicked() {
    this.base.querySelector(".ctable-editor-control div").dispatchEvent(new CustomEvent("cteditortonull"));
  }
  onUndoClicked() {
    this.base.querySelector(".ctable-editor-control div").dispatchEvent(new CustomEvent("cteditorundo"));
  }
  render() {
    var self = this;
    return h("div", null, h("div", {
      class: "field is-grouped"
    }, h("p", {
      class: "control is-expanded mt-2"
    }, h("label", {
      class: "checkbox label"
    }, " ", this.props.batch ? h("input", {
      type: "checkbox",
      checked: self.state.editor_enabled,
      onChange: self.onEnabledChanged
    }) : "", " ", self.props.column.label, ":")), self.props.column.editor_allow_null ? h("p", {
      class: "control"
    }, h("button", {
      class: "button is-small",
      tabindex: "-1",
      onClick: self.onNullClicked
    }, h("span", {
      class: "material-symbols-outlined"
    }, "hide_source"))) : "", typeof self.props.column.editor_default !== 'undefined' ? h("p", {
      class: "control"
    }, h("button", {
      class: "button is-small",
      tabindex: "-1",
      onClick: self.onResetClicked
    }, h("span", {
      class: "material-symbols-outlined"
    }, "restart_alt"))) : "", self.props.add || self.props.batch ? "" : h("p", {
      class: "control"
    }, h("button", {
      class: "button is-small",
      tabindex: "-1",
      onClick: self.onUndoClicked
    }, h("span", {
      class: "material-symbols-outlined"
    }, "undo")))), h("div", {
      class: "field ctable-editor-control"
    }, self.props.column.editor_actor == "CSelectEditor" ? h(CSelectEditor, {
      column: self.props.column,
      onEditorChanges: self.onEditorChanges,
      row: self.props.row,
      add: self.props.add,
      batch: self.props.batch
    }) : "", self.props.column.editor_actor == "CLineEditor" ? h(CLineEditor, {
      column: self.props.column,
      onEditorChanges: self.onEditorChanges,
      row: self.props.row,
      add: self.props.add,
      batch: self.props.batch
    }) : "", self.props.column.editor_hint ? h("p", {
      class: "help"
    }, self.props.column.editor_hint) : ""));
  }
}
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
    return h("section", {
      class: "section ctable-editor-section"
    }, h("div", {
      class: "ctable-editor-panel",
      style: sty("width", "min(" + self.props.width + "em,100%)")
    }, h("div", {
      class: "field has-text-right"
    }, h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-primary is-soft",
      onClick: self.props.noSaveClick
    }, h("span", {
      class: "material-symbols-outlined"
    }, "save"), " ", self.props.affectedRows.length == 0 ? _("Add") : "", self.props.affectedRows.length == 1 ? _("Save") : "", self.props.affectedRows.length > 1 ? _("Save all") : "")), h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-warning is-soft",
      onClick: self.props.noCancelClick
    }, h("span", {
      class: "material-symbols-outlined"
    }, "cancel"), " ", _("Cancel")))), self.props.columns.filter(x => x.editor_actor).map(x => {
      return h(CEditorFrame, {
        column: x,
        onEditorChanges: self.props.onEditorChanges,
        row: self.props.affectedRows.length == 0 ? null : self.props.affectedRows[0],
        add: self.props.affectedRows.length == 0,
        batch: self.props.affectedRows.length > 1
      });
    }), h("div", {
      class: "field has-text-right"
    }, h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-primary is-soft",
      onClick: self.props.noSaveClick
    }, h("span", {
      class: "material-symbols-outlined"
    }, "save"), " ", self.props.affectedRows.length == 0 ? _("Add") : "", self.props.affectedRows.length == 1 ? _("Save") : "", self.props.affectedRows.length > 1 ? _("Save all") : "")), h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-warning is-soft",
      onClick: self.props.noCancelClick
    }, h("span", {
      class: "material-symbols-outlined"
    }, "cancel"), " ", _("Cancel"))))));
  }
}
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
      topline_buttons: [{
        name: "add",
        icon: "add",
        label: _("Add"),
        enabled: true,
        style: "is-primary",
        icon_only: false
      }, {
        name: "edit",
        icon: "edit",
        label: _("Edit"),
        enabled: false,
        style: "is-warning",
        icon_only: false
      }, {
        name: "duplicate",
        icon: "content_copy",
        label: _("Duplicate"),
        enabled: false,
        style: "is-warning",
        icon_only: false
      }, {
        name: "delete",
        icon: "delete",
        label: _("Delete"),
        enabled: false,
        style: "is-danger",
        icon_only: false
      }, {
        name: "enter",
        icon: "subdirectory_arrow_right",
        label: _("Enter"),
        enabled: true,
        style: "",
        icon_only: false
      }, {
        name: "back",
        icon: "arrow_back",
        label: _("Go back"),
        enabled: true,
        style: "",
        icon_only: false
      }, {
        name: "filter",
        icon: "filter_alt",
        label: _("Filter"),
        enabled: true,
        style: "",
        icon_only: false
      }, {
        name: "sort",
        icon: "sort",
        label: _("Sorting"),
        enabled: true,
        style: "",
        icon_only: false
      }, {
        name: "columns",
        icon: "list_alt",
        label: _("Columns"),
        enabled: true,
        style: "",
        icon_only: false
      }, {
        name: "select_all",
        icon: "select_all",
        label: _("Select all"),
        enabled: true,
        style: "",
        icon_only: true
      }, {
        name: "clear_all",
        icon: "remove_selection",
        label: _("Clear all"),
        enabled: true,
        style: "",
        icon_only: true
      }, {
        name: "zoom_in",
        icon: "zoom_in",
        label: _("Zoom In"),
        enabled: true,
        style: "",
        icon_only: true
      }, {
        name: "zoom_out",
        icon: "zoom_out",
        label: _("Zoom Out"),
        enabled: true,
        style: "",
        icon_only: true
      }, {
        name: "zoom_reset",
        icon: "search",
        label: _("Reset Zoom"),
        enabled: false,
        style: "",
        icon_only: true
      }],
      table_columns: [],
      table_rows: [],
      table_row_status: [],
      table_select_menu_active: false,
      editor_show: false,
      editor_affected_rows: [],
      editor_changes: {},
      editor_operation: ''
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
      let table_columns_p = self.props.server.CTableServer.columns(self.state.current_table.name).then(c => {
        this.setState({
          table_columns: c
        }, () => {
          self.reloadData();
        });
      });
    });
  }
  reloadData() {
    this.setState({
      progress: true
    });
    var keys = this.getAffectedKeys();
    let table_rows_p = this.props.server.CTableServer.select(this.state.current_table.name).then(r => {
      this.state.table_rows = r;
      this.state.table_row_status = [];
      this.state.table_rows.forEach(x => {
        var issel = false;
        keys.forEach(w => {
          if (!issel) {
            issel = Object.keys(w).map(q => w[q] == x[q]).every(u => u);
          }
        });
        this.state.table_row_status.push({
          selected: issel
        });
      });
      this.state.progress = false;
      this.state.last_row_clicked = null;
      this.setState({}, () => {
        this.enablePanelButtons();
      });
    });
  }
  topButtonClick(e) {
    var tg = unwind_button(e);
    if (tg.dataset['name'] == "zoom_in" || tg.dataset['name'] == "zoom_out" || tg.dataset['name'] == "zoom_reset") {
      if (tg.dataset['name'] == "zoom_in") {
        if (this.state.fontSize < 300) {
          this.state.fontSize = this.state.fontSize + 25;
        }
      }
      if (tg.dataset['name'] == "zoom_out") {
        if (this.state.fontSize > 25) {
          this.state.fontSize = this.state.fontSize - 25;
        }
      }
      if (tg.dataset['name'] == "zoom_reset") {
        this.state.fontSize = 100;
      }
      if (this.state.fontSize != 100) this.state.topline_buttons.filter(x => x.name == "zoom_reset").forEach(x => x.enabled = true);else this.state.topline_buttons.filter(x => x.name == "zoom_reset").forEach(x => x.enabled = false);
      this.setState({});
      return;
    }
    if (tg.dataset['name'] == "select_all") {
      if (this.state.editor_show == true) return;
      this.state.table_row_status = [];
      this.state.table_rows.forEach(x => {
        this.state.table_row_status.push({
          selected: true
        });
      });
      this.setState({}, () => this.enablePanelButtons());
      return;
    }
    if (tg.dataset['name'] == "clear_all") {
      if (this.state.editor_show == true) return;
      this.state.table_row_status = [];
      this.state.table_rows.forEach(x => {
        this.state.table_row_status.push({
          selected: false
        });
      });
      this.setState({}, () => this.enablePanelButtons());
      return;
    }
    if (tg.dataset['name'] == "add") {
      this.setState({
        editor_show: true,
        editor_affected_rows: [],
        editor_changes: {},
        editor_operation: 'add'
      });
      return;
    }
    if (tg.dataset['name'] == "edit") {
      this.setState({
        editor_show: true,
        editor_affected_rows: this.state.table_rows.filter((x, i) => this.state.table_row_status[i].selected),
        editor_changes: {},
        editor_operation: 'edit'
      });
      return;
    }
    if (tg.dataset['name'] == "duplicate") {
      if (this.getAffectedKeys().length == 0) return; // no rows affected
      this.setState({
        progress: true
      });
      this.props.server.CTableServer.duplicate(this.state.current_table.name, this.getAffectedKeys()).then(() => {
        this.reloadData();
      }).catch(e => {
        this.showError(e);
        this.setState({
          progress: false
        });
      });
    }
    if (tg.dataset['name'] == "delete") {
      if (this.getAffectedKeys().length == 0) return; // no rows affected
      this.setState({
        progress: true
      });
      this.props.server.CTableServer.delete(this.state.current_table.name, this.getAffectedKeys()).then(() => {
        this.reloadData();
      }).catch(e => {
        this.showError(e);
        this.setState({
          progress: false
        });
      });
    }
  }
  getAffectedKeys() {
    var affected_rows = this.state.table_rows.filter((x, i) => this.state.table_row_status[i].selected);
    var keys = this.state.table_columns.filter(x => x.is_key).map(x => x.name);
    var keys_values = affected_rows.map(x => {
      var res = {};
      keys.forEach(k => res[k] = x[k]);
      return res;
    });
    return keys_values;
  }
  headerXScroll(e) {
    document.querySelector(".ctable-scroll-main-table").scrollLeft = e.target.scrollLeft;
  }
  tableXScroll(e) {
    document.querySelector(".ctable-scroll-head-table").scrollLeft = e.target.scrollLeft;
  }
  onRowClick(e) {
    if (this.state.editor_show == true) return;
    var tg = unwind_tr(e);
    var ns = [];
    var nv = this.state.last_row_clicked;
    this.state.last_row_clicked = Number(tg.dataset['rowindex']);
    if (e.getModifierState("Shift")) {
      if (nv !== null) {
        if (nv > Number(tg.dataset['rowindex'])) {
          while (nv >= Number(tg.dataset['rowindex'])) {
            ns.push(nv);
            nv = nv - 1;
          }
        } else {
          while (nv <= Number(tg.dataset['rowindex'])) {
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
    ns.forEach(n => {
      this.state.table_row_status[n].selected = target_state;
    });
    this.setState({}, () => this.enablePanelButtons());
  }
  enablePanelButtons() {
    var sel_count = this.state.table_row_status.filter(x => x.selected == true).length;
    if (sel_count == 0) {
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
  onTableSelectDropdownClick() {
    this.setState({
      table_select_menu_active: !this.state.table_select_menu_active
    });
  }
  onTableSelectClick(x) {
    var tbl = this.state.table_list.filter(y => y.label == x.target.dataset.label)[0];
    this.setState({
      current_table: tbl,
      table_select_menu_active: false,
      width: tbl.width
    });
  }
  onSaveClick() {
    if (Object.keys(this.state.editor_changes).filter(x => this.state.editor_changes[x].is_modified == true && this.state.editor_changes[x].valid == false).length > 0) {
      return; //Has invalid fields
    }
    if (Object.keys(this.state.editor_changes).filter(x => this.state.editor_changes[x].is_modified == true).length == 0) {
      return; //Has no modified fields
    }
    var modified_data = Object.keys(this.state.editor_changes).filter(x => this.state.editor_changes[x].is_modified == true && this.state.editor_changes[x].valid == true);
    var data_to_send = {};
    modified_data.forEach(x => {
      data_to_send[x] = this.state.editor_changes[x].value;
    });
    if (this.state.editor_operation == 'add') {
      this.setState({
        progress: true
      });
      this.props.server.CTableServer.insert(this.state.current_table.name, data_to_send).then(() => {
        this.setState({
          editor_show: false
        });
        this.reloadData();
      }).catch(e => {
        this.showError(e);
        this.setState({
          progress: false
        });
      });
    }
    if (this.state.editor_operation == 'edit') {
      if (this.state.editor_affected_rows.length == 0) return; // no rows affected
      this.setState({
        editor_show: false,
        progress: true
      });
      this.props.server.CTableServer.update(this.state.current_table.name, this.getAffectedKeys(), data_to_send).then(() => {
        this.setState({
          editor_show: false
        });
        this.reloadData();
      }).catch(e => {
        this.showError(e);
        this.setState({
          progress: false
        });
      });
    }
  }
  showError(e) {
    alert(String(e.code) + ": " + e.message);
  }
  onCancelClick() {
    this.setState({
      editor_show: false,
      editor_changes: [],
      editor_operation: ''
    });
  }
  onEditorChanges(colname, is_modified, value, valid) {
    this.state.editor_changes[colname] = {
      is_modified: is_modified,
      value: value,
      valid: valid
    };
    this.base.querySelectorAll(".ctable-editor-control div").forEach(x => x.dispatchEvent(new CustomEvent("cteditorchanged", {
      detail: {
        initiator: colname,
        changes: this.state.editor_changes
      }
    })));
  }
  render() {
    var self = this;
    return h("div", null, h("section", {
      class: "section pt-3 pb-0 pl-0 pr-0 ctable-top-panel"
    }, h("div", {
      class: "ctable-top-panel-block",
      style: sty("max-width", self.state.width + 2 + "em")
    }, h("div", {
      class: "pl-3 pr-3"
    }, h("table", {
      class: "ctable-title-table"
    }, h("colgroup", null, h("col", {
      span: "1",
      style: "width: 20%;"
    }), h("col", {
      span: "1",
      style: "width: 60%;"
    }), h("col", {
      span: "1",
      style: "width: 20%;"
    })), h("tr", null, h("td", null, h("div", {
      class: cls("dropdown", self.state.table_select_menu_active ? "is-active" : "")
    }, h("div", {
      class: "dropdown-trigger"
    }, h("button", {
      class: "button is-small",
      "aria-haspopup": "true",
      "aria-controls": "dropdown-menu",
      onClick: this.onTableSelectDropdownClick
    }, h("span", {
      class: "icon"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "menu")), h("span", {
      class: "icon is-small"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "arrow_drop_down")))), h("div", {
      class: "dropdown-menu",
      id: "dropdown-menu",
      role: "menu"
    }, h("div", {
      class: "dropdown-content"
    }, self.state.table_list.map(x => h("a", {
      class: cls("dropdown-item", x.name == self.state.current_table.name ? "is-active" : ""),
      "data-label": x.name,
      onClick: this.onTableSelectClick
    }, h("span", {
      class: "material-symbols-outlined-small"
    }, "lists"), " ", x.label)), h("hr", {
      class: "dropdown-divider"
    }), self.state.links.map(x => h("a", {
      class: "dropdown-item",
      href: x.url
    }, h("span", {
      class: "material-symbols-outlined-small"
    }, "link"), " ", x.label)))))), h("td", null, h("div", {
      class: "ctable-top-panel-text"
    }, h("div", {
      class: "is-hidden-mobile",
      style: "display:inline-block;"
    }, h("span", {
      class: "material-symbols-outlined-small"
    }, "lists"), "\xA0", self.state.current_table.label))), h("td", {
      class: "has-text-right"
    }, h("div", {
      class: "dropdown is-right"
    }, h("div", {
      class: "dropdown-trigger"
    }, h("button", {
      class: "button is-small",
      "aria-haspopup": "true",
      "aria-controls": "dropdown-menu"
    }, h("span", {
      class: "icon"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "person")), h("span", {
      class: "icon is-small"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "arrow_drop_down")))), h("div", {
      class: "dropdown-menu",
      id: "dropdown-menu",
      role: "menu"
    }, h("div", {
      class: "dropdown-content has-text-left"
    }, h("a", {
      class: "dropdown-item"
    }, h("span", {
      class: "material-symbols-outlined-small"
    }, "login"), " \u0412\u043E\u0439\u0442\u0438 \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0443"), h("hr", {
      class: "dropdown-divider"
    }), h("a", {
      class: "dropdown-item"
    }, h("span", {
      class: "material-symbols-outlined-small"
    }, "logout"), " \u0412\u044B\u0439\u0442\u0438 \u0438\u0437 \u0441\u0438\u0441\u0442\u0435\u043C\u044B")))))))), h("div", {
      class: "ctable-scroll-button-panel"
    }, h("div", {
      class: "ctable-button-panel",
      style: sty("width", "80em")
    }, self.state.topline_buttons.filter(x => x.enabled).map(x => h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: cls("button", "is-small", "is-soft", x.style),
      "data-name": x.name,
      onClick: this.topButtonClick
    }, h("span", {
      class: "material-symbols-outlined"
    }, x.icon), x.icon_only ? "" : " " + x.label))))), h(CHeaderTable, {
      width: self.state.width,
      fontSize: self.state.fontSize,
      columns: self.state.table_columns,
      onHeaderXScroll: self.headerXScroll,
      progress: self.state.progress
    }))), h(CPageTable, {
      width: self.state.width,
      fontSize: self.state.fontSize,
      columns: self.state.table_columns,
      row_status: self.state.table_row_status,
      rows: self.state.table_rows,
      onRowClick: self.onRowClick,
      onTableXScroll: self.tableXScroll,
      editorShow: self.state.editor_show
    }), self.state.editor_show ? h(CEditorPanel, {
      width: self.state.width,
      columns: self.state.table_columns,
      affectedRows: self.state.editor_affected_rows,
      noSaveClick: self.onSaveClick,
      noCancelClick: self.onCancelClick,
      onEditorChanges: self.onEditorChanges
    }) : "");
  }
}
var ctable_lang_ru = {
  "Add": "Добавить",
  "Save": "Сохранить",
  "Save all": "Сохранить все",
  "Cancel": "Отменить",
  "Edit": "Правка",
  "Duplicate": "Создать копию",
  "Delete": "Удалить",
  "Enter": "Войти",
  "Go back": "Выйти",
  "Filter": "Фильтр",
  "Sorting": "Сортировка",
  "Columns": "Столбцы",
  "Select all": "Выбрать все",
  "Clear all": "Очистить все",
  "Zoom In": "Увеличить",
  "Zoom Out": "Уменьшить",
  "Reset Zoom": "Сбросить масштаб"
};

//# sourceMappingURL=ctable.js.map