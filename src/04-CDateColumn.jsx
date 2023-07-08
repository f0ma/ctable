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
     return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getFullYear());
}

function createISOString(d) {
     return String(d.getFullYear())+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}



class CDateColumn extends CTableColumn{
    constructor() {
        super();

        this.editorChanged = this.editorChanged.bind(this);

        this.hintClicked = this.hintClicked.bind(this);

        this.ref_day = createRef();
        this.ref_month = createRef();
        this.ref_year = createRef();
    }

    componentDidMount() {
        this.setState({editor_valid: true, value: this.value()});
    }

    render_cell() {
        if (this.value()){
            var d = parseISOString(this.value());
            return <span>{createGOSTString(d)}</span>;
        } else {
            return <span></span>;
        }
    }

    editorChanged(e) {
        var ed_value = this.ref_year.current.value +'-'+this.ref_month.current.value+'-'+this.ref_day.current.value;

        this.setState({value: ed_value});
        this.props.table.notify_changes(this.props.row, this.props.column, ed_value);

        if (ed_value.match(/^\d\d\d\d-\d\d-\d\d$/)){
            this.props.table.notify_valids(this.props.row, this.props.column, true);
            this.setState({editor_valid: true});
        }
    }

    hintClicked(e) {
        this.setState({value: e.target.dataset.hintvalue});
        this.props.table.notify_changes(this.props.row, this.props.column, e.target.dataset.hintvalue);
    }


    value() {
        var v = super.value();
        if (v === null || v === ""){
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

        if(this.props.years_range){
            ymin = this.props.years_range[0];
            maxscale = this.props.years_range[1] - this.props.years_range[0]+1;
        }

        return <div class="field" ref={this.ref}>
                   <label class="label">{this.title()}</label>
                   <div class="field has-addons">
                   <div class="control">
                       <div class="select">
                         <select value={String(date.getDate()).padStart(2,'0')} onChange={this.editorChanged} ref={this.ref_day}>
                            {[...Array(30).keys()].map(function (k){return <option value={String(k+1).padStart(2,'0')}>{String(k+1).padStart(2,'0')}</option>;})}
                         </select>
                       </div>
                   </div>
                   <div class="control">
                       <div class="select">
                         <select value={String(date.getMonth()+1).padStart(2,'0')} onChange={this.editorChanged} ref={this.ref_month}>
                            {[...Array(11).keys()].map(function (k){return <option value={String(k+1).padStart(2,'0')}>{String(k+1).padStart(2,'0')}</option>;})}
                         </select>
                       </div>
                   </div>
                   <div class="control">
                       <div class="select">
                         <select value={String(date.getFullYear()).padStart(2,'0')} onChange={this.editorChanged} ref={this.ref_year}>
                            {[...Array(maxscale).keys()].map(function (k){return <option value={String(k+ymin)}>{String(k+ymin)}</option>;})}
                         </select>
                       </div>
                   </div>
                   </div>
                   {this.props.input_hints ? <div class="tags"  style="margin-top: 0.2em;">{this.props.input_hints.map(function(c,i){ return <span class="tag button" data-hintvalue={c[0]} onClick={self.hintClicked}>{c[1]}</span>; })}</div> : ''}
                   {this.props.footnote ? <div class="help">{this.props.footnote}</div> : ''}
               </div>;
    }
}

