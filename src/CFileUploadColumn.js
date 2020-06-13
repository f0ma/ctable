/**
 * Column for file uploading. Single of multiple file supported.
 *
 * See {{#crossLink "CFileUploadColumn/constructor"}}{{/crossLink}} for options list.
 *
 * @class CFileUploadColumn
 * @constructor
 * @extends CColumn
 *
 * @example
 *     table.add_column_class(CFileUploadColumn,{upload_endpoint:'/upload.php'});
 */

function file_name_shortifier(fname, length){
    if (fname.length <= length){
        return fname;
    }
    return fname.substring(0,length-5) + '&hellip;' + fname.substring(fname.length-5);
}

function cfileupload_default_parser(column, record, value){
    if (value == '' || value == null){
        return {uploaded:false, count:0, filelabel:'', uid:'', filelink:'', filedate:''};
    }

    var flines = value.split(';').filter(function(el) {return el.length != 0});

    if(flines.length == 1 ){
        var fcomp = flines[0].split(':');
        return {uploaded:true, count:1, filelabel:file_name_shortifier(fcomp[1], column.options.filelabel_length), uid:fcomp[0], filelink:column.options.link_endpoint+fcomp[0]};
    }

    var uids = [];
    var labels = [];
    var links = [];

    flines.forEach(function(frecord){
        var fcomp = frecord.split(':').filter(function(el) {return el.length != 0});
        uids.push(fcomp[0]);
        labels.push(file_name_shortifier(fcomp[1], column.options.filelabel_length));
        links.push(column.options.link_endpoint+fcomp[0]);
    });

    return {uploaded:true, count:flines.length, filelabel:labels, uid:uids, filelink:links};
}

class CFileUploadColumn extends CColumn {

    /**
     * Create column object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} record Parent CRecord object.
     * @param {Object} options Column options:
     * @param {int} [options.width] Column width in percents.
     * @param {Function} [options.field_parser] function (column, record, value) which returns object {uploaded:?, count:?, filelabel:?, uid:?, filelink:?} by column value.
     * @param {String} options.upload_endpoint Url for file uploading.
     * @param {Boolean} [options.links] Files available for downloading by link?
     * @param {String} [options.link_endpoint] Url for file downloading - default link_endpoint+uid.
     * @param {Boolean} [options.multiple] Allow multiple files upload, default true.
     * @param {int} [options.filelabel_length] File label shortificator - default 12 symbols.
     *
     */

    constructor(table, record, options = {}) {
        super(table, record, options);
        if(typeof(this.options.field_parser) == "undefined"){
            this.options.field_parser = cfileupload_default_parser;
        }
        if(typeof(this.options.filelabel_length) == "undefined"){
            this.options.filelabel_length = 12;
        }
        if(typeof(this.options.links) == "undefined"){
            this.options.links = true;
        }
        this.value = null;
    }

    /**
     * Build cell part of column.
     * @method build_cell
     * @param {JQueryNode} elem Container element.
     *
     */

    build_cell(elem){
        super.build_cell(elem);
        this.value = this.record.record_field(this.options.column);
        var fileinfo = this.options.field_parser(this, this.record, this.value);

        if (fileinfo.uploaded && fileinfo.count == 1){
            var filelink = '';
            if (this.options.links) {
                filelink = 'href="'+fileinfo.filelink+'" target="_blank"';
            }
            elem.html('<a class="button is-info is-outlined" '+filelink+'><span class="file-icon"><i class="fa fa-check-square" aria-hidden="true"></i></span>'+fileinfo.filelabel+'</a>');
        } else if (fileinfo.uploaded && fileinfo.count > 1){
            // Link to multifile not available now
            var filelink = '';
            if (this.options.links) {
                filelink = 'href="'+fileinfo.filelink+'" target="_blank"';
            }
            elem.html('<a class="button is-info is-outlined" '+filelink+'><span class="file-icon"><i class="fa fa-check-square" aria-hidden="true"></i></span>'+this.table.lang.multiple+fileinfo.count+'</a>');
        } else {
            elem.html('<a class="button is-info is-outlined" disabled><span class="file-icon"><i class="fa fa-minus-square" aria-hidden="true"></i></span>'+this.table.lang.no_file+'</a>');
        }
    }

    /**
     * Build editor part of column.
     * @method build_editor
     * @param {JQueryNode} elem Container element.
     *
     */

    build_editor(elem, is_new_record){
        super.build_editor(elem, is_new_record);

        this.value = '';

        if(!is_new_record){
            this.value = this.record.record_field(this.options.column);
        }

        this.input_elem = elem.html('<div></div>').find('div').first();

        this.make_input(this.input_elem, this.value);
    }

