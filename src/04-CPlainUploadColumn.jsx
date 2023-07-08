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

class CPlainUploadColumn extends CTableColumn{
    constructor() {
        super();

        this.filterChanged = this.filterChanged.bind(this);
        this.uploadChanged = this.uploadChanged.bind(this);
        this.editorChanged = this.editorChanged.bind(this);
        this.editorCleared = this.editorCleared.bind(this);

        this.ref = createRef();
    }

    componentDidMount() {
        this.setState({value: this.value()});
    }

    render_cell() {
        if (!this.value()){
            return <a class="button is-info" disabled="true"><span class="material-icons">attach_file</span> {this.props.table.props.lang.no_file}</a>;
        }

        if (typeof this.props.links_endpoint === 'undefined'){
            return <a class="button is-info"><span class="material-icons">attach_file</span>{this.props.table.props.lang.file_present}</a>;
        }

        return <a class="button is-info" href={this.props.links_endpoint + this.value()}><span class="material-icons">attach_file</span>{this.props.table.props.lang.file_present}</a>;
    }

    filterChanged(e){
        if(e.target.value == ''){
            this.props.table.change_filter_for_column(this.props.column, null);
        } else {
            this.props.table.change_filter_for_column(this.props.column, e.target.value);
        }
        this.setState({value: e.target.value});
    }

    render_search() {
        if (typeof this.props.filtering === 'undefined') {
            // do nothing
        } else {
            return <div class="select">
                     <select onChange={this.filterChanged} value={this.props.filtering}>
                       <option value=''>{this.props.table.props.lang.no_filter}</option>
                       <option value='%nodata'>{this.props.table.props.lang.file_filter_no}</option>
                       <option value='%notempty'>{this.props.table.props.lang.file_filter_yes}</option>
                     </select>
                   </div>;
        }
    }

    editorChanged(e) {
        this.props.table.notify_changes(this.props.row, this.props.column, e.target.value);
        this.setState({value: e.target.value});
    }

    editorCleared() {
        this.props.table.notify_changes(this.props.row, this.props.column, "");
        this.setState({value: ""});
    }

    uploadChanged(e) {

        var form_data = new FormData();

        if(e.target.files.length != 1){
            alert(this.props.table.props.lang.file_only_one);
            return;
        }

        if(this.props.max_file_size){
            if(e.target.files[0].size > this.props.max_file_size){
                alert(this.props.table.props.lang.file_to_large);
                return;
            }
        }

        if(this.props.allowed_extentions){
            if (this.props.allowed_extentions.filter(item => e.target.files[0].name.toLowerCase().endsWith(item)).length == 0){
                alert(this.props.table.props.lang.file_wrong_extention);
                return;
            }
        }

        form_data.append("file", e.target.files[0]);

        var self = this;
        var xkeys = {};

        this.props.table.state.columns.map(function (item, i) {
            if(item.is_key == true && self.props.row >= 0){
                xkeys[item.name] = self.props.table.state.records[self.props.row][item.name];
            }
        });

        form_data.append("keys", JSON.stringify(xkeys));

        this.props.table.setState({waiting_active: true});

        fetch(this.props.upload_endpoint, {method: 'POST', body: form_data})
        .then(function(response){
            self.props.table.setState({waiting_active: false}); // always disable table waiting
            if (response.ok) {return response.json();}
            else {alert(self.props.table.props.lang.server_error + response.status)} })
        .then(function (result) {
            if (!result) return;
            if(result.Result == 'OK'){
               self.props.table.notify_changes(self.props.row, self.props.column, result.Filename);
               self.setState({value: result.Filename});
            }
            if(result.Result == 'Error'){
               alert(result.Message);
            }});
    }

    render_editor() {
            return <><label class="label">{this.title()}</label>
                   <div class="field has-addons">
                       <div class="control">
                           <input class="input" value={this.state.value} onChange={this.editorChanged}></input>
                        </div>
                        <div class="control">
                           <a class="button is-info" target="_blank" href={this.state.value === null || this.state.value === '' ? false : this.props.links_endpoint + this.state.value} disabled={this.state.value === null || this.state.value === '' ? true : false}><span class="material-icons">attach_file</span></a>
                        </div>
                        <div class="control">
                            <button class="button is-info"><span class="material-icons">upload</span></button>
                            <input class="file-input" type="file" name="file" onChange={this.uploadChanged}/>
                        </div>
                        <div class="control">
                            <button class="button is-danger" onClick={this.editorCleared}><span class="material-icons">cancel</span></button>
                        </div>
                    </div>
                    {this.props.footnote ? <div class="help">{this.props.footnote}</div> : ''}
                    </>;
    }
}

