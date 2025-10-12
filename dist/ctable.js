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
    if (s in ctable_lang_ru && ctable_lang_ru[s][1] !== "") return ctable_lang_ru[s][1];else return s;
  } else return s;
}
function N_(s1, s2, n) {
  plural = n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
  if (navigator.language == "ru-RU") {
    if (s1 in ctable_lang_ru && ctable_lang_ru[s1][plural + 1] !== "") return ctable_lang_ru[s1][plural + 1].replace("%d", n);else return (n == 1 ? s1 : s2).replace("%d", n);
    ;
  } else return (n == 1 ? s1 : s2).replace("%d", n);
  ;
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
function unwind_button_or_link(e) {
  var tg = e.target;
  if (tg.tagName != "BUTTON" && tg.tagName != "A") {
    tg = tg.parentElement;
  }
  return tg;
}
function unwind_tr(e) {
  var tg = e.target;
  if (tg.tagName != "TR") {
    tg = unwind_tr({
      target: tg.parentElement
    });
  }
  return tg;
}
function unwind_th(e) {
  var tg = e.target;
  if (tg.tagName != "TH") {
    tg = unwind_tr({
      target: tg.parentElement
    });
  }
  return tg;
}
function deep_copy(x) {
  return JSON.parse(JSON.stringify(x));
}
/**
 * Boolean value cell.
 *
 * @arg this.props.value {Boolean} Value.
 *
 */

class CBoolCell extends Component {
  render() {
    return h("span", {
      class: "tag"
    }, this.props.value === null ? h("span", {
      class: "has-text-grey"
    }, "NULL") : this.props.value ? _("Yes") : _("No"));
  }
}
class CBoolEditor extends Component {
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
    var self = this;
    var is_valid = true;
    self.state.editor_value = self.state.editor_value === null || self.state.editor_value === "-1" || self.state.editor_value === -1 ? null : self.state.editor_value === "1" || self.state.editor_value === 1 ? 1 : 0;
    if (self.state.editor_value !== null && self.state.editor_value !== 0 && self.state.editor_value !== 1) {
      is_valid = false;
      if (self.state.editor_value === null && self.props.column.editor_allow_null) {
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
    var items = [{
      value: 1,
      label: _("Yes")
    }, {
      value: 0,
      label: _("No")
    }];
    return h("div", {
      class: cls("control", self.state.editor_value === null ? "has-icons-left" : ""),
      oncteditortonull: self.onNullClicked,
      oncteditorreset: self.onResetClicked,
      oncteditorundo: self.onUndoClicked,
      oncteditorchanged: self.onOtherEditorChanged
    }, h("div", {
      class: cls("select", self.state.editor_valid ? "" : "is-danger")
    }, h("select", {
      onChange: this.onInputChange
    }, items.map(item => {
      return h("option", {
        value: item.value,
        selected: self.state.editor_value === item.value
      }, item.label);
    }), self.props.column.editor_allow_null ? h("option", {
      value: "-1",
      selected: self.state.editor_value === null
    }, "NULL") : "")), self.state.editor_value === null ? h("span", {
      class: "icon is-small is-left"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "hide_source")) : "");
  }
}
/**
 * Multiline plain text column.
 *
 * @arg this.props.column.max_length {Integer} Maximum length for display in symbols.
 *
 * @arg this.props.value {String} Text.
 *
 */

class CMultilineTextCell extends Component {
  render() {
    var self = this;
    return h(Fragment, null, self.props.value === null ? h("span", {
      class: "has-text-grey"
    }, "NULL") : h("span", {
      title: self.props.value.length <= self.props.column.max_length ? "" : String(self.props.value)
    }, self.props.value.slice(0, self.props.column.max_length) + (self.props.value.length > self.props.column.max_length ? "..." : "")));
  }
}
class CMultilineTextEditor extends Component {
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
   * @listens CEditorFrame#cteditorreset
   */

  onResetClicked() {
    this.setState({
      editor_value: this.props.column.editor_default,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to Default
   *
   * @method
   * @listens CEditorFrame#cteditortonull
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
  onFastTextInput(val) {
    if (this.state.editor_value) {
      this.state.editor_value = this.state.editor_value + this.props.column.hint_sep + val;
    } else {
      this.state.editor_value = val;
    }
    this.setState({
      editor_value: this.state.editor_value,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }
  renderToolbar() {
    var self = this;
    var buttons = self.props.column.hints;
    return h("div", {
      class: "field mt-2"
    }, h("div", {
      class: "control"
    }, h("div", {
      class: "buttons are-small is-flex is-flex-wrap-wrap"
    }, buttons.map(([label, val]) => h("button", {
      type: "button",
      class: "button is-small",
      onClick: () => this.onFastTextInput(val),
      title: val.slice(0, self.props.column.max_length) + (val.length > 32 ? "..." : "")
    }, label)))));
  }
  render() {
    var self = this;
    return h("div", {
      class: cls("control", self.state.editor_value === null ? "has-icons-left" : ""),
      oncteditortonull: self.onNullClicked,
      oncteditorreset: self.onResetClicked,
      oncteditorundo: self.onUndoClicked,
      oncteditorchanged: self.onOtherEditorChanged
    }, h("textarea", {
      class: cls("textarea", self.state.editor_valid ? "" : "is-danger"),
      placeholder: self.state.editor_value === null ? "NULL" : self.props.column.editor_placeholder,
      value: self.state.editor_value === null ? "" : self.state.editor_value,
      onInput: self.onInputChange
    }), self.state.editor_value === null ? h("span", {
      class: "icon is-small is-left"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "hide_source")) : "", self.renderToolbar());
  }
}
/**
 * Multiline plain text column.
 *
 * @arg this.props.column.options {Array} Array of pairs of strings `[tag, label]`
 * @arg this.props.column.max_length {Integer} Maximum label length for display in symbols.
 *
 * @arg this.props.value {String} Tags string in format `tag1;tag2;tag3`
 *
 */

class CTagsCell extends Component {
  render() {
    var self = this;
    if (self.props.value === null) {
      return h("span", {
        class: "has-text-grey"
      }, "NULL");
    } else {
      self.props.value = self.props.value.split(";");
      return self.props.value.map(item => {
        if (item == "") {
          return "";
        }
        ;
        var item_label = item;
        var item_label_list = self.props.column.options.filter(x => x[0] == item);
        if (item_label_list.length > 0) {
          item_label = item_label_list[0][1];
        }
        if (self.props.column.max_length === undefined || item_label.length <= self.props.column.max_length) {
          return h("span", {
            class: "tag"
          }, item_label);
        } else {
          return h("span", {
            class: "tag",
            title: item_label
          }, item_label.slice(0, self.props.column.max_length) + "...");
        }
      });
    }
  }
}
class CTagsEditor extends Component {
  constructor() {
    super();
    this.onResetClicked = this.onResetClicked.bind(this);
    this.onNullClicked = this.onNullClicked.bind(this);
    this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
    this.onUndoClicked = this.onUndoClicked.bind(this);
    this.validateAndSend = this.validateAndSend.bind(this);
    this.onRemoveTag = this.onRemoveTag.bind(this);
    this.onAddTag = this.onAddTag.bind(this);
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
    var is_valid = true;
    if (this.state.editor_value === "" && this.props.column.editor_minimum_tags > 0) {
      is_valid = false;
    }
    if (this.state.editor_value === null && !this.props.column.editor_allow_null) {
      is_valid = false;
    }
    this.setState({
      editor_valid: is_valid
    }, () => {
      this.props.onEditorChanges(this.props.column.name, this.state.editor_modified, this.state.editor_value, is_valid);
    });
  }

  /**
   * Request to set value to NULL.
   *
   * @method
   * @listens CEditorFrame#cteditorreset
   */

  onResetClicked() {
    this.setState({
      editor_value: this.props.column.editor_default,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to Default
   *
   * @method
   * @listens CEditorFrame#cteditortonull
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
  onRemoveTag(e) {
    var tag = unwind_button_or_link(e).dataset['tag'];
    var nv = this.state.editor_value;
    if (this.state.editor_value == null || this.state.editor_value == "") {
      return;
    } else {
      var actived = this.state.editor_value.split(";");
      actived = actived.filter(x => x != tag);
      actived.sort();
      nv = actived.join(";");
    }
    this.setState({
      editor_value: nv,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }
  onAddTag(e) {
    var tag = unwind_button_or_link(e).dataset['tag'];
    var nv = "";
    if (this.state.editor_value === null || this.state.editor_value == "") {
      nv = tag;
    } else {
      var actived = this.state.editor_value.split(";");
      actived.push(tag);
      actived.sort();
      nv = actived.join(";");
    }
    this.setState({
      editor_value: nv,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }
  renderTags() {
    var self = this;
    if (self.state.editor_value === undefined) return;
    if (self.state.editor_value === null) {
      return h("div", {
        class: "input"
      }, h("span", {
        class: "has-text-grey"
      }, "NULL"), h("span", {
        class: "icon is-small is-left"
      }, h("span", {
        class: "material-symbols-outlined"
      }, "hide_source")));
    } else {
      var actived = self.state.editor_value.split(";");
      var tags = self.props.column.options.filter(x => actived.includes(x[0]));
      return h("div", {
        class: cls("input", self.state.editor_valid ? "" : "is-danger"),
        style: "height: auto;flex-flow: wrap;row-gap: 0.4em; min-height: 2.5em; min-width: 5em;"
      }, tags.map(([tag, label]) => {
        return h("div", {
          class: "control"
        }, h("div", {
          class: "tags has-addons mr-2"
        }, h("button", {
          class: "tag"
        }, label), h("button", {
          class: "tag is-delete",
          "data-tag": tag,
          onClick: self.onRemoveTag
        })));
      }));
    }
  }
  renderToolbar() {
    var self = this;
    var buttons = self.props.column.options;
    if (self.state.editor_value === undefined) return;
    if (self.state.editor_value !== null) {
      var actived = self.state.editor_value.split(";");
      buttons = buttons.filter(x => !actived.includes(x[0]));
    }
    return h("div", {
      class: "field"
    }, h("div", {
      class: "control"
    }, h("div", {
      class: "buttons are-small is-flex is-flex-wrap-wrap"
    }, buttons.map(([val, label]) => h("button", {
      type: "button",
      class: "button is-small",
      "data-tag": val,
      onClick: self.onAddTag,
      title: label.slice(0, self.props.column.max_length) + (label.length > 32 ? "..." : "")
    }, label)))));
  }
  render() {
    var self = this;
    return h("div", {
      class: cls("control field is-grouped is-grouped-multiline", self.state.editor_value === null ? "has-icons-left" : ""),
      oncteditortonull: self.onNullClicked,
      oncteditorreset: self.onResetClicked,
      oncteditorundo: self.onUndoClicked,
      oncteditorchanged: self.onOtherEditorChanged
    }, self.renderTags(), self.renderToolbar());
  }
}
/**
 * Number cell
 *
 * @arg this.props.column.actor_type {String} Number format. Allowed values: `Integer`, `Float`, `Money`
 *
 * @arg this.props.value {Float} Value.
 *
 */

class CNumbersCell extends Component {
  render() {
    if (this.props.value === null) {
      return h("span", {
        class: "has-text-grey"
      }, "NULL");
    }
    var accepted_types = ["Integer", "Float", "Money"];
    const moneyFormatter = new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      style: 'decimal'
    });
    if (accepted_types.includes(this.props.column.actor_type)) {
      if (this.props.column.actor_type == "Integer") {
        return h(Fragment, null, Number(this.props.value).toFixed(0));
      } else if (this.props.column.actor_type == "Float") {
        return h(Fragment, null, Number(this.props.value).toFixed(2));
      } else if (this.props.column.actor_type == "Money") {
        return h(Fragment, null, moneyFormatter.format(this.props.value));
      }
    }
  }
}
/**
 * Plain text column.
 *
 * @arg this.props.value {String} Value.
 *
 */

class CPlainTextCell extends Component {
  render() {
    return h(Fragment, null, this.props.value === null ? h("span", {
      class: "has-text-grey"
    }, "NULL") : String(this.props.value));
  }
}
/**
 * Select column.
 *
 * @arg this.props.column.options {Array} Array of pairs of strings `[option, label]`
 * @arg this.props.column.single_select {Boolean} Show only single value
 *
 * @arg this.props.value {String} Value in format `id1;id2;id3`
 *
 */

class CSelectCell {
  render() {
    var self = this;
    if (self.props.value === null) {
      return h("span", {
        class: "has-text-grey"
      }, "NULL");
    } else {
      if (self.props.column.single_select || self.props.column.single_select === undefined) {
        var labels = self.props.column.options.filter(x => x.value == this.props.value).map(x => x.label);
        return h(Fragment, null, labels.length == 0 ? h("span", {
          class: "tag"
        }, this.props.value) : h("span", {
          class: "tag"
        }, String(labels[0])));
      } else {
        return self.props.value.split(";").map(item => {
          var labels = self.props.column.options.filter(x => x.value == item).map(x => x.label);
          return h(Fragment, null, labels.length == 0 ? h("span", {
            class: "tag"
          }, item) : h("span", {
            class: "tag"
          }, String(labels[0])));
        });
      }
    }
  }
}
/**
 * Date column.
 *
 * @arg this.props.value {String} Date in SQL format
 *
 */

class CDateCell extends Component {
  render() {
    const date = new Date(this.props.value);
    const form = x => String(x).padStart(2, '0');
    return h(Fragment, null, this.props.value === null ? h("span", {
      class: "has-text-grey"
    }, "NULL") : `${form(date.getDate())}.${form(date.getMonth() + 1)}.${form(date.getFullYear())}`);
  }
}
/**
 * Files column with download option.
 *
 * @arg this.props.value {String} String in `id;size;name` format
 *
 */

class CFilesCell extends Component {
  constructor() {
    super();
    this.onDownloadClicked = this.onDownloadClicked.bind(this);
  }
  size_to_text(n) {
    if (n <= 1024) {
      return N_("%d Byte", "%d Bytes", n);
    } else if (n <= 1024 * 1024) {
      return N_("%d KiB", "%d KiB", Math.round(n / 1024));
    } else if (n <= 1024 * 1024 * 1024) {
      return N_("%d MiB", "%d MiB", Math.round(n / 1024 / 1024));
    }
    return N_("%d GiB", "%d GiB", Math.round(n / 1024 / 1024 / 1024));
  }
  onDownloadClicked(e) {
    var tg = unwind_button_or_link(e);
    this.props.onDownloadFile(this.props.row, tg.dataset['column'], tg.dataset['index']);
    e.stopPropagation();
  }
  render() {
    var self = this;
    var files = [];
    if (this.props.value !== null && this.props.value !== "") {
      var mfiles = this.props.value.split(";");
      mfiles.forEach(x => {
        var w = x.split(':');
        files.push({
          file: w[0],
          size: w[1],
          name: w[2]
        });
      });
    }
    return h(Fragment, null, this.props.value === null ? h("span", {
      class: "has-text-grey"
    }, "NULL") : files.map((x, i) => {
      return h("button", {
        class: "button is-small",
        title: x.name + " (" + self.size_to_text(x.size) + ")",
        "data-column": self.props.column.name,
        "data-index": i,
        onClick: self.onDownloadClicked
      }, h("span", {
        class: "material-symbols-outlined-small"
      }, "download"));
    }));
  }
}
class CDateEditor extends Component {
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
    var date_value = this.props.add || this.props.batch ? this.formatGostAsISODate(this.props.column.editor_default) : this.props.row[this.props.column.name];
    this.setState({
      editor_value: date_value,
      display_value: this.formatISODateForDisplay(date_value),
      editor_modified: false,
      editor_valid: false
    }, () => {
      this.validateAndSend();
    });
  }
  isValidDate(date) {
    const d = new Date(date);
    return d.getMonth() == date.split("-")[1] - 1;
  }
  validateAndSend() {
    var is_valid = true;
    var re = new RegExp("^[0-9][0-9].[0-9][0-9].[0-9][0-9][0-9][0-9]$");
    if (re.test(this.state.display_value) && this.isValidDate(this.state.editor_value)) {
      is_valid = true;
    } else {
      is_valid = false;
      if (this.state.editor_value === null && this.props.column.editor_allow_null) {
        is_valid = true;
      }
    }
    this.setState({
      editor_valid: is_valid
    }, () => {
      this.props.onEditorChanges(this.props.column.name, this.state.editor_modified, this.state.editor_value, this.state.editor_valid);
    });
  }
  formatISODateForDisplay(iso_date) {
    if (iso_date === null) return null;
    var d = new Date(iso_date);
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getFullYear()).padStart(4, "0")}`;
  }
  formatGostAsISODate(gost_date) {
    if (gost_date === null) return null;
    var parts = gost_date.split('.');
    if (parts.length !== 3) return null;
    return `${parts[2].padStart(4, "0")}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  onInputChange(e) {
    this.setState({
      editor_value: this.formatGostAsISODate(e.target.value),
      display_value: e.target.value,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to NULL.
   *
   * @method
   * @listens CEditorFrame#cteditorreset
   */

  onResetClicked() {
    this.setState({
      editor_value: this.formatGostAsISODate(this.props.column.editor_default),
      display_value: this.props.column.editor_default,
      editor_modified: false
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to Default
   *
   * @method
   * @listens CEditorFrame#cteditortonull
   */

  onNullClicked() {
    this.setState({
      editor_value: null,
      display_value: null,
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
    var d = this.props.add ? this.formatGostAsISODate(this.props.column.editor_default) : this.props.row[this.props.column.name];
    this.setState({
      editor_value: d,
      display_value: this.formatISODateForDisplay(d),
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
    var date = new Date(this.state.editor_value);
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
      value: self.state.editor_value === null ? "" : self.state.display_value,
      onChange: self.onInputChange
    }), self.state.editor_value === null ? h("span", {
      class: "icon is-small is-left"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "hide_source")) : "");
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
 * @arg this.props.view_columns {Array} Link to CTable state view_columns
 * @arg this.props.view_sorting {Array} Link to CTable state view_columns
 * @arg this.props.onHeaderXScroll {function} Link to CTable action handler
 *
 */

class CHeaderTable extends Component {
  constructor() {
    super();
    this.onHeaderClick = this.onHeaderClick.bind(this);
  }
  onHeaderClick(x) {
    var th = unwind_th(x);
    var colname = th.dataset["column"];
    var newcol = this.props.table.state.view_sorting;
    newcol.forEach(y => {
      if (y.name == colname) {
        if (y.sorting == "") {
          y.sorting = "asc";
          return;
        }
        if (y.sorting == "asc") {
          y.sorting = "desc";
          return;
        }
        if (y.sorting == "desc") {
          y.sorting = "";
          return;
        }
      }
    });
    this.props.table.state.view_sorting = newcol;
    this.props.table.onSortingChange();
  }
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
    }, h("colgroup", null, self.props.view_columns.map(x => {
      if (x.enabled) {
        return self.props.columns.filter(y => y.name == x.name).map(x => h("col", {
          span: "1",
          style: sty("width", x.width + "em")
        }))[0];
      }
    })), h("thead", null, h("tr", null, self.props.view_columns.map(x => {
      if (x.enabled) {
        var sorting = this.props.view_sorting.filter(y => y.name == x.name).map(x => x.sorting)[0];
        var filtering = this.props.view_filtering.filter(y => y.column == x.name).length > 0;
        return self.props.columns.filter(y => y.name == x.name).map(x => h("th", {
          "data-column": x.name,
          onClick: self.onHeaderClick
        }, sorting == "asc" ? h("span", {
          class: "material-symbols-outlined-small"
        }, "arrow_upward") : "", sorting == "desc" ? h("span", {
          class: "material-symbols-outlined-small"
        }, "arrow_downward") : "", filtering ? h("span", {
          class: "material-symbols-outlined-small"
        }, "filter_alt") : "", " ", x.label))[0];
      }
    })))));
  }
}
/**
 * Table class.
 *
 * This class render main table. This is stateless class.
 *
 * @arg this.props.table {Object} Link to CTable instance
 * @arg this.props.width {int} Link to CTable state width
 * @arg this.props.fontSize {int} Link to CTable state fontSize
 * @arg this.props.columns {Array} Link to CTable state table_columns
 * @arg this.props.view_columns {Array} Link to CTable state view_columns
 * @arg this.props.row_status {Array} Link to CTable state table_row_status
 * @arg this.props.rows {Array} Link to CTable state table_rows
 * @arg this.props.onRowClick {function} Link to CTable action handler
 * @arg this.props.onTableXScroll {function} Link to CTable action handler
 * @arg this.props.editorShow {bool} Is any editor opened?
 *
 */

class CPageTable extends Component {
  render() {
    var self = this;
    return h("section", {
      class: "section  pt-0 pl-0 pr-0 pb-0"
    }, h("div", {
      class: "ctable-scroll-main-table pl-3 pr-3",
      style: sty("max-width", self.props.width + 2 + "em", self.props.editorShow ? "max-height" : "", self.props.editorShow ? "16em" : ""),
      onScroll: self.props.onTableXScroll
    }, h("table", {
      class: "ctable-main-table",
      style: sty("width", self.props.width + "em", "font-size", self.props.fontSize + "%")
    }, h("colgroup", null, self.props.view_columns.map(x => {
      if (x.enabled) {
        return self.props.columns.filter(y => y.name == x.name).map(x => h("col", {
          span: "1",
          style: sty("width", x.width + "em")
        }))[0];
      }
    })), h("tbody", null, self.props.rows.map((r, i) => h("tr", {
      "data-rowindex": i,
      class: cls(self.props.row_status[i].selected ? "ctable-selected-row" : "")
    }, self.props.view_columns.map(x => {
      if (x.enabled) {
        var c = self.props.columns.filter(c => c.name == x.name)[0];
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
        if (c.cell_actor == "CDateCell") return h("td", {
          onClick: self.props.onRowClick
        }, h(CDateCell, {
          column: c,
          value: r[c.name],
          row: r
        }));
        if (c.cell_actor == "CFilesCell") return h("td", {
          onClick: self.props.onRowClick
        }, h(CFilesCell, {
          column: c,
          value: r[c.name],
          row: r,
          onDownloadFile: self.props.table.onDownloadFile
        }));
        if (c.cell_actor == "CNumbersCell") return h("td", {
          onClick: self.props.onRowClick
        }, h(CNumbersCell, {
          column: c,
          value: r[c.name],
          row: r,
          onDownloadFile: self.props.table.onDownloadFile
        }));
        if (c.cell_actor == "CTagsCell") return h("td", {
          onClick: self.props.onRowClick
        }, h(CTagsCell, {
          column: c,
          value: r[c.name],
          row: r,
          onDownloadFile: self.props.table.onDownloadFile
        }));
        if (c.cell_actor == "CBoolCell") return h("td", {
          onClick: self.props.onRowClick
        }, h(CBoolCell, {
          column: c,
          value: r[c.name],
          row: r,
          onDownloadFile: self.props.table.onDownloadFile
        }));
        if (c.cell_actor == "CMultilineTextCell") return h("td", {
          onClick: self.props.onRowClick
        }, h(CMultilineTextCell, {
          column: c,
          value: r[c.name],
          row: r,
          onDownloadFile: self.props.table.onDownloadFile
        }));
        if (c.cell_actor == "CLinkCell") return h("td", {
          onClick: self.props.onRowClick
        }, h(CLinkCell, {
          column: c,
          value: r[c.name],
          row: r,
          options: self.props.table.state.table_options
        }));
        if (c.cell_actor == "CMultiLinkCell") return h("td", {
          onClick: self.props.onRowClick
        }, h(CMultiLinkCell, {
          column: c,
          value: r[c.name],
          row: r,
          options: self.props.table.state.table_options
        }));
      }
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
   * @listens CEditorFrame#cteditorreset
   */

  onResetClicked() {
    this.setState({
      editor_value: this.props.column.editor_default,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to Default
   *
   * @method
   * @listens CEditorFrame#cteditortonull
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
   * @listens CEditorFrame#cteditorreset
   */

  onResetClicked() {
    this.setState({
      editor_value: this.props.column.editor_default,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to Default
   *
   * @method
   * @listens CEditorFrame#cteditortonull
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
 * File upload editor class.
 *
 * @arg this.props.column {Object} Table column.
 * @arg this.props.column.name {string} Column name
 * @arg this.props.column.editor_default {*} Editor default value
 * @arg this.props.column.editor_min_upload_count {Integer} Minimum files count
 * @arg this.props.column.editor_max_upload_count {Integer} Maximum files count
 * @arg this.props.column.editor_max_upload_size {Integer} Maximum upload size
 * @arg this.props.column.editor_allowed_ext {Array} List of allowed extention
 *
 * @arg this.props.row {Object} Row to edit, null if add, first if batch.
 * @arg this.props.add {bool} Is adding.
 * @arg this.props.batch {bool} Is batch editing.
 * @arg this.props.onEditorChanges {CTable#onEditorChanges} Editor changes callback.
 * @arg this.props.onDownloadFile {CTable#onDownloadFile} Download file callback.
 * @arg this.props.onUploadFile{CTable#onUploadFile} Upload file callback.
 * @arg this.props.askUser{CTable#askUser} Ask user callback.
 * @arg this.props.showError{CTable#showError} Show error callback.
 *
 */

class CFilesEditor extends Component {
  constructor() {
    super();
    this.onUploadChange = this.onUploadChange.bind(this);
    this.onUploadDelete = this.onUploadDelete.bind(this);
    this.onDownloadClicked = this.onDownloadClicked.bind(this);
    this.onResetClicked = this.onResetClicked.bind(this);
    this.onNullClicked = this.onNullClicked.bind(this);
    this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
    this.onUndoClicked = this.onUndoClicked.bind(this);
  }
  componentDidMount() {
    var value = this.props.add || this.props.batch ? this.props.column.editor_default : this.props.row[this.props.column.name];
    this.setState({
      editor_value: value,
      editor_modified: false,
      editor_valid: false,
      download_available: value === null || value === "" ? [] : value.split(';').map(x => true)
    }, () => {
      this.validateAndSend();
    });
  }
  validateAndSend() {
    if (this.state.editor_value === null || this.state.editor_value === "") {
      if (this.props.column.editor_min_upload_count == 0) {
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
      if (this.state.editor_value.split(';').length >= this.props.column.editor_min_upload_count && this.state.editor_value.split(';').length <= this.props.column.editor_max_upload_count) {
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
    }
  }
  sendChanges() {
    this.props.onEditorChanges(this.props.column.name, this.state.editor_modified, this.state.editor_value, this.state.editor_valid);
  }
  onUploadChange(e) {
    var idx = parseInt(e.target.dataset['index']);
    var self = this;
    var error_msg = null;
    for (var i = 0; i < e.target.files.length; i++) {
      if (e.target.files[i].size > self.props.column.editor_max_upload_size) {
        error_msg = {
          code: -12,
          message: _("File \"%s\" is too large for upload").replace('%s', e.target.files[i].name)
        };
      }
      var cm = e.target.files[i].name.split('.');
      var cmext = '.' + cm[cm.length - 1];
      if (self.props.column.editor_allowed_ext.indexOf(cmext) < 0) {
        error_msg = {
          code: -16,
          message: _("File \"%s\" extention has not allowed").replace('%s', e.target.files[i].name)
        };
      }
    }
    if (error_msg !== null) {
      this.props.showError(error_msg);
    } else {
      this.props.onUploadFile(this.props.row, this.props.column.name, idx, e.target.files).then(x => {
        var value_array = this.state.editor_value.split(';');
        var new_download_available = this.state.download_available;
        if (idx < 0) {
          value_array.push(x);
          new_download_available.push(false);
        } else {
          value_array[idx] = x;
          new_download_available[idx] = false;
        }
        var new_value = value_array.join(';');
        this.setState({
          editor_value: new_value,
          download_available: new_download_available,
          editor_modified: true
        }, () => {
          this.validateAndSend();
        });
      });
    }
  }
  onDownloadClicked(e) {
    var idx = parseInt(unwind_button_or_link(e).dataset['index']);
    this.props.onDownloadFile(this.props.row, this.props.column.name, idx);
  }
  onUploadDelete(e) {
    this.props.askUser(_("Remove uploaded file?")).then(x => {
      var idx = parseInt(unwind_button_or_link(e).dataset['index']);
      var new_value = this.state.editor_value.split(';').filter((x, i) => i != idx).join(';');
      var new_download_available = this.state.download_available.filter((x, i) => i != idx);
      this.setState({
        editor_value: new_value,
        download_available: new_download_available,
        editor_modified: true
      }, () => {
        this.validateAndSend();
      });
    });
  }

  /**
   * Request to set value to Default
   *
   * @method
   * @listens CEditorFrame#cteditorreset
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
   * Request to set value to NULL.
   *
   * @method
   * @listens CEditorFrame#cteditortonull
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
    var comp = [];
    if (Object.keys(this.state).length == 0) return;
    if (self.state.editor_value !== null && self.state.editor_value !== "") {
      self.state.editor_value.split(';').forEach(x => {
        var m = x.split(':');
        comp.push({
          file: m[0],
          size: m[1],
          name: m[2]
        });
      });
    }
    return h("div", {
      class: cls("control", self.state.editor_value === null ? "has-icons-left" : ""),
      oncteditortonull: self.onNullClicked,
      oncteditorreset: self.onResetClicked,
      oncteditorundo: self.onUndoClicked,
      oncteditorchanged: self.onOtherEditorChanged
    }, comp.map((x, i) => {
      return h(Fragment, null, h("div", {
        class: "file has-name",
        style: "display:inline-block;"
      }, h("label", {
        class: "file-label"
      }, h("input", {
        class: "file-input",
        type: "file",
        "data-index": i,
        onChange: self.onUploadChange,
        accept: self.props.column.editor_allowed_ext.join(',')
      }), h("span", {
        class: "file-cta"
      }, h("span", {
        class: "material-symbols-outlined"
      }, "upload")), h("span", {
        class: "file-name",
        style: "border-radius: 0; width:20em; max-width:20em;"
      }, x.name))), self.state.download_available[i] ? h("button", {
        class: "button",
        style: "border-radius: 0;",
        "data-index": i,
        onClick: self.onDownloadClicked
      }, h("span", {
        class: "material-symbols-outlined"
      }, "download")) : "", h("button", {
        class: "button",
        style: "border-top-left-radius: 0; border-bottom-left-radius: 0;",
        "data-index": i,
        onClick: self.onUploadDelete
      }, h("span", {
        class: "material-symbols-outlined"
      }, "delete")), h("br", null));
    }), self.props.column.editor_max_upload_count > comp.length ? h("div", null, h("div", {
      class: cls("file", "has-name", self.state.editor_valid ? "" : "is-danger"),
      style: "display:inline-block;"
    }, h("label", {
      class: "file-label"
    }, h("input", {
      class: "file-input",
      type: "file",
      "data-index": "-1",
      onChange: self.onUploadChange
    }), h("span", {
      class: "file-cta"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "upload")), h("span", {
      class: "file-name",
      style: "width:20em; max-width:20em;"
    }, _("Upload..."))))) : "");
  }
}
/**
 * Multiple links column.
 *
 * @arg this.props.column.cell_link {String} Table name for linking.
 *
 * @arg this.props.value {String} Links string in format `id1;id2;id3`
 *
 */

class CMultiLinkCell extends Component {
  render() {
    var table = this.props.column.cell_link;
    if (this.props.value === "") return "";
    if (this.props.value === null) return h("span", {
      class: "has-text-grey"
    }, "NULL");
    return this.props.value.split(';').map(x => {
      return parseInt(x);
    }).map(x => {
      var view = "";
      if (x in this.props.options[table]) {
        view = h("span", {
          class: "tag",
          title: "ID: " + x
        }, String(this.props.options[table][x]));
      } else {
        view = h("span", {
          class: "tag has-text-grey"
        }, "ID: " + x);
      }
      return view;
    });
  }
}
/**
 * Link editor class.
 *
 * @arg this.props.column {Object} Table column.
 * @arg this.props.column.name {string} Column name
 * @arg this.props.column.editor_default {*} Editor default value
 *
 * @arg this.props.row {Object} Row to edit, null if add, first if batch.
 * @arg this.props.add {bool} Is adding.
 * @arg this.props.batch {bool} Is batch editing.
 * @arg this.props.onEditorChanges {CTable#OnEditorChanges} Editor changes callback.
 *
 */

class CMultiLinkEditor extends Component {
  constructor() {
    super();
    this.onInputChange = this.onInputChange.bind(this);
    this.onResetClicked = this.onResetClicked.bind(this);
    this.onNullClicked = this.onNullClicked.bind(this);
    this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
    this.onUndoClicked = this.onUndoClicked.bind(this);
    this.onRemoveLink = this.onRemoveLink.bind(this);
    this.onAddLink = this.onAddLink.bind(this);
    this.onSelectDropdownClick = this.onSelectDropdownClick.bind(this);
    this.onOptionsInputChange = this.onOptionsInputChange.bind(this);
  }
  componentDidMount() {
    var self = this;
    this.setState({
      editor_value: this.props.add || this.props.batch ? this.props.column.editor_default : this.props.row[this.props.column.name],
      editor_modified: false,
      editor_valid: true,
      select_dropdown_active: false,
      options_history: clone(this.props.options[this.props.column.cell_link]),
      options_current: clone(this.props.options[this.props.column.cell_link]),
      options_input: "",
      input_id: makeID()
    }, () => {
      this.validateAndSend();
    });
    this.props.getOptionsForField(this.props.column.name, "").then(w => {
      var opt = {};
      w.rows.forEach(q => {
        opt[q[w.keys[0]]] = q[w.label];
      });
      self.setState({
        options_current: opt,
        options_history: {
          ...opt,
          ...self.state.options_history
        }
      });
    });
  }
  validateAndSend() {
    this.sendChanges();
  }
  sendChanges() {
    if (this.props.row === null) {
      this.props.onEditorChanges(this.props.column.name, true, this.state.editor_value, true);
    } else {
      this.props.onEditorChanges(this.props.column.name, this.state.editor_value == this.props.row[this.props.column.name], this.state.editor_value, true);
    }
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
   * @listens CEditorFrame#cteditorreset
   */

  onResetClicked() {
    this.setState({
      editor_value: this.props.column.editor_default,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to Default
   *
   * @method
   * @listens CEditorFrame#cteditortonull
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
  onSelectDropdownClick() {
    this.setState({
      select_dropdown_active: !this.state.select_dropdown_active
    }, () => {
      document.getElementById(this.state.input_id).focus();
    });
  }
  onOptionsInputChange(e) {
    var self = this;
    this.setState({
      options_input: e.target.value
    }, () => {
      self.props.getOptionsForField(this.props.column.name, self.state.options_input).then(w => {
        var opt = {};
        w.rows.forEach(q => {
          opt[q[w.keys[0]]] = q[w.label];
        });
        self.setState({
          options_current: opt,
          options_history: {
            ...opt,
            ...self.state.options_history
          }
        });
      });
    });
  }
  onRemoveLink(e) {
    var id = parseInt(unwind_button_or_link(e).dataset['value']);
    var selectedids = this.state.editor_value.split(";").filter(x => {
      return x != "";
    }).map(x => {
      return parseInt(x);
    }).filter(x => x != id);
    selectedids.sort();
    e.stopPropagation();
    this.setState({
      editor_value: selectedids.join(";"),
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }
  onAddLink(e) {
    var id = parseInt(unwind_button_or_link(e).dataset['value']);
    var selectedids = this.state.editor_value.split(";").filter(x => {
      return x != "";
    }).map(x => {
      return parseInt(x);
    });
    if (selectedids.includes(id)) return;
    selectedids.push(id);
    selectedids.sort();
    this.setState({
      editor_value: selectedids.join(";"),
      select_dropdown_active: false,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }
  render() {
    var self = this;
    if (self.state.editor_value === undefined) return;
    var selectedids = self.state.editor_value.split(";").filter(x => {
      return x != "";
    }).map(x => {
      return parseInt(x);
    });
    var selectedkv = selectedids.map(x => {
      return [x, self.state.options_history && x in self.state.options_history ? String(self.state.options_history[x]) : "ID: " + x];
    });

    //onBlur={this.dropdownMenuLeave}

    return h("div", {
      class: cls("dropdown", self.state.select_dropdown_active ? "is-active is-hoverable" : "")
    }, h("div", {
      class: "dropdown-trigger"
    }, h("div", {
      class: cls("input", self.state.editor_valid ? "" : "is-danger"),
      "aria-haspopup": "true",
      "aria-controls": "dropdown-menu",
      onClick: this.onSelectDropdownClick,
      style: "height: auto;flex-flow: wrap; row-gap: 0.4em; min-height: 2.5em; min-width: 5em;"
    }, selectedkv.map(([id, label]) => {
      return h("div", {
        class: "control"
      }, h("div", {
        class: "tags has-addons mr-2"
      }, h("button", {
        class: "tag",
        title: "ID: " + id
      }, label), h("button", {
        class: "tag is-delete",
        "data-value": id,
        onClick: self.onRemoveLink
      })));
    }), h("span", {
      class: "icon is-small"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "arrow_drop_down")))), h("div", {
      class: "dropdown-menu",
      role: "menu"
    }, h("div", {
      class: "dropdown-content"
    }, h("p", {
      class: "dropdown-item"
    }, h("input", {
      class: "input",
      type: "input",
      value: self.state.options_input,
      onInput: self.onOptionsInputChange,
      id: this.state.input_id
    }))), h("div", {
      class: "dropdown-content",
      style: "overflow: auto; max-height: 12em;"
    }, self.state.options_current ? Object.keys(self.state.options_current).map(x => h("a", {
      class: "dropdown-item",
      "data-value": x,
      onClick: self.onAddLink
    }, self.state.options_current[x], " (", x, ")")) : "")));
  }
}

// {aw_options.map(function(item){
// item_count += 1;
// return <a href="" class={item_count == self.state.top_index ? "dropdown-item is-active" :  "dropdown-item"} id={item_count == self.state.top_index ? self.state.selected_id : null} onClick={self.menuItemClicked} data-value={item[0]}>{item[1]}</a>;})}
/**
 * Single links column.
 *
 * @arg this.props.column.cell_link {String} Table name for linking.
 *
 * @arg this.props.value {Integer} Links id.
 *
 */

class CLinkCell extends Component {
  render() {
    var table = this.props.column.cell_link;
    var view = "";
    if (this.props.value in this.props.options[table]) {
      view = h("span", {
        class: "tag",
        title: "ID: " + this.props.value
      }, String(this.props.options[table][this.props.value]));
    } else {
      view = h("span", {
        class: "has-text-grey"
      }, "ID: " + this.props.value);
    }
    return h(Fragment, null, this.props.value === null ? h("span", {
      class: "has-text-grey"
    }, "NULL") : view);
  }
}
/**
 * Link editor class.
 *
 * @arg this.props.column {Object} Table column.
 * @arg this.props.column.name {string} Column name
 * @arg this.props.column.editor_default {*} Editor default value
 *
 * @arg this.props.row {Object} Row to edit, null if add, first if batch.
 * @arg this.props.add {bool} Is adding.
 * @arg this.props.batch {bool} Is batch editing.
 * @arg this.props.onEditorChanges {CTable#OnEditorChanges} Editor changes callback.
 *
 */

class CLinkEditor extends Component {
  constructor() {
    super();
    this.onInputChange = this.onInputChange.bind(this);
    this.onResetClicked = this.onResetClicked.bind(this);
    this.onNullClicked = this.onNullClicked.bind(this);
    this.onOtherEditorChanged = this.onOtherEditorChanged.bind(this);
    this.onUndoClicked = this.onUndoClicked.bind(this);
    this.onSelectDropdownClick = this.onSelectDropdownClick.bind(this);
    this.onSelectItem = this.onSelectItem.bind(this);
    this.onOptionsInputChange = this.onOptionsInputChange.bind(this);
  }
  componentDidMount() {
    var self = this;
    this.setState({
      editor_value: this.props.add || this.props.batch ? this.props.column.editor_default : this.props.row[this.props.column.name],
      editor_modified: false,
      editor_valid: false,
      select_dropdown_active: false,
      options_history: clone(this.props.options[this.props.column.cell_link]),
      options_current: clone(this.props.options[this.props.column.cell_link]),
      options_input: "",
      input_id: makeID()
    }, () => {
      this.validateAndSend();
    });
    this.props.getOptionsForField(this.props.column.name, "").then(w => {
      var opt = {};
      w.rows.forEach(q => {
        opt[q[w.keys[0]]] = q[w.label];
      });
      self.setState({
        options_current: opt,
        options_history: {
          ...opt,
          ...self.state.options_history
        }
      });
    });
  }
  validateAndSend() {
    this.sendChanges();
  }
  sendChanges() {
    if (this.props.row === null) {
      this.props.onEditorChanges(this.props.column.name, true, this.state.editor_value, true);
    } else {
      this.props.onEditorChanges(this.props.column.name, this.state.editor_value == this.props.row[this.props.column.name], this.state.editor_value, true);
    }
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
   * @listens CEditorFrame#cteditorreset
   */

  onResetClicked() {
    this.setState({
      editor_value: this.props.column.editor_default,
      editor_modified: true
    }, () => {
      this.validateAndSend();
    });
  }

  /**
   * Request to set value to Default
   *
   * @method
   * @listens CEditorFrame#cteditortonull
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
  onSelectDropdownClick() {
    this.setState({
      select_dropdown_active: !this.state.select_dropdown_active
    }, () => {
      document.getElementById(this.state.input_id).focus();
    });
  }
  onSelectItem(e) {
    var el = unwind_button_or_link(e);
    this.setState({
      editor_value: parseInt(el.dataset['value']),
      select_dropdown_active: false
    }, () => {
      this.validateAndSend();
    });
  }
  onOptionsInputChange(e) {
    var self = this;
    this.setState({
      options_input: e.target.value
    }, () => {
      self.props.getOptionsForField(this.props.column.name, self.state.options_input).then(w => {
        var opt = {};
        w.rows.forEach(q => {
          opt[q[w.keys[0]]] = q[w.label];
        });
        self.setState({
          options_current: opt,
          options_history: {
            ...opt,
            ...self.state.options_history
          }
        });
      });
    });
  }
  render() {
    var self = this;

    //onBlur={this.dropdownMenuLeave}

    return h("div", {
      class: cls("dropdown", self.state.select_dropdown_active ? "is-active is-hoverable" : "")
    }, h("div", {
      class: "dropdown-trigger"
    }, h("button", {
      class: "button",
      "aria-haspopup": "true",
      "aria-controls": "dropdown-menu",
      onClick: this.onSelectDropdownClick
    }, h("span", null, self.state.options_history && self.state.editor_value in self.state.options_history ? String(self.state.options_history[self.state.editor_value]) + ' (' + self.state.editor_value + ')' : self.state.editor_value), h("span", {
      class: "icon is-small"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "arrow_drop_down")))), h("div", {
      class: "dropdown-menu",
      role: "menu"
    }, h("div", {
      class: "dropdown-content"
    }, h("p", {
      class: "dropdown-item"
    }, h("input", {
      class: "input",
      type: "input",
      value: self.state.options_input,
      onInput: self.onOptionsInputChange,
      id: this.state.input_id
    }))), h("div", {
      class: "dropdown-content",
      style: "overflow: auto; max-height: 12em;"
    }, self.state.options_current ? Object.keys(self.state.options_current).map(x => h("a", {
      class: "dropdown-item",
      "data-value": x,
      onClick: self.onSelectItem
    }, self.state.options_current[x], " (", x, ")")) : "")));
  }
}

// {aw_options.map(function(item){
// item_count += 1;
// return <a href="" class={item_count == self.state.top_index ? "dropdown-item is-active" :  "dropdown-item"} id={item_count == self.state.top_index ? self.state.selected_id : null} onClick={self.menuItemClicked} data-value={item[0]}>{item[1]}</a>;})}
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
 * @arg this.props.table {Object} Link to CTable instance
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
    }, self.props.batch ? self.state.editor_enabled ? "" : h("div", {
      class: "control"
    }, h("input", {
      class: "input",
      type: "text",
      disabled: true
    })) : "", (self.props.batch == true && self.state.editor_enabled || self.props.batch == false) && self.props.column.editor_actor == "CSelectEditor" ? h(CSelectEditor, {
      column: self.props.column,
      onEditorChanges: self.onEditorChanges,
      row: self.props.row,
      add: self.props.add,
      batch: self.props.batch
    }) : "", (self.props.batch == true && self.state.editor_enabled || self.props.batch == false) && self.props.column.editor_actor == "CLineEditor" ? h(CLineEditor, {
      column: self.props.column,
      onEditorChanges: self.onEditorChanges,
      row: self.props.row,
      add: self.props.add,
      batch: self.props.batch
    }) : "", (self.props.batch == true && self.state.editor_enabled || self.props.batch == false) && self.props.column.editor_actor == "CDateEditor" ? h(CDateEditor, {
      column: self.props.column,
      onEditorChanges: self.onEditorChanges,
      row: self.props.row,
      add: self.props.add,
      batch: self.props.batch
    }) : "", (self.props.batch == true && self.state.editor_enabled || self.props.batch == false) && self.props.column.editor_actor == "CFilesEditor" ? h(CFilesEditor, {
      column: self.props.column,
      onEditorChanges: self.onEditorChanges,
      row: self.props.row,
      add: self.props.add,
      batch: self.props.batch
    }) : "", (self.props.batch == true && self.state.editor_enabled || self.props.batch == false) && self.props.column.editor_actor == "CBoolEditor" ? h(CBoolEditor, {
      column: self.props.column,
      onEditorChanges: self.onEditorChanges,
      row: self.props.row,
      add: self.props.add,
      batch: self.props.batch
    }) : "", (self.props.batch == true && self.state.editor_enabled || self.props.batch == false) && self.props.column.editor_actor == "CMultilineTextEditor" ? h(CMultilineTextEditor, {
      column: self.props.column,
      onEditorChanges: self.onEditorChanges,
      row: self.props.row,
      add: self.props.add,
      batch: self.props.batch
    }) : "", (self.props.batch == true && self.state.editor_enabled || self.props.batch == false) && self.props.column.editor_actor == "CTagsEditor" ? h(CTagsEditor, {
      column: self.props.column,
      onEditorChanges: self.onEditorChanges,
      row: self.props.row,
      add: self.props.add,
      batch: self.props.batch
    }) : "", (self.props.batch == true && self.state.editor_enabled || self.props.batch == false) && self.props.column.editor_actor == "CLinkEditor" ? h(CLinkEditor, {
      column: self.props.column,
      onEditorChanges: self.onEditorChanges,
      row: self.props.row,
      add: self.props.add,
      batch: self.props.batch,
      options: self.props.table.state.table_options,
      getOptionsForField: self.props.table.getOptionsForField
    }) : "", (self.props.batch == true && self.state.editor_enabled || self.props.batch == false) && self.props.column.editor_actor == "CMultiLinkEditor" ? h(CMultiLinkEditor, {
      column: self.props.column,
      onEditorChanges: self.onEditorChanges,
      row: self.props.row,
      add: self.props.add,
      batch: self.props.batch,
      options: self.props.table.state.table_options,
      getOptionsForField: self.props.table.getOptionsForField
    }) : "", self.props.column.editor_hint ? h("p", {
      class: "help"
    }, self.props.column.editor_hint) : h("p", {
      class: "help mt-4"
    }, self.props.column.editor_hint)));
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
      class: "field has-text-right mb-0"
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
        table: self.props.table,
        row: self.props.affectedRows.length == 0 ? null : self.props.affectedRows[0],
        add: self.props.affectedRows.length == 0,
        batch: self.props.affectedRows.length > 1
      });
    }), h("div", {
      class: "field has-text-right mt-5"
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
  onColumnEnableChanged(x) {
    var colname = x.target.dataset['column'];
    var newcol = this.props.table.state.view_columns;
    newcol.forEach(y => {
      if (y.name == colname) y.enabled = x.target.checked;
    });
    this.props.table.setState({
      view_columns: newcol
    });
  }
  onColumnUp(x) {
    var colname = unwind_button_or_link(x).dataset['column'];
    var colindex = -1;
    var newcol = this.props.table.state.view_columns;
    newcol.forEach((y, i) => {
      if (y.name == colname) colindex = i;
    });
    if (colindex > 0) {
      [newcol[colindex - 1], newcol[colindex]] = [newcol[colindex], newcol[colindex - 1]];
      this.props.table.setState({
        view_columns: newcol
      });
    }
  }
  onColumnDown(x) {
    var colname = unwind_button_or_link(x).dataset['column'];
    var colindex = -1;
    var newcol = this.props.table.state.view_columns;
    newcol.forEach((y, i) => {
      if (y.name == colname) colindex = i;
    });
    if (colindex < newcol.length - 1) {
      [newcol[colindex + 1], newcol[colindex]] = [newcol[colindex], newcol[colindex + 1]];
      this.props.table.setState({
        view_columns: newcol
      });
    }
  }
  render() {
    var self = this;
    return h("section", {
      class: "section ctable-editor-section"
    }, h("div", {
      class: "ctable-editor-panel",
      style: sty("width", "min(" + self.props.width + "em,100%)")
    }, h("div", {
      class: "field has-text-right mb-0"
    }, h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-warning is-soft",
      onClick: self.props.onResetColumns
    }, h("span", {
      class: "material-symbols-outlined"
    }, "refresh"), " ", _("Reset"))), h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-soft",
      onClick: self.props.onCloseColumns
    }, h("span", {
      class: "material-symbols-outlined"
    }, "close"), " ", _("Close")))), self.props.table.state.view_columns.map(x => {
      return h("div", null, h("label", {
        class: "checkbox",
        style: "min-width:16em;"
      }, h("input", {
        type: "checkbox",
        checked: x.enabled,
        "data-column": x.name,
        onChange: self.onColumnEnableChanged
      }), "\xA0", this.props.table.state.table_columns.filter(y => y.name == x.name)[0].label), "\xA0", h("button", {
        class: "button is-small",
        "data-column": x.name,
        onClick: self.onColumnUp
      }, h("span", {
        class: "material-symbols-outlined"
      }, "keyboard_arrow_up")), "\xA0", h("button", {
        class: "button is-small",
        "data-column": x.name,
        onClick: self.onColumnDown
      }, h("span", {
        class: "material-symbols-outlined"
      }, "keyboard_arrow_down")));
    }), h("div", {
      class: "field has-text-right mt-5"
    }, h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-warning is-soft",
      onClick: self.props.onResetColumns
    }, h("span", {
      class: "material-symbols-outlined"
    }, "refresh"), " ", _("Reset"))), h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-soft",
      onClick: self.props.onCloseColumns
    }, h("span", {
      class: "material-symbols-outlined"
    }, "close"), " ", _("Close"))))));
  }
}
/**
 * Column panel class.
 *
 * @arg this.props.table {Object} Table object.
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
  onSortChange(x) {
    var colname = unwind_button_or_link(x).dataset['column'];
    var newcol = this.props.table.state.view_sorting;
    newcol.forEach(y => {
      if (y.name == colname) {
        if (y.sorting == "") {
          y.sorting = "asc";
          return;
        }
        if (y.sorting == "asc") {
          y.sorting = "desc";
          return;
        }
        if (y.sorting == "desc") {
          y.sorting = "";
          return;
        }
      }
    });
    this.props.table.state.view_sorting = newcol;
    this.props.table.onSortingChange();
  }
  onColumnUp(x) {
    var colname = unwind_button_or_link(x).dataset['column'];
    var colindex = -1;
    var newcol = this.props.table.state.view_sorting;
    newcol.forEach((y, i) => {
      if (y.name == colname) colindex = i;
    });
    if (colindex > 0) {
      [newcol[colindex - 1], newcol[colindex]] = [newcol[colindex], newcol[colindex - 1]];
      this.props.table.state.view_sorting = newcol;
      this.props.table.onSortingChange();
    }
  }
  onColumnDown(x) {
    var colname = unwind_button_or_link(x).dataset['column'];
    var colindex = -1;
    var newcol = this.props.table.state.view_sorting;
    newcol.forEach((y, i) => {
      if (y.name == colname) colindex = i;
    });
    if (colindex < newcol.length - 1) {
      [newcol[colindex + 1], newcol[colindex]] = [newcol[colindex], newcol[colindex + 1]];
      this.props.table.state.view_sorting = newcol;
      this.props.table.onSortingChange();
    }
  }
  render() {
    var self = this;
    return h("section", {
      class: "section ctable-editor-section"
    }, h("div", {
      class: "ctable-editor-panel",
      style: sty("width", "min(" + self.props.width + "em,100%)")
    }, h("div", {
      class: "field has-text-right mb-0"
    }, h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-warning is-soft",
      onClick: self.props.onResetSorting
    }, h("span", {
      class: "material-symbols-outlined"
    }, "refresh"), " ", _("Reset"))), h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-soft",
      onClick: self.props.onCloseSorting
    }, h("span", {
      class: "material-symbols-outlined"
    }, "close"), " ", _("Close")))), self.props.table.state.view_sorting.map(x => {
      return h("div", null, h("button", {
        class: "button is-small",
        "data-column": x.name,
        onClick: self.onSortChange
      }, h("span", {
        class: "material-symbols-outlined"
      }, x.sorting == "" ? "reorder" : "", x.sorting == "asc" ? "arrow_upward" : "", x.sorting == "desc" ? "arrow_downward" : "")), "\xA0", h("span", {
        class: "ml-2 mr-2",
        style: "min-width:16em; display:inline-block;"
      }, this.props.table.state.table_columns.filter(y => y.name == x.name)[0].label), "\xA0", h("button", {
        class: "button is-small",
        "data-column": x.name,
        onClick: self.onColumnUp
      }, h("span", {
        class: "material-symbols-outlined"
      }, "keyboard_arrow_up")), "\xA0", h("button", {
        class: "button is-small",
        "data-column": x.name,
        onClick: self.onColumnDown
      }, h("span", {
        class: "material-symbols-outlined"
      }, "keyboard_arrow_down")));
    }), h("div", {
      class: "field has-text-right mt-5"
    }, h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-warning is-soft",
      onClick: self.props.onResetSorting
    }, h("span", {
      class: "material-symbols-outlined"
    }, "refresh"), " ", _("Reset"))), h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-soft",
      onClick: self.props.onCloseSorting
    }, h("span", {
      class: "material-symbols-outlined"
    }, "close"), " ", _("Close"))))));
  }
}
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
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onAddClick = this.onAddClick.bind(this);
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

  onColumnChange(x) {
    var i = Number(x.target.dataset['filterindex']);
    this.props.table.state.view_filtering[i].column = x.target.value;
    this.props.table.setState({});
    this.props.table.onFilterChange();
  }
  onOperatorChange(x) {
    var i = Number(x.target.dataset['filterindex']);
    this.props.table.state.view_filtering[i].operator = x.target.value;
    if (this.props.table.state.view_filtering[i].operator == 'in' || this.props.table.state.view_filtering[i].operator == 'not_in') {
      if (!Array.isArray(this.props.table.state.view_filtering[i].value)) {
        this.props.table.state.view_filtering[i].value = this.props.table.state.view_filtering[i].value.split(",").map(x => x.trim());
      }
    } else {
      if (Array.isArray(this.props.table.state.view_filtering[i].value)) {
        this.props.table.state.view_filtering[i].value = this.props.table.state.view_filtering[i].value.join(",");
      }
    }
    this.props.table.setState({});
    this.props.table.onFilterChange();
  }
  onValueChange(x) {
    var i = Number(x.target.dataset['filterindex']);
    this.props.table.state.view_filtering[i].value = x.target.value;
    if (this.props.table.state.view_filtering[i].operator == 'in' || this.props.table.state.view_filtering[i].operator == 'not_in') {
      if (!Array.isArray(this.props.table.state.view_filtering[i].value)) {
        this.props.table.state.view_filtering[i].value = this.props.table.state.view_filtering[i].value.split(",").map(x => x.trim());
      }
    } else {
      if (Array.isArray(this.props.table.state.view_filtering[i].value)) {
        this.props.table.state.view_filtering[i].value = this.props.table.state.view_filtering[i].value.join(",");
      }
    }
    this.props.table.setState({});
    this.props.table.onFilterChange();
  }
  onDeleteClick(x) {
    var i = Number(x.target.dataset['filterindex']);
    this.props.table.state.view_filtering.splice(i, 1);
    this.props.table.setState({});
    this.props.table.onFilterChange();
  }
  onAddClick(x) {
    this.props.table.state.view_filtering.push({
      column: this.props.table.state.table_columns[0].name,
      operator: "neq",
      value: ""
    });
    this.props.table.setState({});
    this.props.table.onFilterChange();
  }
  render() {
    var self = this;
    return h("section", {
      class: "section ctable-editor-section"
    }, h("div", {
      class: "ctable-editor-panel",
      style: sty("width", "min(" + self.props.width + "em,100%)")
    }, h("div", {
      class: "field has-text-right mb-0"
    }, h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-warning is-soft",
      onClick: self.props.onResetFilter
    }, h("span", {
      class: "material-symbols-outlined"
    }, "refresh"), " ", _("Reset"))), h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-soft",
      onClick: self.props.onCloseFilter
    }, h("span", {
      class: "material-symbols-outlined"
    }, "close"), " ", _("Close")))), self.props.table.state.view_filtering.map((x, i) => {
      return h("div", null, h("div", {
        class: "select"
      }, h("select", {
        value: x.column,
        "data-filterindex": i,
        onChange: self.onColumnChange
      }, self.props.table.state.table_columns.map(y => {
        return h("option", {
          value: y.name
        }, y.label);
      }))), h("div", {
        class: "select"
      }, h("select", {
        value: x.operator,
        "data-filterindex": i,
        onChange: self.onOperatorChange
      }, h("option", {
        value: "eq"
      }, "="), h("option", {
        value: "neq"
      }, "!="), h("option", {
        value: "ge"
      }, ">="), h("option", {
        value: "gt"
      }, ">"), h("option", {
        value: "le"
      }, "<="), h("option", {
        value: "lt"
      }, "<"), h("option", {
        value: "in"
      }, "IN"), h("option", {
        value: "not_in"
      }, "NOT IN"), h("option", {
        value: "is_null"
      }, "Is NULL"), h("option", {
        value: "is_not_null"
      }, "Is not NULL"), h("option", {
        value: "like_lr"
      }, "\u2026A\u2026"), h("option", {
        value: "like_l"
      }, "\u2026A"), h("option", {
        value: "like_r"
      }, "A\u2026"))), h("div", {
        style: "display: inline-block;"
      }, h("input", {
        class: "input",
        type: "text",
        value: x.value,
        "data-filterindex": i,
        onChange: self.onValueChange
      })), h("button", {
        class: "button is-danger is-soft",
        "data-filterindex": i,
        onClick: self.onDeleteClick
      }, h("span", {
        class: "material-symbols-outlined"
      }, "delete")));
    }), h("button", {
      class: "button is-primary is-soft mt-4",
      onClick: self.onAddClick
    }, " ", _("Add"), " "), h("div", {
      class: "field has-text-right mt-5"
    }, h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-warning is-soft",
      onClick: self.props.onResetFilter
    }, h("span", {
      class: "material-symbols-outlined"
    }, "refresh"), " ", _("Reset"))), h("div", {
      class: "has-text-centered m-2",
      style: "display:inline-block;"
    }, h("button", {
      class: "button is-small is-soft",
      onClick: self.props.onCloseFilter
    }, h("span", {
      class: "material-symbols-outlined"
    }, "close"), " ", _("Close"))))));
  }
}
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
      topline_buttons: [{
        name: "back",
        icon: "arrow_back",
        label: _("Go back"),
        enabled: false,
        style: "",
        icon_only: false,
        panel: 1
      }, {
        name: "enter",
        icon: "subdirectory_arrow_right",
        label: _("Enter"),
        enabled: false,
        style: "",
        icon_only: false,
        panel: 1
      }, {
        name: "enter",
        icon: "subdirectory_arrow_right",
        label: _("Enter"),
        enabled: false,
        style: "",
        icon_only: false,
        panel: 1
      }, {
        name: "enter",
        icon: "subdirectory_arrow_right",
        label: _("Enter"),
        enabled: false,
        style: "",
        icon_only: false,
        panel: 1
      }, {
        name: "enter",
        icon: "subdirectory_arrow_right",
        label: _("Enter"),
        enabled: false,
        style: "",
        icon_only: false,
        panel: 1
      }, {
        name: "enter",
        icon: "subdirectory_arrow_right",
        label: _("Enter"),
        enabled: false,
        style: "",
        icon_only: false,
        panel: 1
      }, {
        name: "add",
        icon: "add",
        label: _("Add"),
        enabled: true,
        style: "is-primary",
        icon_only: true,
        panel: 1
      }, {
        name: "edit",
        icon: "edit",
        label: _("Edit"),
        enabled: false,
        style: "is-warning",
        icon_only: true,
        panel: 1
      }, {
        name: "duplicate",
        icon: "content_copy",
        label: _("Duplicate"),
        enabled: false,
        style: "is-warning",
        icon_only: true,
        panel: 1
      }, {
        name: "delete",
        icon: "delete",
        label: _("Delete"),
        enabled: false,
        style: "is-danger",
        icon_only: true,
        panel: 1
      }, {
        name: "reload",
        icon: "refresh",
        label: _("Reload"),
        enabled: true,
        style: "",
        icon_only: true,
        panel: 0
      }, {
        name: "filter",
        icon: "filter_alt",
        label: _("Filter"),
        enabled: true,
        style: "",
        icon_only: true,
        panel: 0
      }, {
        name: "sort",
        icon: "sort",
        label: _("Sorting"),
        enabled: true,
        style: "",
        icon_only: true,
        panel: 0
      }, {
        name: "columns",
        icon: "list_alt",
        label: _("Columns"),
        enabled: true,
        style: "",
        icon_only: true,
        panel: 0
      }, {
        name: "select_mode",
        icon: "done",
        label: _("Simple select"),
        enabled: true,
        style: "",
        icon_only: true,
        panel: 0
      }, {
        name: "select_all",
        icon: "select_all",
        label: _("Select all"),
        enabled: true,
        style: "",
        icon_only: true,
        panel: 0
      }, {
        name: "clear_all",
        icon: "remove_selection",
        label: _("Clear all"),
        enabled: true,
        style: "",
        icon_only: true,
        panel: 0
      }, {
        name: "zoom_in",
        icon: "zoom_in",
        label: _("Zoom In"),
        enabled: true,
        style: "",
        icon_only: true,
        panel: 0
      }, {
        name: "zoom_out",
        icon: "zoom_out",
        label: _("Zoom Out"),
        enabled: true,
        style: "",
        icon_only: true,
        panel: 0
      }, {
        name: "zoom_reset",
        icon: "search",
        label: _("Reset Zoom"),
        enabled: false,
        style: "",
        icon_only: true,
        panel: 0
      }],
      view_columns: [],
      view_sorting: [],
      view_filtering: [],
      table_path: [],
      table_path_labels: [],
      table_columns: [],
      table_subtables: [],
      table_rows: [],
      table_row_status: [],
      table_options: {},
      return_keys: null,
      table_select_menu_active: false,
      editor_show: false,
      select_mode: 'one',
      columns_panel_show: false,
      sorting_panel_show: false,
      filtering_panel_show: false,
      editor_affected_rows: [],
      editor_changes: {},
      editor_operation: '',
      panel0_menu_active: false,
      panel1_menu_active: false,
      ask_dialog_active: false,
      ask_dialog_text: "text",
      ask_dialog_promise_resolve: null,
      ask_dialog_promise_reject: null
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
      if (default_table.length == 0) {
        default_table = [self.state.table_list[0]];
      }
      self.loadTable(default_table[0].name, null);
      self.setState({});
    });
  }
  resetColumns() {
    var self = this;
    self.state.view_columns = self.state.table_columns.map(x => {
      return {
        name: x.name,
        enabled: x.enabled
      };
    });
  }
  resetSorting() {
    var self = this;
    self.state.view_sorting = self.state.table_columns.map(x => {
      var sorting = self.state.current_table.default_sorting.filter(y => x.name in y);
      if (sorting.length > 0) {
        return {
          name: x.name,
          sorting: sorting[0][x.name]
        };
      } else {
        return {
          name: x.name,
          sorting: ""
        };
      }
    });
  }
  resetFiltering() {
    this.state.view_filtering = deep_copy(this.state.current_table.default_filtering);
  }
  loadTable(name, path_part) {
    var self = this;
    var table = self.state.table_list.filter(x => x.name == name)[0];
    this.hideAllEditors();
    let table_columns_p = self.props.server.CTableServer.columns(table.name);
    let table_subtables_p = self.props.server.CTableServer.subtables(table.name);
    Promise.all([table_columns_p, table_subtables_p]).then(mx => {
      var c, sb;
      [c, sb] = mx;
      self.state.current_table = table;
      self.state.width = table.width;
      self.state.table_columns = c;
      if (self.state.table_columns === null) {
        this.showError({
          code: -5,
          message: _("Columns configuration loading failure.")
        });
        return;
      }
      self.resetColumns();
      self.resetSorting();
      self.resetFiltering();
      self.state.table_subtables = sb;
      this.state.table_rows = [];
      this.state.table_row_status = [];
      if (path_part !== null) {
        this.state.view_columns = path_part.view_settings.view_columns;
        this.state.view_filtering = path_part.view_settings.view_filtering;
        this.state.view_sorting = path_part.view_settings.view_sorting;
        this.state.return_keys = path_part.keys;
      }
      self.setState({}, self.reloadData);
    });
  }
  reloadData() {
    this.setState({
      progress: true
    });
    var keys = [];
    if (this.state.return_keys === null) {
      keys = this.getAffectedKeys();
    } else {
      keys = [this.state.return_keys];
    }
    var sorting = this.state.view_sorting.filter(x => x.sorting != "").map(function (x) {
      return {
        [x.name]: x.sorting
      };
    });
    var filters = this.state.view_filtering.map(x => [x.operator, x.column, x.value]);
    let table_rows_p = this.props.server.CTableServer.select(this.full_table_path(), filters, sorting).then(r => {
      this.state.table_rows = r['rows'];
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
      this.state.return_keys = null;
      var cell_link_columns = this.state.table_columns.filter(x => x.cell_actor == "CLinkCell" || x.cell_actor == "CMultiLinkCell");
      var editor_link_columns = this.state.table_columns.filter(x => x.cell_actor == "CLinkEditor" || x.cell_actor == "CMutliLinkEditor");
      var link_columns_names = [];
      var link_columns_tables = [];
      var link_columns_table_columns = [];
      var link_columns_values = [];
      cell_link_columns.forEach(x => {
        if (link_columns_names.indexOf(x.name) < 0) {
          link_columns_names.push(x.name);
          link_columns_tables.push(x.cell_link);
          link_columns_table_columns.push(x.cell_link_key);
          link_columns_values.push([]);
        }
      });
      editor_link_columns.forEach(x => {
        if (link_columns_names.indexOf(x.name) < 0) {
          link_columns_names.push(x.name);
          link_columns_tables.push(x.editor_link);
          link_columns_table_columns.push(x.editor_link_key);
          link_columns_values.push([]);
        }
      });
      this.state.table_rows.forEach(x => {
        link_columns_names.forEach((y, i) => {
          if (link_columns_values[i].indexOf(x[y]) < 0) {
            if (typeof x[y] === "string") {
              if (x[y] !== "") {
                x[y].split(";").forEach(z => {
                  link_columns_values[i].push(parseInt(z));
                });
              }
            } else if (x[y] !== null) {
              link_columns_values[i].push(x[y]);
            }
          }
        });
      });
      this.state.table_options = {};
      var full_path = this.full_table_path();
      var table_option_p = link_columns_names.map((x, i) => {
        full_path[full_path.length - 1].table = link_columns_tables[i];
        return this.props.server.CTableServer.options(full_path, [["in", link_columns_table_columns[i], link_columns_values[i]]]).then(w => {
          this.state.table_options[link_columns_tables[i]] = {};
          w.rows.forEach(q => {
            this.state.table_options[link_columns_tables[i]][q[link_columns_table_columns[i]]] = q[w.label];
          });
        });
      });
      Promise.all(table_option_p).then(x => {
        this.setState({}, () => {
          this.enablePanelButtons();
        });
      });
    }).catch(e => {
      this.showError(e);
      this.setState({
        progress: false
      });
    });
  }
  getOptionsForField(column_name, query) {
    var column = this.state.table_columns.filter(x => x.name == column_name)[0];
    var full_path = this.full_table_path();
    full_path[full_path.length - 1].table = column.editor_link;
    if (query != "") {
      return this.props.server.CTableServer.options(full_path, [["like_lr", "name", query]]);
    }
    return this.props.server.CTableServer.options(full_path);
  }
  topButtonClick(e) {
    var tg = unwind_button_or_link(e);
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
    if (tg.dataset['name'] == "select_mode") {
      if (this.state.select_mode == "one") {
        this.state.select_mode = "all";
        this.state.topline_buttons.filter(x => {
          return x.name == "select_mode";
        }).forEach(w => {
          w.icon = "done_all";
          w.label = _("Sticky select");
        });
      } else {
        this.state.select_mode = "one";
        this.state.topline_buttons.filter(x => {
          return x.name == "select_mode";
        }).forEach(w => {
          w.icon = "done";
          w.label = _("Simple select");
        });
      }
      this.setState({}, () => this.enablePanelButtons());
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
    if (tg.dataset['name'] == "enter") {
      var self = this;
      var gk = this.getAffectedKeys()[0];
      var subtab = this.state.table_subtables.filter(x => x.name == tg.dataset['table'])[0];
      var key_const = [];
      Object.keys(gk).forEach(k => {
        key_const.push(["eq", k, gk[k]]);
      });
      this.props.server.CTableServer.options(this.full_table_path(), key_const).then(r => {
        var uid_str = [];
        r["keys"].forEach(k => {
          uid_str.push(r["rows"][0][k]);
        });
        this.state.table_path_labels.push(r["rows"][0][r["label"]] + " (" + uid_str.join(",") + ")");
        self.setState({});
      }).catch(e => {
        this.showError(e);
      });
      this.state.table_path.push({
        table: this.state.current_table.name,
        keys: gk,
        label: this.state.current_table.label,
        mapping: subtab.mapping,
        view_settings: deep_copy({
          view_columns: this.state.view_columns,
          view_filtering: this.state.view_filtering,
          view_sorting: this.state.view_sorting
        }),
        table_row_status: deep_copy(this.state.table_row_status)
      });
      this.hideAllEditors();
      this.loadTable(tg.dataset['table'], null);
      return;
    }
    if (tg.dataset['name'] == "back") {
      this.state.table_path_labels.pop();
      var path_part = this.state.table_path.pop();
      this.hideAllEditors();
      this.loadTable(path_part.table, path_part);
      return;
    }
    if (tg.dataset['name'] == "columns") {
      if (this.state.columns_panel_show) {
        this.setState({
          columns_panel_show: false
        });
      } else {
        this.hideAllEditors();
        this.setState({
          columns_panel_show: true
        });
      }
      return;
    }
    if (tg.dataset['name'] == "sort") {
      if (this.state.sorting_panel_show) {
        this.setState({
          sorting_panel_show: false
        });
      } else {
        this.hideAllEditors();
        this.setState({
          sorting_panel_show: true
        });
      }
      return;
    }
    if (tg.dataset['name'] == "filter") {
      if (this.state.filtering_panel_show) {
        this.setState({
          filtering_panel_show: false
        });
      } else {
        this.hideAllEditors();
        this.setState({
          filtering_panel_show: true
        });
      }
      return;
    }
    if (tg.dataset['name'] == "reload") {
      this.reloadData();
      return;
    }
    if (tg.dataset['name'] == "add") {
      this.hideAllEditors();
      this.setState({
        editor_show: true,
        editor_affected_rows: [],
        editor_changes: {},
        editor_operation: 'add'
      });
      return;
    }
    if (tg.dataset['name'] == "edit") {
      var nrecords = this.getAffectedKeys().length;
      if (nrecords == 0) return; // no rows affected
      this.hideAllEditors();
      this.setState({
        editor_show: true,
        editor_affected_rows: this.state.table_rows.filter((x, i) => this.state.table_row_status[i].selected),
        editor_changes: {},
        editor_operation: 'edit'
      });
      return;
    }
    if (tg.dataset['name'] == "duplicate") {
      var nrecords = this.getAffectedKeys().length;
      if (nrecords == 0) return; // no rows affected
      this.askUser(N_("Duplicate %d record?", "Duplicate %d records?", nrecords)).then(() => {
        this.setState({
          progress: true
        });
        this.props.server.CTableServer.duplicate(this.full_table_path(), this.getAffectedKeys()).then(() => {
          this.reloadData();
        }).catch(e => {
          this.showError(e);
          this.setState({
            progress: false
          });
        });
      }, () => {});
    }
    if (tg.dataset['name'] == "delete") {
      var nrecords = this.getAffectedKeys().length;
      if (nrecords == 0) return; // no rows affected
      this.askUser(N_("Delete %d record?", "Delete %d records?", nrecords)).then(() => {
        this.setState({
          progress: true
        });
        this.props.server.CTableServer.delete(this.full_table_path(), this.getAffectedKeys()).then(() => {
          this.reloadData();
        }).catch(e => {
          this.showError(e);
          this.setState({
            progress: false
          });
        });
      }, () => {});
    }
  }
  full_table_path() {
    var path = this.state.table_path.map(x => {
      return {
        table: x.table,
        keys: x.keys,
        mapping: x.mapping
      };
    });
    return [].concat(path, [{
      table: this.state.current_table.name
    }]);
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
  getKeysFromRow(row) {
    var keys = this.state.table_columns.filter(x => x.is_key).map(x => x.name);
    var res = {};
    keys.forEach(k => {
      res[k] = row[k];
    });
    return res;
  }
  headerXScroll(e) {
    document.querySelector(".ctable-scroll-main-table").scrollLeft = e.target.scrollLeft;
  }
  tableXScroll(e) {
    document.querySelector(".ctable-scroll-head-table").scrollLeft = e.target.scrollLeft;
  }
  onRowClick(e) {
    if (this.state.editor_show == true) return;
    this.state.table_return = {};
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
    if (this.state.select_mode == "one") {
      this.state.table_row_status.forEach(x => {
        x.selected = false;
      });
    }
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
    var self = this;
    this.state.topline_buttons.filter(x => x.name == "back").forEach(x => x.enabled = self.state.table_path.length > 0);
    if (sel_count == 1 && this.state.table_subtables.length > 0) {
      this.state.table_subtables.forEach(function (t, i) {
        self.state.topline_buttons.filter(x => x.name == "enter").forEach((x, j) => {
          if (i == j) {
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
  onTableSelectDropdownClick() {
    this.setState({
      table_select_menu_active: !this.state.table_select_menu_active
    });
  }
  onTableSelectClick(x) {
    var tbl = this.state.table_list.filter(y => y.name == unwind_button_or_link(x).dataset.label)[0];
    this.setState({
      table_select_menu_active: false,
      table_path_labels: [],
      table_path: []
    });
    this.loadTable(tbl.name, null);
  }
  onSaveClick() {
    if (Object.keys(this.state.editor_changes).filter(x => this.state.editor_changes[x].valid == false).length > 0) {
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
      this.props.server.CTableServer.insert(this.full_table_path(), data_to_send).then(() => {
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
      var nrecords = this.state.editor_affected_rows.length;
      if (nrecords == 0) return; // no rows affected
      if (nrecords == 1) {
        this.setState({
          editor_show: false,
          progress: true
        });
        this.props.server.CTableServer.update(this.full_table_path(), this.getAffectedKeys(), data_to_send).then(() => {
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
      } else {
        this.askUser(N_("Update %d record?", "Update %d records?", nrecords)).then(() => {
          this.setState({
            editor_show: false,
            progress: true
          });
          this.props.server.CTableServer.update(this.full_table_path(), this.getAffectedKeys(), data_to_send).then(() => {
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
        }, () => {});
      }
    }
  }
  hideAllEditors() {
    this.setState({
      sorting_panel_show: false,
      columns_panel_show: false,
      editor_show: false
    });
  }

  /**
   * Show error for user
   *
   * @arg e {Object} Error object
   * @arg e.code {Integer} Error code
   * @arg e.message {String} Error text message
   */

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

  /**
   * Callback for very changes in editor
   *
   * @arg colname {string} Column name
   * @arg is_modified {bool} Is modified
   * @arg value {*} Column value
   * @arg valid {bool} Is vaid
   */

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
  onCloseColumns() {
    this.setState({
      columns_panel_show: false
    });
  }
  onResetColumns() {
    this.resetColumns();
    this.setState({});
  }
  onSortingChange() {
    this.reloadData();
  }
  onFilterChange() {
    this.reloadData();
  }
  onResetSorting() {
    this.resetSorting();
    this.setState({});
    this.reloadData();
  }
  onCloseSorting() {
    this.setState({
      sorting_panel_show: false
    });
    this.reloadData();
  }
  onResetFilter() {
    this.resetFiltering();
    this.setState({});
    this.reloadData();
  }
  onCloseFilter() {
    this.setState({
      filtering_panel_show: false
    });
    this.reloadData();
  }
  onApplySorting() {
    this.reloadData();
  }
  onPanel0DropdownClick() {
    this.setState({
      panel0_menu_active: !this.state.panel0_menu_active
    });
  }
  onPanel1DropdownClick() {
    this.setState({
      panel1_menu_active: !this.state.panel1_menu_active
    });
  }

  /**
   * Callback for ask a question to user
   *
   * @arg question {string} Question text
   * @return {Promise} Promise which resolve if user select Yes and reject in No
   */

  askUser(question) {
    return new Promise((resolve, reject) => {
      this.setState({
        ask_dialog_text: question,
        ask_dialog_active: true,
        ask_dialog_promise_resolve: resolve,
        ask_dialog_promise_reject: reject
      });
    });
  }
  userResolveYes() {
    this.setState({
      ask_dialog_active: false
    });
    this.state.ask_dialog_promise_resolve();
  }
  userResolveNo() {
    this.setState({
      ask_dialog_active: false
    });
    this.state.ask_dialog_promise_reject();
  }

  /**
   * Callback for downloading file
   *
   * @arg row {Object} Current row
   * @arg column {Object} Current column
   * @arg index {Integer} Index of downloading file in column
   */

  onDownloadFile(row, column, index) {
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

  onUploadFile(row, column, index, files) {
    var self = this;
    self.setState({
      progress: true
    });
    var prm = this.props.server.upload(files);
    prm.then(x => {
      self.setState({
        progress: false
      });
    });
    return prm;
  }
  render() {
    var self = this;
    return h("div", null, h("div", {
      class: cls("modal", self.state.ask_dialog_active ? "is-active" : "")
    }, h("div", {
      class: "modal-background",
      onClick: this.userResolveNo
    }), h("div", {
      class: "modal-content"
    }, h("div", {
      class: "mb-4",
      style: "font-weight: bold;"
    }, h("p", null, self.state.ask_dialog_text)), h("div", {
      class: "has-text-center"
    }, h("button", {
      class: "button is-primary is-soft mr-4",
      style: "min-width: 8em;",
      onClick: this.userResolveYes
    }, _("Yes")), h("button", {
      class: "button is-warning is-soft",
      style: "min-width: 8em;",
      onClick: this.userResolveNo
    }, _("No")))), h("button", {
      class: "modal-close is-large",
      "aria-label": "close",
      onClick: this.userResolveNo
    })), h("section", {
      class: "section pt-3 pb-0 pl-0 pr-0 ctable-top-panel"
    }, h("div", {
      class: "ctable-top-panel-block",
      style: sty("max-width", self.state.width + 2 + "em")
    }, h("div", {
      class: "pl-3 pr-2"
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
      style: "display:inline-block;"
    }, self.state.table_path_labels.map(x => h(Fragment, null, h("span", {
      class: "material-symbols-outlined-small"
    }, "check_box"), "\xA0", x, "\xA0")), h(Fragment, null, h("span", {
      class: "material-symbols-outlined-small"
    }, "lists"), "\xA0", self.state.current_table.label, "\xA0")))), h("td", {
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
      class: "ctable-command-panel"
    }, h("div", {
      class: "ctable-button-row"
    }, h("div", {
      class: "ctable-button-row-left"
    }, self.state.topline_buttons.filter(x => x.enabled && x.panel == 0).map(x => h("div", {
      class: "has-text-centered m-1",
      style: "display:inline-block;"
    }, h("button", {
      class: cls("button", "is-small", "is-soft", x.style),
      "data-name": x.name,
      onClick: this.topButtonClick,
      title: x.label
    }, h("span", {
      class: "material-symbols-outlined"
    }, x.icon), x.icon_only ? "" : " " + x.label)))), h("div", {
      class: "ctable-button-row-right has-text-right"
    }, h("div", {
      class: cls("dropdown", "is-right", self.state.panel0_menu_active ? "is-active" : "")
    }, h("div", {
      class: "dropdown-trigger"
    }, h("button", {
      class: "button is-small",
      "aria-haspopup": "true",
      "aria-controls": "dropdown-menu-panel0",
      onClick: this.onPanel0DropdownClick
    }, h("span", {
      class: "icon"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "build")), h("span", {
      class: "icon is-small"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "arrow_drop_down")))), h("div", {
      class: "dropdown-menu",
      id: "dropdown-menu-panel0",
      role: "menu"
    }, h("div", {
      class: "dropdown-content has-text-left"
    }, self.state.topline_buttons.filter(x => x.enabled && x.panel == 0).map(x => h("a", {
      class: cls("dropdown-item", x.style),
      "data-name": x.name,
      onClick: this.topButtonClick,
      "data-table": x.table
    }, h("span", {
      class: "material-symbols-outlined-small"
    }, x.icon), " ", x.label))))))), h("div", {
      class: "ctable-button-row"
    }, h("div", {
      class: "ctable-button-row-left"
    }, self.state.topline_buttons.filter(x => x.enabled && x.panel == 1).map(x => h("div", {
      class: "has-text-centered m-1",
      style: "display:inline-block;"
    }, h("button", {
      class: cls("button", "is-small", "is-soft", x.style),
      "data-name": x.name,
      onClick: this.topButtonClick,
      title: x.label,
      "data-table": x.table
    }, h("span", {
      class: "material-symbols-outlined"
    }, x.icon), x.icon_only ? "" : " " + x.label)))), h("div", {
      class: "ctable-button-row-right has-text-right"
    }, h("div", {
      class: cls("dropdown", "is-right", self.state.panel1_menu_active ? "is-active" : "")
    }, h("div", {
      class: "dropdown-trigger"
    }, h("button", {
      class: "button is-small",
      "aria-haspopup": "true",
      "aria-controls": "dropdown-menu-panel1",
      onClick: this.onPanel1DropdownClick
    }, h("span", {
      class: "icon"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "more_vert")), h("span", {
      class: "icon is-small"
    }, h("span", {
      class: "material-symbols-outlined"
    }, "arrow_drop_down")))), h("div", {
      class: "dropdown-menu",
      id: "dropdown-menu-panel1",
      role: "menu"
    }, h("div", {
      class: "dropdown-content has-text-left"
    }, self.state.topline_buttons.filter(x => x.enabled && x.panel == 1).map(x => h("a", {
      class: cls("dropdown-item", "is-soft", x.style),
      "data-name": x.name,
      onClick: this.topButtonClick
    }, h("span", {
      class: "material-symbols-outlined-small"
    }, x.icon), " ", x.label)))))))), h(CHeaderTable, {
      width: self.state.width,
      fontSize: self.state.fontSize,
      table: self,
      columns: self.state.table_columns,
      view_columns: self.state.view_columns,
      view_sorting: self.state.view_sorting,
      view_filtering: self.state.view_filtering,
      onHeaderXScroll: self.headerXScroll,
      progress: self.state.progress
    }))), h(CPageTable, {
      width: self.state.width,
      fontSize: self.state.fontSize,
      table: self,
      columns: self.state.table_columns,
      view_columns: self.state.view_columns,
      row_status: self.state.table_row_status,
      rows: self.state.table_rows,
      onRowClick: self.onRowClick,
      onTableXScroll: self.tableXScroll,
      editorShow: self.state.editor_show || self.state.sorting_panel_show || self.state.columns_panel_show || self.state.filtering_panel_show
    }), self.state.editor_show ? h(CEditorPanel, {
      width: self.state.width,
      table: self,
      columns: self.state.table_columns,
      affectedRows: self.state.editor_affected_rows,
      noSaveClick: self.onSaveClick,
      noCancelClick: self.onCancelClick,
      onEditorChanges: self.onEditorChanges
    }) : "", self.state.columns_panel_show ? h(CColumnsPanel, {
      width: self.state.width,
      table: self,
      onColumnChange: self.onColumnChange,
      onResetColumns: self.onResetColumns,
      onCloseColumns: self.onCloseColumns
    }) : "", self.state.sorting_panel_show ? h(CSortingPanel, {
      width: self.state.width,
      table: self,
      onResetSorting: self.onResetSorting,
      onCloseSorting: self.onCloseSorting,
      onSortingChange: self.onSortingChange
    }) : "", self.state.filtering_panel_show ? h(CFilterPanel, {
      width: self.state.width,
      table: self,
      onResetFilter: self.onResetFilter,
      onCloseFilter: self.onCloseFilter,
      onChangeFilter: self.onFilterChange
    }) : "");
  }
}
var ctable_lang_ru = {
  "": {
    "project-id-version": "ctable 3",
    "report-msgid-bugs-to": "",
    "pot-creation-date": "2025-10-11 14:33+0300",
    "po-revision-date": "2025-05-20 01:28+0300",
    "last-translator": "Automatically generated",
    "language-team": "none",
    "language": "ru",
    "mime-version": "1.0",
    "content-type": "text/plain; charset=UTF-8",
    "content-transfer-encoding": "8bit",
    "plural-forms": "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);",
    "x-language": "ru_RU",
    "x-source-language": "C"
  },
  "Yes": [null, "Да"],
  "No": [null, "Нет"],
  "Reset": [null, "Сбросить"],
  "Close": [null, "Закрыть"],
  "Add": [null, "Добавить"],
  "Save": [null, "Сохранить"],
  "Save all": [null, "Сохранить все"],
  "Cancel": [null, "Отменить"],
  "%d Byte": ["%d Bytes", "%d Байт", "%d Байта", "%d Байтов"],
  "%d KiB": ["%d KiB", "%d КБайт", "%d КБайта", "%d КБайтов"],
  "%d MiB": ["%d MiB", "%d МБайт", "%d МБайта", "%d МБайтов"],
  "%d GiB": ["%d GiB", "%d ГБайт", "%d ГБайта", "%d ГБайтов"],
  "File \"%s\" is too large for upload": [null, "Файл \"%s\" слишком велик для загрузки"],
  "File \"%s\" extention has not allowed": [null, "Файл \"%s\" имеет расширение не разрешенное для загрузки"],
  "Remove uploaded file?": [null, "Удалить загруженный файл?"],
  "Upload...": [null, "Загрузить..."],
  "Go back": [null, "Выйти"],
  "Enter": [null, "Войти"],
  "Edit": [null, "Правка"],
  "Duplicate": [null, "Создать копию"],
  "Delete": [null, "Удалить"],
  "Reload": [null, "Перезагрузить"],
  "Filter": [null, "Фильтр"],
  "Sorting": [null, "Сортировка"],
  "Columns": [null, "Столбцы"],
  "Simple select": [null, "Простой выбор"],
  "Select all": [null, "Выбрать все"],
  "Clear all": [null, "Очистить все"],
  "Zoom In": [null, "Увеличить"],
  "Zoom Out": [null, "Уменьшить"],
  "Reset Zoom": [null, "Сбросить масштаб"],
  "Columns configuration loading failure.": [null, "Ошибка при загрузке информации о столбцах таблицы."],
  "Sticky select": [null, "Выбор с накоплением"],
  "Duplicate %d record?": ["Duplicate %d records?", "Создать копию %d записи?", "Создать копию %d записей?", "Создать копию %d записей?"],
  "Delete %d record?": ["Delete %d records?", "Удалить %d запись?", "Удалить %d записи?", "Удалить %d записей?"],
  "Update %d record?": ["Update %d records?", "Обновить %d запись?", "Обновить %d записи?", "Обновить %d записей?"]
};

//# sourceMappingURL=ctable.js.map