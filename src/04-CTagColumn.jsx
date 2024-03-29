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

class CTagColumn extends CTableColumn{
    constructor() {
        super();

        this.filterChanged = this.filterChanged.bind(this);
        this.addClicked = this.addClicked.bind(this);
        this.deleteClicked = this.deleteClicked.bind(this);
        this.showTagPanel = this.showTagPanel.bind(this);
        this.hideTagPanel = this.hideTagPanel.bind(this);


        this.state = {options: [], values: [], editor_panel_opened:false}
        this.ref = createRef();
    }

    componentDidMount() {
        this.setState({values: this.value() === null ? [] : this.value().split(","),
                       editor_panel_opened:false});

        if (typeof this.props.endpoint === 'undefined') {
            this.setState({options: this.props.options})
        } else {
            this.props.table.load_options(this.props.endpoint, this.props.params, this, this.ref);
        }
    }

    showTagPanel(e){
        if(e.target.classList.contains("delete")) return;
        this.setState({editor_panel_opened:true});
    }

    hideTagPanel(){
        this.setState({editor_panel_opened:false});
    }

    render_cell() {
        var self = this;
        var cvl = this.value() === null ? [] : this.value().split(",");
        var cvalues = this.state.options.filter(function(item){return cvl.indexOf(item[0]) != -1;});
        return <div class="tags">{cvalues.map(function(c,i){ return <span class="tag is-medium">{c[1]}</span>; })}</div>;
    }

    filterChanged(e) {
        if(e.target.value == ''){
            this.props.table.change_search_for_column(this.props.column, null);
        } else {
            this.props.table.change_search_for_column(this.props.column, e.target.value);
        }
    }

    render_search() {
        if (typeof this.props.searching === 'undefined') {
            // do nothing
        } else {
            return <div class="select">
                     <select onChange={this.filterChanged} value={this.props.searching}>
                       <option value=''>{this.props.table.props.lang.no_filter}</option>
                       {this.state.options.map(function(item){return <option value={item[0]}>{item[1]}</option>; })}
                     </select>
                   </div>;
        }
    }

    deleteClicked(e){
        var tag = e.target.dataset.tagname;
        var del_filtred = this.state.values.filter(function(item){return item != tag;});
        this.setState({values: del_filtred});
        this.props.table.notify_changes(this.props.row, this.props.column, del_filtred === [] ? null : del_filtred.join(','));
    }

    addClicked(e){
        e.preventDefault();
        if(!this.state.values.includes(e.target.dataset.tagname)){
            var add_filtred = this.state.values.concat(e.target.dataset.tagname);
            this.setState({values: add_filtred});
            this.props.table.notify_changes(this.props.row, this.props.column, add_filtred === [] ? null : add_filtred.join(','));
        }
    }

    render_editor() {
        var self = this;
        var alltag = <div class="tags" style="margin-left: 1em; margin-right: 1em;">{this.state.options.map(function(c,i){ return <span class="tag button" data-tagname={c[0]} onMouseDown={self.addClicked}>{c[1]}</span>; })}</div>;
        var cvalues = this.state.options.filter(function(item){return self.state.values.indexOf(item[0]) != -1;});
        var taglist = <div class="tags" style="margin-right: 2em;">{cvalues.map(function(c,i){ return <span class="tag">{c[1]}<button class="delete is-small" data-tagname={c[0]} onClick={self.deleteClicked}></button></span>; })}</div>;

        return <div class="field" ref={this.ref}>
                   <label class="label">{this.title()}</label>
                   <div class="control">
                       <div class={this.state.editor_panel_opened ? "dropdown is-active" : "dropdown"} style="width: 100%;">
                         <div class="dropdown-trigger" style="width: 100%;">
                           <button class="input select" onClick={this.showTagPanel} onBlur={this.hideTagPanel}>{taglist}</button>
                         </div>
                         <div class="dropdown-menu" id="dropdown-menu" role="menu">
                           <div class="dropdown-content">
                             {alltag}
                           </div>
                         </div>
                       </div>
                   </div>
                   {this.props.footnote ? <div class="help">{this.props.footnote}</div> : ''}
               </div>;
    }
}

