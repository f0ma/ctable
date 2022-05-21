<?php

require __DIR__ .'/PDQLQuery.php';

function startsWith($haystack, $needle) {
    return substr_compare($haystack, $needle, 0, strlen($needle)) === 0;
}

function endsWith($haystack, $needle) {
    return substr_compare($haystack, $needle, -strlen($needle)) === 0;
}


class ExtendedCallable {

    private function extends_before($method_name, $method_list){
        $call_list = [];
        foreach ($method_list as $m){
            if (endsWith($m, '_before_'.$method_name)){
                list($name, $mod) = explode('_before_', $m);
                $m_call_list = array_merge($this->extends_before($name, $method_list), [$m], $this->extends_after($name, $method_list));
                $call_list = array_merge($m_call_list, $call_list);
            }
        }
        return $call_list;
    }

    private function extends_after($method_name, $method_list){
        $call_list = [];
        foreach ($method_list as $m){
            if (endsWith($m, '_after_'.$method_name)){
                list($name, $mod) = explode('_after_', $m);
                $m_call_list = array_merge($this->extends_before($name, $method_list), [$m], $this->extends_after($name, $method_list));
                $call_list = array_merge($call_list, $m_call_list);
            }
        }
        return $call_list;
    }

    public function call_with_extends($method_name){
        $method_list = get_class_methods(get_class($this));

        $calls = array_merge($this->extends_before($method_name, $method_list), [$method_name], $this->extends_after($method_name, $method_list));
        foreach ($calls as $method){
            $this->{$method}();
        }
    }
}

class CTable extends ExtendedCallable {

    var $db;
    var $primary_table;
    var $param;
    var $query;
    var $data;
    var $key_columns_values;
    var $data_values;
    var $total_records;
    var $writable_columns;
    var $readable_columns;
    var $options_columns;
    var $key_columns;
    var $log_query;
    var $upload_dir = NULL;

    function set_upload_dir($dir){
        $this->upload_dir = $dir;
    }

    function send_error($text){
        header('Content-Type: application/json;charset=utf-8');
        echo json_encode(["Result" => "Error", "Message" => $text], JSON_UNESCAPED_UNICODE);
        die();
    }

    function __construct($db, $primary_table, $key_columns, $log_query = FALSE){
        $this->db = $db;
        $this->log_query = $log_query;

        // INTERNAL DATA API

        // FOR ALL QUERY:

        // Allow query
        $this->allowed_query = ['select', 'options', 'insert', 'update', 'delete', 'upload', 'download', 'custom_read', 'custom_write'];

        // This table
        $this->primary_table = $primary_table;

        // Key columns in this table
        $this->key_columns = $key_columns;

        // Current operation (select, options, update, insert, delete)
        $this->operation = NULL;

        // All params
        $this->param = NULL;

        // Query (Altitude)
        $this->query = NULL;

        // Key columns values
        $this->key_columns_values = NULL;

        // FOR WRITE QUERY:

        // Data for writing
        $this->data_values = NULL;

        // List columns allow for writing
        $this->writable_columns = NULL;

        // FOR READ QUERY:

        // Data after reading
        $this->data = NULL;

        // Total records for pagination
        $this->total_records = 0;

        // List columns allow for reading
        $this->readable_columns = NULL;

        // Pair of columns for options
        $this->options_columns = NULL;

        // FOR UPLOAD DATA

        // Uploaded files
        $this->files = NULL;

        // Uploaded names
        $this->file_names = NULL;

        // Max upload fize
        $this->files_max_size = 1024*1024;

        // Max upload count
        $this->files_max_count = 1;

    }

    function process() {
        $this->call_with_extends('parsing_request');
        if ($this->operation == 'upload'){
            $this->call_with_extends('processing_upload');
        } elseif ($this->operation == 'custom_read') {
            $this->call_with_extends('custom_read_'.$this->param['handler']);
        } elseif ($this->operation == 'custom_write') {
            $this->call_with_extends('custom_write_'.$this->param['handler']);
        } else {
            $this->call_with_extends('building_query');
            $this->call_with_extends('executing_query');
        }   
        $this->call_with_extends('sending_result');
    }

