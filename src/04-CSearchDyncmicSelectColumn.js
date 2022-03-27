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
            menu_active:false,
            menu_id: makeID(),
            input_id: makeID(),
            selected_id: makeID(),
            current_item:null,
            filter_text:'',
            top_index: -1
        };
    }

    componentDidMount() {
        this.setState({current_item:this.props.value});
    }

    value2text(value){
        var items = this.props.options.filter(function(item){return value == item[0]; });
        if(items.length == 1){
            return items[0][1];
        }
        return '';
    }

    dropdownMenuEnter(e){
        this.setState({menu_active: true});
        var self = this;
        setTimeout(function () {document.getElementById(self.state.input_id).focus();} ,100);
    }

    dropdownMenuLeave(e){
        if(e.relatedTarget !== null && e.relatedTarget.id == this.state.input_id){
            return;
        }

        this.setState({menu_active: false});

        if(e.relatedTarget !== null){
            e.relatedTarget.click();
        }
    }

    filterCleared(e){
        this.setState({current_item:null, filter_text: '', top_index: -1});
        this.props.valueChanged(null);
    }

    menuFilterCleared(e){
        this.setState({filter_text: '', top_index: -1});
    }

    menuFilterChanged(e){
        var aw_options = this.available_options();
        var self = this;

        if (e.key == "Enter"){
            e.preventDefault();

            if (aw_options.length == 0) return;
            if (this.state.top_index == -1) return;

            this.setState({top_index: -1,
                           menu_active: false,
                           current_item: aw_options[this.state.top_index][0],
                           filter_text: ''});
            this.props.valueChanged(aw_options[this.state.top_index][0]);
            return;
        }

        if(e.key == "ArrowDown"){
            if (this.state.top_index+1 < aw_options.length){
                this.setState({top_index: this.state.top_index + 1});
                setTimeout(function () {document.getElementById(self.state.selected_id).scrollIntoView();}, 50);
            }
            return;
        }

        if(e.key == "ArrowUp"){
            if (this.state.top_index-1 >=-1){
                this.setState({top_index: this.state.top_index - 1});
                setTimeout(function () {document.getElementById(self.state.selected_id).scrollIntoView();}, 50);
            }
            return;
        }

        this.setState({filter_text: e.target.value, top_index: -1});
    }

    menuItemClicked(e){
        e.preventDefault();
        this.setState({menu_active: false,
                       current_item: e.target.dataset['value'],
                       filter_text: '',
                       top_index: -1
        });
        this.props.valueChanged(e.target.dataset['value']);
    }

    available_options(){
        var aw_options = this.props.options;
        var self = this;

        if(this.state.filter_text != ""){
            var lowtext = self.state.filter_text.toLowerCase();

            var partA = aw_options.filter(function(item){
                return item[1].toLowerCase().startsWith(lowtext);
            });

            var partB = aw_options.filter(function(item){
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

        return  <div class="field">
                <div class={this.state.menu_active ? "dropdown is-active" : "dropdown"}>
                   <div class="dropdown-trigger">
                       <div class="field">
                           {this.props.title ? <label class="label">{this.props.title}</label> : ''}
                           <p class="control is-expanded has-icons-right">
                               <input class="input" type="input" onFocus={this.dropdownMenuEnter} onBlur={this.dropdownMenuLeave} value={this.value2text(this.state.current_item)} readonly/>
                               <span class="icon is-small is-right" style="pointer-events: all; cursor: pointer" onClick={this.filterCleared}>⊗</span>
                           </p>
                       </div>
                   </div>
                   <div class="dropdown-menu" id={this.state.menu_id} role="menu">
                       <div class="dropdown-content" style="max-height: 13em; overflow: auto;">
                           <div class="field dropdown-item ">
                               <p class="control">
                                   <input class="input" type="input" id={this.state.input_id} onBlur={this.dropdownMenuLeave} onKeyUp={this.menuFilterChanged} value={this.state.filter_text}/>
                               </p>
                           </div>
                           {aw_options.map(function(item){
                               item_count += 1;
                               return <a href="" class={item_count == self.state.top_index ? "dropdown-item is-active" :  "dropdown-item"} id={item_count == self.state.top_index ? self.state.selected_id : null} onClick={self.menuItemClicked} data-value={item[0]}>{item[1]}</a>;})}
                       </div>
                   </div>
                   {this.props.footnote ? <div class="help">{this.props.footnote}</div> : ''}
               </div>
               </div>;

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

class CSearchDyncmicSelectColumn extends CTableColumn{
    constructor() {
        super();

        this.editorChanged = this.editorChanged.bind(this);
        this.searchChanged = this.searchChanged.bind(this);

        this.state = {options: []};

        this.ref = createRef();
    }

    componentDidMount() {
        this.props.table.load_options(this.props.endpoint, this.props.params, this, this.ref);
    }

    searchChanged(value){
        this.props.table.change_filter_for_column(this.props.column, value);
    }

    editorChanged(value){
        this.props.table.notify_changes(this.props.row, this.props.column, value);
    }

    render_cell() {
        var self = this;
        var cvalues = this.state.options.filter(function(item){return item[0] == self.value();});
        if (cvalues.length > 0){
            return <span>{cvalues[0][1]}</span>;
        }
        return <span></span>;

    }

    render_search() {
        if (typeof this.props.filtering === 'undefined') {
            // do nothing
        } else {
            return <SearchableSelect valueChanged={this.searchChanged} options={this.state.options} value={this.props.filtering} />;
        }
    }

    render_editor() {
        return <SearchableSelect ref={this.ref} valueChanged={this.editorChanged} options={this.state.options} value={this.value()} footnote={this.props.footnote} title={this.title()}/>;
    }
}

