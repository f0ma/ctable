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


class CTextColumn extends CTableColumn{
    constructor() {
        super();

        this.editorChanged = this.editorChanged.bind(this);
        this.hintClicked = this.hintClicked.bind(this);

        this.ref = createRef();
    }

    componentDidMount() {
        this.setState({editor_valid: true, value: this.value()});
    }

    render_cell() {
        return <span>{this.value()}</span>;
    }

    editorChanged(e) {
        var ed_value = null;
        if (e.target.tagName == 'DIV'){
            ed_value = e.target.innerHTML;
        } else {
            ed_value = e.target.value;
        }

        this.setState({value: ed_value});
        this.props.table.notify_changes(this.props.row, this.props.column, ed_value);
        if (this.props.validate){
            if (ed_value.match(this.props.validate)) {
                this.props.table.notify_valids(this.props.row, this.props.column, true);
                this.setState({editor_valid: true});
            } else {
                this.props.table.notify_valids(this.props.row, this.props.column, false);
                this.setState({editor_valid: false});
            }
        }
    }

    hintClicked(e) {
        var result = this.state.value !== null ? this.state.value + e.target.dataset.hintvalue : e.target.dataset.hintvalue;
        this.setState({value: result});
        this.props.table.notify_changes(this.props.row, this.props.column, result);
    }

    execRoleCommand(e) {
        var role = e.target.dataset.role ?? e.target.parentElement.dataset.role;
        document.execCommand(role, false, null);
    }

    render_editor() {

        var form_control = null;
        var self = this;

        if (this.props.textarea == true){
            form_control = <textarea class={!this.state.editor_valid ? "textarea is-danger" : "textarea"} onChange={this.editorChanged} placeholder={this.props.placeholder}>{this.state.value}</textarea>;
        }

        if (this.props.richtext == true){
            form_control = <>
                <div style='text-align:center; padding:5px;'>
                  <span class='is-grouped'>
                    <a class='button' data-role='undo' onClick={this.execRoleCommand}><span class="material-icons">undo</span></a>
                    <a class='button' data-role='redo' onClick={this.execRoleCommand}><span class="material-icons">redo</span></a>
                  </span>
                  <span class='is-grouped'>
                    <a class='button' data-role='bold' onClick={this.execRoleCommand}><span class="material-icons">format_bold</span></a>
                    <a class='button' data-role='italic' onClick={this.execRoleCommand}><span class="material-icons">format_italic</span></a>
                    <a class='button' data-role='underline' onClick={this.execRoleCommand}><span class="material-icons">format_underlined</span></a>
                    <a class='button' data-role='strikeThrough' onClick={this.execRoleCommand}><span class="material-icons">format_strikethrough</span></a>
                  </span>
                  <span class='is-grouped'>
                    <a class='button' data-role='justifyLeft' onClick={this.execRoleCommand}><span class="material-icons">format_align_left</span></a>
                    <a class='button' data-role='justifyCenter' onClick={this.execRoleCommand}><span class="material-icons">format_align_center</span></a>
                    <a class='button' data-role='justifyRight' onClick={this.execRoleCommand}><span class="material-icons">format_align_right</span></a>
                    <a class='button' data-role='justifyFull' onClick={this.execRoleCommand}><span class="material-icons">format_align_justify</span></a>
                  </span>
                  <span class='is-grouped'>
                    <a class='button' data-role='indent' onClick={this.execRoleCommand}><span class="material-icons">format_indent_increase</span></a>
                    <a class='button' data-role='outdent' onClick={this.execRoleCommand}><span class="material-icons">format_indent_decrease</span></a>
                  </span>
                  <span class='is-grouped'>
                    <a class='button' data-role='insertUnorderedList' onClick={this.execRoleCommand}><span class="material-icons">format_list_bulleted</span></a>
                    <a class='button' data-role='insertOrderedList' onClick={this.execRoleCommand}><span class="material-icons">format_list_numbered</span></a>
                  </span>
                  <span class='is-grouped'>
                    <a class='button' data-role='subscript' onClick={this.execRoleCommand}><span class="material-icons">subscript</span></a>
                    <a class='button' data-role='superscript' onClick={this.execRoleCommand}><span class="material-icons">superscript</span></a>
                  </span>
                </div>
                <div class={!this.state.editor_valid ? "textarea is-danger ctable-wysiwyg-editor" : "textarea ctable-wysiwyg-editor"} onfocusout={this.editorChanged} dangerouslySetInnerHTML={{ __html:this.state.value}} contenteditable></div></>;
        }

        if (form_control === null){
            form_control = <input class={!this.state.editor_valid ? "input is-danger" : "input"} type="text" value={this.state.value} onChange={this.editorChanged} placeholder={this.props.placeholder}/>;
        }

        return <div class="field" ref={this.ref}>
                   <label class="label">{this.title()}</label>
                   <div class="control">
                       {form_control}
                   </div>
                   {this.props.input_hints ? <div class="tags"  style="margin-top: 0.2em;">{this.props.input_hints.map(function(c,i){ return <span class="tag button" data-hintvalue={c[0]} onClick={self.hintClicked}>{c[1]}</span>; })}</div> : ''}
                   {this.props.footnote ? <div class="help">{this.props.footnote}</div> : ''}
               </div>;
    }
}