    function parsing_request() {
        $this->operation = NULL;

        if(isset($_GET['download']) && in_array('download', $this->allowed_query)){
            $this->operation = 'download';
            $this->param = json_decode($_GET['download'], true);
        }
        if(isset($_GET['select']) && in_array('select', $this->allowed_query)){
            $this->operation = 'select';
            $this->param = json_decode($_GET['select'], true);
        }
        if(isset($_POST['select']) && in_array('select', $this->allowed_query)){
            $this->operation = 'select';
            $this->param = json_decode($_POST['select'], true);
        }
        if(isset($_GET['options']) && in_array('options', $this->allowed_query)){
            $this->operation = 'options';
            $this->param = json_decode($_GET['options'], true);
        }
        if(isset($_POST['options']) && in_array('options', $this->allowed_query)){
            $this->operation = 'options';
            $this->param = json_decode($_POST['options'], true);
        }
        if(isset($_POST['insert']) && in_array('insert', $this->allowed_query)){
            $this->operation = 'insert';
            $this->param = json_decode($_POST['insert'], true);
        }
        if(isset($_POST['update']) && in_array('update', $this->allowed_query)){
            $this->operation = 'update';
            $this->param = json_decode($_POST['update'], true);
        }
        if(isset($_POST['delete']) && in_array('delete', $this->allowed_query)){
            $this->operation = 'delete';
            $this->param = json_decode($_POST['delete'], true);
        }
        if(isset($_GET['custom_read']) && in_array('custom_read', $this->allowed_query)){
            $this->operation = 'custom_read';
            $this->param = json_decode($_GET['custom_read'], true);
        }
        if(isset($_POST['custom_read']) && in_array('custom_read', $this->allowed_query)){
            $this->operation = 'custom_read';
            $this->param = json_decode($_POST['custom_read'], true);
        }
        if(isset($_POST['custom_write']) && in_array('custom_write', $this->allowed_query)){
            $this->operation = 'custom_write';
            $this->param = json_decode($_POST['custom_write'], true);
        }
        if((count($_FILES) > 0) && in_array('upload', $this->allowed_query)){
            $this->operation = 'upload';
        }

        if($this->operation == NULL){
            $this->send_error('Operation not allowed');
        }
    }

    function building_query() {
        if(in_array($this->operation, ['select','options', 'download'])){
            $this->call_with_extends('building_read_query');
            $this->call_with_extends('applying_filters');
            $this->call_with_extends('applying_limits');
        }

        if(in_array($this->operation, ['insert','update','delete'])){
            $this->key_columns_values = [];
            $this->data_values = [];

            foreach($this->param as $col => $val){
                if (in_array($col,$this->key_columns)){
                    $this->key_columns_values[$col] = $val;
                } else {
                    $this->data_values[$col] = $val;
                }
            }

            $this->call_with_extends('building_write_query');
        }

    }

    function building_read_query() {
        if(in_array($this->operation,['select','download'])){
            $this->call_with_extends('building_select_query');
            $this->call_with_extends('setting_readable_columns');
        } elseif ($this->operation == 'options'){
            $this->call_with_extends('building_options_query');
            $this->call_with_extends('setting_options_columns');
        }
    }

    function setting_readable_columns(){
        if($this->readable_columns !== NULL){
            $this->query->select($this->readable_columns);
        }
    }

    function setting_options_columns(){
        if($this->options_columns !== NULL){
            $this->query->select($this->options_columns);
        }
    }

    function setting_writable_columns(){
        if($this->writable_columns !== NULL){
            $allowed_cols = [];
            foreach($this->data_values as $col => $value){
                if (in_array($col, $allowed_cols)){
                    $allowed_cols[$col] = $value;
                }
            }
            $this->data_values = $allowed_cols;
        }
    }

    function building_write_query() {
        if($this->operation == 'insert'){
            $this->call_with_extends('building_insert_query');
            $this->call_with_extends('setting_writable_columns');
        } else {
            if(count($this->key_columns) != count($this->key_columns_values)){
                $this->send_error('Missing some key field');
            }
            if ($this->operation == 'update'){
                $this->call_with_extends('building_update_query');
                $this->call_with_extends('setting_writable_columns');
            } elseif ($this->operation == 'delete'){
                $this->call_with_extends('building_delete_query');
            }
        }
    }


    function building_select_query() {
        $this->query = new PDQLQuery();
        $this->query->select()->from($this->primary_table);
    }