    /**
     * Make upload form.
     * @method make_input
     * @param {JQueryNode} elem Container element.
     * @param {JQueryNode} files Value field.
     *
     */
    make_input(elem, files){

        var fileinfo = this.options.field_parser(this, this.record, files);

        var multiple = '';

        if(typeof(this.options.multiple) != "undefined" && this.options.multiple){
            multiple = 'multiple';
        }

        if (fileinfo.uploaded && fileinfo.count == 1){
            var filelink = '';
            if (this.options.links) {
                filelink = 'href="'+fileinfo.filelink+'" target="_blank"';
            }
            elem.html('<div class="field has-addons"><p class="control"><a class="button is-info is-outlined" '+filelink+'><span class="file-icon"><i class="fa fa-check-square" aria-hidden="true"></i></span>'+fileinfo.filelabel+'</a></p><p class="control"><a class="button is-info is-outlined ctable-close"><i class="fas fa-window-close"></i></a></p><p class="control"><a class="button is-info is-outlined"><i class="fas fa-upload"></i></a><input class="file-input" type="file" name="file" '+multiple+'/></p></div>');
        } else if (fileinfo.uploaded && fileinfo.count > 1){
            var filelink = '';
            if (this.options.links) {
                filelink = 'href="'+fileinfo.filelink+'" target="_blank"';
            }
            elem.html('<div class="field has-addons"><p class="control"><a class="button is-info is-outlined" '+filelink+'><span class="file-icon"><i class="fa fa-check-square" aria-hidden="true"></i></span>'+this.table.lang.multiple+fileinfo.count+'</a></p><p class="control"><a class="button is-info is-outlined ctable-close"><i class="fas fa-window-close"></i></a></p><p class="control"><a class="button is-info is-outlined"><i class="fas fa-upload"></i></a><input class="file-input" type="file" name="file" '+multiple+'/></p></div>');
        } else {
            elem.html('<div class="field has-addons"><p class="control"><a class="button is-info is-outlined" href="#" disabled><span class="file-icon"><i class="fa fa fa-minus-square" aria-hidden="true"></i></span>'+this.table.lang.no_file+'</a></p><p class="control"><a class="button is-info is-outlined"><i class="fas fa-upload"></i></a><input class="file-input" type="file" name="file" '+multiple+'/></p></div>');
        }

        var self = this;

        elem.find('.ctable-close').click(function(){
            self.value = '';
            self.make_input(self.input_elem, self.value);
        });

        elem.find('input').change(function(){
            var file_data = $(this).prop("files");
            var form_data = new FormData();

            for(var file_index = 0; file_index < file_data.length; file_index++){
                form_data.append("file"+file_index, file_data[file_index]);
            };

            elem.find('a').first().addClass('is-loading');

            $.ajax({
                url: self.options.upload_endpoint,
                dataType: 'script',
                cache: false,
                contentType: false,
                processData: false,
                data: form_data,
                type: 'post',
                dataType: 'json'
            })
            .done(function(data) {
                elem.find('a').first().removeClass('is-loading');
                if (data.Result == 'OK') {
                    self.value = data.Files;
                    self.make_input(self.input_elem, self.value);
                } else {
                    self.options.error_handler(self.table.lang.error + data.Message);
                }
            })
            .fail(function(xhr, status, error) {
                self.table.options.error_handler(self.table.lang.server_side_error+':\n'+ xhr.status + ': ' + xhr.statusText+ '\n' + error);
                elem.find('a').first().removeClass('is-loading');
            });
        });
    }

    /**
     * Get editor value.
     * @method editor_value
     * @return {Array} Column name and value as [String, String] or [null, null]
     *
     */

    editor_value(){
        if(typeof(this.options.column) == "undefined"){
            return [null, null];
        }
        if(typeof(this.options.virtual) != "undefined" && this.options.virtual){
            return [null, null];
        }
        if(this.editor != null){
            return [this.options.column, this.value];
        } else {
            if(! this.record.record_is_new()) {
                return [this.options.column, this.value];
            }
        }
        return [null, null];
    }

    /**
     * Validate value.
     * @method is_valid
     * @return {Boolean} If options.validate is set return true if value not empty.
     *
     */

    is_valid(){
        if(typeof(this.options.validate) != "undefined" && this.options.validate){
            if (this.value != ''){
                this.input_elem.find("a").removeClass( "is-danger" );
                this.input_elem.find("a").addClass( "is-success" );
                return true;
            }
            this.input_elem.find("a").removeClass( "is-success" );
            this.input_elem.find("a").addClass( "is-danger" );
            return false;
        }
        return true;
    }
}

 
