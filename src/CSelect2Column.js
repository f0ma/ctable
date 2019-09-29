/**
 * Select2 (https://select2.org/) selector column.
 *
 * See {{#crossLink "CSelectColumn/constructor"}}{{/crossLink}} for options list.
 * Select2 js and css files should be included.
 *
 * @class CSelect2Column
 * @extends CSelectColumn
 * @constructor
 * @param {String} [options.select2] Select2 constructor parameters.
 * @param {Boolean} [options.multiple] Select2 in multiselect mode.
 * @param {String} [options.no_select2_for_options] No select2 control for options.
 *
 */

class CSelect2Column extends CSelectColumn {

    /**
     * Build editor part of column.
     * @method build_editor
     * @param {JQueryNode} elem Container element.
     * @param {Boolean} is_new_record Create editor for new record.
     *
     */

    build_editor(elem, is_new_record = false){
        super.build_editor(elem, is_new_record);

        if(typeof(this.options.multiple) != "undefined" && this.options.multiple){
            this.editor.prop('multiple','multiple');
        }
        
        if(typeof(this.options.select2) != "undefined"){
            this.editor.select2(this.options.select2);
        } else {
            this.editor.select2();
        }
    }

    /**
     * Build options part of column.
     * @method build_options
     * @param {JQueryNode} elem Container element.
     *
     */

    build_options(elem){
        super.build_options(elem);

        if(typeof(this.options.no_filter) != "undefined" && this.options.no_filter){
            return;
        }
        
        if(typeof(this.options.no_select2_for_options) != "undefined" && this.options.no_select2_for_options){
            return;
        }

        if(typeof(this.options.select2) != "undefined"){
            this.search_field.select2(this.options.select2);
        } else {
            this.search_field.select2();
        }
    }
} 