    function building_options_query() {
        $this->query = new PDQLQuery();
        $this->query->select()->from($this->primary_table);
    }

    function building_insert_query() {
        $this->query = new PDQLQuery();
        $this->query->table($this->primary_table)->insert($this->data_values);
    }

    function building_update_query() {
        $this->query = new PDQLQuery();
        $this->query->table($this->primary_table)->update($this->data_values);
        foreach($this->key_columns_values as $col => $val){
            $this->query->where_eq([$col], $val);
        }
    }

    function processing_upload() {
        $this->files = [];
        $this->file_names = [];

        foreach ($_FILES as $key => $value){
            if(count($_FILES) > $this->files_max_count){
                break;
            }
            if($_FILES[$key]['size'] > $this->files_max_size){
                header('Content-Type: application/json;charset=utf-8');
                $this->send_error('File too large');
            }
            $hash = md5_file($_FILES[$key]['tmp_name']);
            $name = $_FILES[$key]['name'];
            $timestamp = time();
            $ext = pathinfo($_FILES[$key]['name'])['extension'];

            $this->files[] = $_FILES[$key]['tmp_name'];
            $this->file_names[] = "$hash:".$name.':'.$timestamp.';';
            if($this->upload_dir !== NULL){
                $fname = $this->upload_dir.'/' . $hash .'.'. $ext;
                if($this->log_query)
                    error_log("Writing upload file to ".$fname);
                move_uploaded_file($_FILES[$key]['tmp_name'], $fname);
            }
        }
    }

    function building_delete_query() {
        $this->query = new PDQLQuery();
        $this->query->table($this->primary_table)->delete();
        foreach($this->key_columns_values as $col => $val){
            $this->query->where_eq([$col], $val);
        }
    }

    function applying_filters() {
        if(array_key_exists('column_orders', $this->param)){
            foreach($this->param['column_orders'] as $col => $ord){
                if (in_array($ord, ['ASC','DESC'])){
                    $this->query->order_by($col, $ord);
                }
            }
        }

        if(array_key_exists('column_searches', $this->param)){
            foreach($this->param['column_searches'] as $col => $val){
                if (strpos($col,'+') !== FALSE){
                    $ccolumns = explode('+', $col);
                    $this->query->where_begin('OR');
                    foreach($ccolumns as $ccol){
                        $this->query->where_like([$ccol], "%".$val."%");
                    }
                    $this->query->where_end();

                } else {
                    if ($val == '%any'){
                    //pass do not add filter
                    } elseif ($val == '%empty'){
                        $this->query->where_eq([$col], "");
                    } elseif ($val == '%notempty'){
                        $this->query->where_neq([$col], "");;
                    } elseif ($val == '%nodata'){
                        $this->query->where_begin('OR');
                        $this->query->where_is_null([$col]);
                        $this->query->where_eq([$col], "");
                        $this->query->where_end();
                    } elseif ($val == '%null'){
                        $this->query->where_is_null([$col]);
                    } elseif ($val == '%notnull'){
                        $this->query->where_is_not_null([$col]);
                    } else {
                        $this->query->where_like([$col], "%".$val."%");
                    }
                }
            }
        }

        if(array_key_exists('column_filters', $this->param)){
            foreach($this->param['column_filters'] as $col => $val){
                if ($val == '%any'){
                    //pass do not add filter
                } elseif ($val == '%empty'){
                    $this->query->where_eq([$col], "");
                } elseif ($val == '%notempty'){
                    $this->query->where_neq([$col], "");
                } elseif ($val == '%nodata'){
                    $this->query->where_begin('OR');
                    $this->query->where_is_null([$col]);
                    $this->query->where_eq([$col], "");
                    $this->query->where_end();
                } elseif ($val == '%null'){
                    $this->query->where_is_null([$col]);
                } elseif ($val == '%notnull'){
                    $this->query->where_is_not_null([$col]);
                } else {
                    $this->query->where_eq([$col], $val);
                }
            }
        }

    }

    function applying_limits(){
        if(array_key_exists('page', $this->param)){
            if ($this->param["page"] != 0){
                $this->query->offset($this->param["start"])->limit($this->param["page"]);
            }
        }
    }

