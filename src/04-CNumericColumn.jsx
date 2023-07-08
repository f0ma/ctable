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

class CNumericColumn extends CTableColumn{
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
        this.setState({editor_valid: true, value: this.value()});
    }

    render_cell() {
        if(this.props.domain == 'integer')
            return <span>{this.value()}</span>;
        if(this.props.domain == 'float')
            if(this.props.round)
                return <span>{parseFloat(this.value()).toFixed(this.props.round)}</span>;
            else
                return <span>{parseFloat(this.value()).toFixed(2)}</span>;
    }

    numeric_value_extractor(v){
        var val = 0;
        if(this.props.domain == 'integer')
            if(typeof(v) == "string")
                val = parseInt(v);
            else
                val = v;
        if(this.props.domain == 'float')
            if(typeof(v) == "string")
                val = parseFloat(v.replace(',','.'));
            else
                val = v;
        if(this.props.minimum)
            if(val < this.props.minimum)
                val = this.props.minimum;
        if(this.props.maximum)
            if(val > this.props.maximum)
                val = this.props.maximum;
        return val;
    }

    numeric_validator(v){
        if(this.props.domain == 'integer')
            if(typeof(v) == "string")
                return (v.match(/^[+-]\d+$/));
        if(this.props.domain == 'float')
            if(typeof(v) == "string")
                return !/^\s*$/.test(v) && !isNaN(v.replace(',','.'));
        return true;
    }

    editorChanged(e) {
        var ed_value = this.numeric_value_extractor(e.target.value);

        this.setState({value: ed_value});
        this.props.table.notify_changes(this.props.row, this.props.column, ed_value);

        if (this.numeric_validator(ed_value)){
            this.props.table.notify_valids(this.props.row, this.props.column, true);
            this.setState({editor_valid: true});
        }
    }

    hintClicked(e) {
        this.setState({value: e.target.dataset.hintvalue});
        this.props.table.notify_changes(this.props.row, this.props.column, e.target.dataset.hintvalue);
    }


    addStep(e) {
        var v = this.numeric_value_extractor(this.state.value);
        if(this.props.step){
            v = v + this.props.step;
        } else {
            v = v + 1;
        }
        if(this.props.maximum)
            if(v > this.props.maximum)
                v = this.props.maximum;
        this.setState({value: v});
        this.props.table.notify_changes(this.props.row, this.props.column, v);
    }

    removeStep(e) {
        var v = this.numeric_value_extractor(this.state.value);
        if(this.props.step){
            v = v - this.props.step;
        } else {
            v = v - 1;
        }
        if(this.props.minimum)
            if(v < this.props.minimum)
                v = this.props.minimum;
        this.setState({value: v});
        this.props.table.notify_changes(this.props.row, this.props.column, v);
    }

    render_editor() {
        var self = this;

        var minput = '';

        var mvalue = '0';
        if (this.value() != null && this.value() != ""){
            mvalue = this.value();
        }

        if(self.props.domain == 'integer'){
            minput = <input class={!this.state.editor_valid ? "input is-danger" : "input"} type="text" value={mvalue} onChange={this.editorChanged} placeholder={this.props.placeholder}/>;
        }

        if(self.props.domain == 'float'){
            if (this.props.round)
                minput = <input class={!this.state.editor_valid ? "input is-danger" : "input"} type="text" value={parseFloat(mvalue).toFixed(this.props.round)} onChange={this.editorChanged} placeholder={this.props.placeholder}/>;
            else
                minput = <input class={!this.state.editor_valid ? "input is-danger" : "input"} type="text" value={parseFloat(mvalue).toFixed(2)} onChange={this.editorChanged} placeholder={this.props.placeholder}/>;
        }

        return <div class="field" ref={this.ref}>
                   <label class="label">{this.title()}</label>
                   <div class="field has-addons">
                   <div class="control">
                       {minput}
                   </div>
                   <div class="control">
                       <button class="button is-info" onClick={this.addStep}>+</button>
                   </div>
                   <div class="control">
                       <button class="button is-info" onClick={this.removeStep}>-</button>
                   </div>
                   </div>
                   {this.props.input_hints ? <div class="tags"  style="margin-top: 0.2em;">{this.props.input_hints.map(function(c,i){ return <span class="tag button" data-hintvalue={c[0]} onClick={self.hintClicked}>{c[1]}</span>; })}</div> : ''}
                   {this.props.footnote ? <div class="help">{this.props.footnote}</div> : ''}
               </div>;
    }
}

