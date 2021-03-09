/**
 * Div-based editor with floats and footnotes.
 *
 * See {{#crossLink "CAdaptiveRecord/constructor"}}{{/crossLink}} for options list.
 *
 * @class CAdaptiveRecord
 * @constructor
 * @extends CRecord
 *
 * @example
 *     table.set_record_class(CAdaptiveRecord, {});
 */

class CAdaptiveRecord extends CRecord {

    /**
     * Create record object. Should not be called directly.
     *
     * @method constructor
     * @param {Object} table Parent CTable object.
     * @param {Object} [options] Column options:
     * @param {String} [options.editor_width_class] Editor width class (Bulma `is-4` for default)
     * @param {String} [options.record_width_class] Column width class (Bulma `is-4` for default)
     * @param {Boolean} [options.adaptive_record] Enable adaptive records
     * @param {Boolean} [options.non_adaptive_editor] Disable adaptive editors
     *
     */

    /**
     * Build table row.
     * @method build_record
     *
     */

    build_record(){

        if (typeof(this.options.adaptive_record) != 'undefined' ||  !this.options.adaptive_record){
            super.build_record();
            return;
        }

        var record_row = $('<td colspan="'+this.table.visible_columns()+'"></td>').appendTo(this.row);
        var record_cell = $('<div class="columns is-multiline"></div>').appendTo(record_row);

        var width_class = 'is-4';
        if (typeof(this.options.record_width_class) != 'undefined'){
            width_class = this.options.record_width_class;
        }

        for (var i in this.columns){
            if (this.columns[i].visible_column()){

                var column_width_class = width_class;
                if(typeof(this.columns[i].options.record_width_class) != "undefined"){
                    column_width_class = this.columns[i].options.record_width_class;
                }

                var rightfloat = "";
                if(typeof(this.columns[i].save_record) != 'undefined'){
                    rightfloat = "float: right;"
                }

                var data_cell = $('<div class="column '+column_width_class+'" style="display: inline-block; vertical-align:top;'+rightfloat+'"></div>').appendTo(record_cell);

                this.columns[i].build_cell(data_cell);

                if(typeof(this.columns[i].options.title) != "undefined"){
                    var lab = $('<label class="label"></label>').prependTo(data_cell);
                    lab.text(this.columns[i].options.title+":");
                }
            }
        }
        if(typeof(this.options.on_build_record) != "undefined"){
            this.options.on_build_record(this.row, this.record_field());
        }
    }

    /**
     * Build editor row.
     * @method build_editor
     * @param {Boolean} is_new_record Build editor for new row.
     *
     */

    build_editor(is_new_record = false){

        if (typeof(this.options.non_adaptive_editor) != 'undefined' && this.options.non_adaptive_editor){
            super.build_editor(is_new_record);
            return;
        }

        var editor_row = $('<td class="ctable-container" colspan="'+this.table.visible_columns()+'"></td>').appendTo(this.row);
        var editor_cell = $('<div class="columns is-multiline"></div>').appendTo(editor_row);

        var width_class = 'is-4';
        if (typeof(this.options.editor_width_class) != 'undefined'){
            width_class = this.options.editor_width_class;
        }

        for (var i in this.columns){
            var column_width_class = width_class;
            if(typeof(this.columns[i].options.editor_width_class) != "undefined"){
                column_width_class = this.columns[i].options.editor_width_class;
            }

            if (this.columns[i].visible_editor()){

                var div = $('<div class="field column '+column_width_class+'"></div>').appendTo(editor_cell);

                this.columns[i].build_editor(div, is_new_record);

                if(typeof(this.columns[i].options.title) != "undefined"){
                    var lab = $('<label class="label"></label>').prependTo(div);
                    lab.text(this.columns[i].options.title+":");

                }

                if(typeof(this.columns[i].options.footnote) != "undefined"){
                    var footnote = $('<p class="is-size-7 has-text-grey-light"></p>').appendTo(div);
                    footnote.text(this.columns[i].options.footnote);
                }
            }
        }

        for (var i in this.columns){
            var col_val = this.columns[i].editor_value();
            for (var j in this.columns){
                if (col_val[0] != null){
                    this.columns[j].record_changed(col_val[0], col_val[1]);
                }
            }
        }
    }


    build_header(){

        if (typeof(this.options.adaptive_record) != 'undefined' ||  !this.options.adaptive_record){
            super.build_header();
            return;
        }

        var head_row = $('<th colspan="'+this.table.visible_columns()+'"></th>').appendTo(this.header_row);
        var options_row = $('<th colspan="'+this.table.visible_columns()+'"></th>').appendTo(this.options_row);

        var head_div = $('<div class="columns is-multiline"></div>').appendTo(head_row);
        var options_div = $('<div class="columns is-multiline"></div>').appendTo(options_row);

        for (var i in this.columns){
            if (this.columns[i].visible_column()){
                if (this.columns[i].width() != 0){
                    $('<col style="width: '+this.columns[i].width()+';"></col>').appendTo(this.colgroup);
                } else {
                    $('<col></col>').appendTo(this.colgroup);
                }


                var head_cell = $('<div class="column"></div>').appendTo(head_div);
                this.columns[i].build_title(head_cell);

                var options_cell = $('<div class="column"></div>').appendTo(options_div);
                this.columns[i].build_options(options_cell);

            }
        }
    }

}


