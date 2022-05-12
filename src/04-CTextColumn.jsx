/**
 * Text edit class.
 *
 * This column for text editing.
 *
 * @arg this.props.textarea {undefined|Boolean} Switch editor to textarea.
 * @arg this.props.placeholder {string} Placeholder for column editor.
 * @arg this.props.validate {undefined|string} Input validation regex.
 */


class CTextColumn extends CTableColumn{
    constructor() {
        super();

        this.editorChanged = this.editorChanged.bind(this);

        this.ref = createRef();
    }

    componentDidMount() {
        this.setState({editor_valid: true, value: this.value()});
    }

    render_cell() {
        return <span>{this.value()}</span>;
    }

    editorChanged(e) {
        this.setState({value: e.target.value});
        this.props.table.notify_changes(this.props.row, this.props.column, e.target.value);
        if (this.props.validate){
            if (e.target.value.match(this.props.validate)) {
                this.props.table.notify_valids(this.props.row, this.props.column, true);
                this.setState({editor_valid: true});
            } else {
                this.props.table.notify_valids(this.props.row, this.props.column, false);
                this.setState({editor_valid: false});
            }
        }
    }

    render_editor() {

        var textarea = <textarea class={!this.state.editor_valid ? "textarea is-danger" : "textarea"} onChange={this.editorChanged} placeholder={this.props.placeholder}>{this.state.value}</textarea>;
        var input = <input class={!this.state.editor_valid ? "input is-danger" : "input"} type="text" value={this.state.value} onChange={this.editorChanged} placeholder={this.props.placeholder}/>;

        return <div class="field" ref={this.ref}>
                   <label class="label">{this.title()}</label>
                   <div class="control">
                       {this.props.textarea == true ? textarea : input}
                   </div>
                    {this.props.footnote ? <div class="help">{this.props.footnote}</div> : ''}
               </div>;
    }
}

