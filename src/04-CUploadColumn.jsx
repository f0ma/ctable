/**
 * Upload column.
 *
 * This column for uploading files.
 *
 * @arg {string} this.props.upload_endpoint - Endpoint for uploading files.
 * @arg {undefined | Boolean} this.props.multiple - Multiple upload allowed. Not tested.
 * @arg {undefined | string} this.props.links_endpoint - Link endpoint. No link available if undefined.
 * @arg {undefined | int} this.props.filename_len - Max length for filename. 12 if undefined.
 * @arg {undefined | int} this.props.max_file_size - Maximum file size.
 * @arg {undefined | string[]} this.props.allowed_extentions - Allowed file extention.
 */

class CUploadColumn extends CTableColumn{
    constructor() {
        super();
        this.state = {fileinfo: {uploaded:false, count:0, filelabel:[], uid:[], filelink:[], filedate:[]}};
        this.ref = createRef();
    }

    file_name_shortifier(fname){
        var length = 12;
        if(this.props.filename_len){
            length = this.props.filename_len;
        }
        if(fname.length < length) return fname;
        return fname.substring(0,length-5) + '...' + fname.substring(fname.length-5);
    }

    value_parser(value){
        if (value == '' || value == null){
            return {uploaded:false, count:0, filelabel:[], uid:[], filelink:[], filedate:[]};
        }

        var links = null;
        if(this.props.links_endpoint){
            links = this.props.links_endpoint;
        }

        var flines = value.split(';').filter(function(el) {return el.length != 0});

        if(flines.length == 1 ){
            var fcomp = flines[0].split(':');
            return {uploaded:true, count:1, filelabel:[this.file_name_shortifier(fcomp[1])], uid:[fcomp[0]], filelink:[(links ? links+fcomp[0] : '')]};
        }

        var uids = [];
        var labels = [];
        var links = [];

        flines.forEach(function(frecord){
            var fcomp = frecord.split(':').filter(function(el) {return el.length != 0});
            uids.push(fcomp[0]);
            labels.push(this.file_name_shortifier(fcomp[1]));
            links.push(links ? links+fcomp[0] : '');
        });

        return {uploaded:true, count:flines.length, filelabel:labels, uid:uids, filelink:links};
    }


    componentDidMount() {
        this.setState({fileinfo: this.value_parser(this.value())});
    }

    render_cell() {

         var fileinfo = this.value_parser(this.value());

        if (!fileinfo.uploaded){
            return <a class="button is-info is-outlined" disabled="true"><span class="file-icon">⊖</span>{this.props.table.props.lang.no_file}</a>;
        }

        if (fileinfo.count == 1){
            var filelink = {};
            if (this.props.links_endpoint) {
                filelink = {"href":fileinfo.filelink, "target": "_blank", "disabled": false};
            }
            return h("a",{"class": "button is-info is-outlined", "disabled": true, ...filelink}, <><span class="file-icon">⊖</span>{fileinfo.filelabel[0]}</>);
        } else {
            return <a class="button is-info is-outlined" disabled="true"><span class="file-icon">⊖</span>{this.props.table.props.lang.multiple_files} {fileinfo.count}</a>;
        }
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
                       <option value='%null'>{this.props.table.props.lang.file_filter_no}</option>
                       <option value='%notempty'>{this.props.table.props.lang.file_filter_yes}</option>
                     </select>
                   </div>;
        }
    }

    editorCleared = e => {
        this.setState({fileinfo: this.value_parser('')});
        this.props.table.notify_changes(this.props.row, this.props.column, '');
    }

    editorChanged = e => {

        var form_data = new FormData();

        for(var file_index = 0; file_index < e.target.files.length; file_index++){
            if(this.props.max_file_size){
                if(e.target.files[file_index].size > this.props.max_file_size){
                    alert(this.props.table.props.lang.file_to_large);
                    return;
                }
            }
            if(this.props.allowed_extentions){
                if (this.props.allowed_extentions.filter(item => e.target.files[file_index].name.toLowerCase().endsWith(item)).length == 0){
                    alert(this.props.table.props.lang.file_wrong_extention);
                    return;
                }
            }

            form_data.append("file"+file_index, e.target.files[file_index]);
        }

        var self = this;

        fetch(this.props.upload_endpoint, {method: 'POST', body: form_data})
        .then(function(response){
            if (response.ok) {return response.json();}
            else {alert(self.props.table.props.lang.server_error + response.status)} })
        .then(function (result) {
            if (!result) return;
            if(result.Result == 'OK'){
               self.setState({fileinfo: self.value_parser(result.Files)});
               self.props.table.notify_changes(self.props.row, self.props.column, result.Files);
            }});
    }

    render_editor() {
        if (!this.state.fileinfo.uploaded){
            return <><label class="label">{this.title()}</label>
                   <div class="field has-addons">
                       <div class="control">
                           <button class="button is-info" disabled="true"><span class="file-icon">⊖</span>{this.props.table.props.lang.no_file}</button>
                        </div>
                        <div class="control">
                            <button class="button is-info is-danger" disabled="true">⊗</button>
                        </div>
                        <div class="control">
                            <button class="button is-info">↥</button>
                            <input class="file-input" type="file" name="file" multiple={this.props.multiple ? "true" : "false"} onChange={this.editorChanged}/>
                        </div>
                    </div>
                    {this.props.footnote ? <div class="help">{this.props.footnote}</div> : ''}
                    </>;
        }

        if (this.state.fileinfo.count == 1){
            var filelink = {};
            if (this.props.links_endpoint) {
                filelink = {"href":this.state.fileinfo.filelink, "target": "_blank"};
            }
            return <><label class="label">{this.title()}</label>
                   <div class="field has-addons">
                       <div class="control">
                           {h("a",{"class": "button is-info", ...filelink}, <><span class="file-icon">⊖</span>{this.state.fileinfo.filelabel[0]}</>)}
                        </div>
                        <div class="control">
                            <button class="button is-info is-danger" onClick={this.editorCleared}>⊗</button>
                        </div>
                        <div class="control">
                            <button class="button is-info">↥</button>
                            <input class="file-input" type="file" name="file" multiple={this.props.multiple ? "true" : "false"} onChange={this.editorChanged}/>
                        </div>
                    </div>
                    {this.props.footnote ? <div class="help">{this.props.footnote}</div> : ''}
                    </>;
        } else {
            return <><label class="label">{this.title()}</label>
                   <div class="field has-addons">
                       <div class="control">
                           {h("a",{"class": "button is-info", "disabled": true}, <><span class="file-icon">⊖</span>{this.props.table.props.lang.multiple_files} {this.state.fileinfo.count}</>)}
                        </div>
                        <div class="control">
                            <button class="button is-info is-danger" onClick={this.editorCleared}>⊗</button>
                        </div>
                        <div class="control">
                            <button class="button is-info">↥</button>
                            <input class="file-input" type="file" name="file" multiple={this.props.multiple ? "true" : "false"} onChange={this.editorChanged}/>
                        </div>
                    </div>
                    {this.props.footnote ? <div class="help">{this.props.footnote}</div> : ''}
                    </>;
        }
    }
}