    function executing_query() {
        if ($this->operation == 'upload'){
            return;
        }

        if($this->log_query)
            error_log($this->query->sql());

        try {
            $this->data = $this->query->execute($this->db);
        } catch (PDQLQueryException $e) {
            $this->send_error($e->getMessage());
        } catch (PDOException $e) {
            $this->send_error($e->getMessage());
        }

        if ($this->data === false) {
            return; // Error in query
        }

        if (in_array($this->operation, ['select','download','options']) and ($this->data === true)) {
            $this->data = [];
        }

        $this->total_records = $this->query->row_count();
    }

    function sending_result() {
        if(in_array($this->operation, ['select','options','download','custom_read'])){
            $this->call_with_extends('sending_read_result');
        }

        if(in_array($this->operation, ['insert','update','delete','custom_write'])){
            $this->call_with_extends('sending_write_result');
        }

        if($this->operation == 'upload'){
            $this->call_with_extends('sending_upload_result');
        }
    }

    function sending_read_result() {
        if($this->operation == 'select'){
            $this->call_with_extends('sending_select_result');
        } elseif ($this->operation == 'download'){
            $this->call_with_extends('sending_download_result');
        } elseif ($this->operation == 'options'){
            $this->call_with_extends('sending_options_result');
        } elseif ($this->operation == 'custom_read'){
            $this->call_with_extends('sending_custom_result');
        }
    }

    function sending_upload_result() {
        header('Content-Type: application/json;charset=utf-8');
        echo json_encode(['Result'=>'OK', 'Files'=> implode('', $this->file_names)]);
    }

    function sending_write_result() {
        if ($this->operation == 'custom_write'){
            $this->call_with_extends('sending_custom_result');
        } else {
            header('Content-Type: application/json;charset=utf-8');
            echo json_encode(["Result" => "OK"], JSON_UNESCAPED_UNICODE);
        }
    }

    function sending_custom_result() {
        header('Content-Type: application/json;charset=utf-8');
        echo json_encode(["Result" => "OK", "Records" => $this->data], JSON_UNESCAPED_UNICODE);
    }

    function sending_select_result() {
        header('Content-Type: application/json;charset=utf-8');
        echo json_encode(["Result" => "OK", "Records" => $this->data, "TotalRecordCount" => $this->total_records], JSON_UNESCAPED_UNICODE);
    }

    function sending_download_result() {
        header('Content-Type: application/octet-stream');
        header("Content-Transfer-Encoding: Binary"); 
        header("Content-disposition: attachment; filename=\"".$this->param['name']."\""); 

        $head_line = [];
        $allowed_keys = [];

        if (count($this->param['header']) != 0){
            foreach($this->param['header'] as $k => $v){
                $head_line[]=$v;
                $allowed_keys[]=$k;
            }
        } elseif (count($this->data) > 0) {
            $allowed_keys = array_keys($this->data[0]);
        }

        if ($this->param['format'] == 'TXT'){
            $text = '';
            if (count($head_line)>0){
                foreach($head_line as $h){
                    $text.=$h."\t";
                }
                $text.="\n";
            }
            foreach($this->data as $row){
                foreach($allowed_keys as $k){
                    $text.=$row[$k]."\t";
                }
                $text.="\n";
            }
            echo $text;
        } elseif ($this->param['format'] == 'CSV'){
            $text = '';
            if (count($head_line)>0){
                foreach($head_line as $h){
                    $text.='"'.addslashes($h).'"'.';';
                }
                $text.="\r\n";
            }
            foreach($this->data as $row){
                foreach($allowed_keys as $k){
                    $text.='"'.addslashes($row[$k]).'"'.';';
                }
                $text.="\r\n";
            }
            echo $text;
        } else {
            echo json_encode($this->data, JSON_UNESCAPED_UNICODE);
        }
    }

    function sending_options_result() {
            $repacked = [];
            if($this->options_columns !== NULL){
                $key = $this->options_columns[0];
                $value = $this->options_columns[1];
                foreach($this->data as $entry){
                    $repacked[]= [$entry[$key],$entry[$value]];
                }
            } else {
                $repacked = $this->data;
            }
            header('Content-Type: application/json;charset=utf-8');
            echo json_encode(['Result' => 'OK', 'Options' => $repacked], JSON_UNESCAPED_UNICODE);
    }

}
