/**
 * DateTimePicker (https://xdsoft.net/jqplugins/datetimepicker/) column.
 *
 * See {{#crossLink "CTextColumn/constructor"}}{{/crossLink}} for options list.
 *
 * DateTimePicker js and css files should be included.
 *
 * @class CDateTimePickerColumn
 * @extends CTextColumn
 * @constructor
 * @param {String} [options.datetimepicker] DateTimePicker constructor parameters.
 * @param {String} [options.no_picker_for_options] Disable DateTimePicker for options bar.
 *
 */

class CDateTimePickerColumn extends CTextColumn{

    /**
     * Build editor part of column.
     * @method build_editor
     * @param {JQueryNode} elem Container element.
     * @param {Boolean} is_new_record Create editor for new record.
     *
     */

    build_options(elem){
        super.build_options(elem);

        if(typeof(this.options.no_search) != "undefined" && this.options.no_search){
            return;
        }
        
        if(typeof(this.options.no_picker_for_options) != "undefined" && this.options.no_picker_for_options){
            return;
        }

        if(typeof(this.options.datetimepicker) != "undefined"){
            this.search_field.datetimepicker(this.options.datetimepicker);
        } else {
            this.search_field.datetimepicker();
        }
    }

    /**
     * Build editor part of column.
     * @method build_editor
     * @param {JQueryNode} elem Container element.
     * @param {Boolean} is_new_record Create editor for new record.
     *
     */

    build_editor(elem, is_new_record = false){
        super.build_editor(elem, is_new_record);

        if(typeof(this.options.datetimepicker) != "undefined"){
            this.editor.datetimepicker(this.options.datetimepicker);
        } else {
            this.editor.datetimepicker();
        }
    }
} 
