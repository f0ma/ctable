/**
 * Select column.
 *
 * This column for selecting from dropdown.
 *
 * @arg {List[]} this.props.options - Options list.
 * @arg {string} this.props.options[].0 - Key.
 * @arg {string} this.props.options[].1 - Text.
 */

class CSelectColumn extends CTableColumn{
    constructor() {
        super();
        this.state = {options: []}
        this.ref = createRef();
    }

    componentDidMount() {
        this.setState({options: this.props.options});
    }

    render_cell() {
        var cvalues = this.state.options.filter(item => item[0] == this.value());
        if (cvalues.length > 0){
            return <span>{cvalues[0][1]}</span>;
        }
        return <span></span>;

    }

    filterChanged = e => {
        this.props.table.change_filter_for_column(this.props.column, e.target.value);
    }

    render_search() {
        if (typeof this.props.filtering === 'undefined') {
            // do nothing
        } else {
            return <div class="select">
                     <select onChange={this.filterChanged} value={this.props.filtering}>
                       <option value=''>{this.props.table.props.lang.no_filter}</option>
                       {this.state.options.map(item => <option value={item[0]}>{item[1]}</option>)}
                     </select>
                   </div>;
        }
    }

    editorChanged = e => {
        this.props.table.notify_changes(this.props.row, this.props.column, e.target.value);
    }

    render_editor() {
        return <div class="field" ref={this.ref}>
                   <label class="label">{this.title()}</label>
                   <div class="control">
                      <div class="select">
                        <select onChange={this.editorChanged} value={this.value()}>
                          {this.state.options.map(item => <option value={item[0]}>{item[1]}</option>)}
                        </select>
                      </div>
                   </div>
                   {this.props.footnote ? <div class="help">{this.props.footnote}</div> : ''}
               </div>;
    }
}

