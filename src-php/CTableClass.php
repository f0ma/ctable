<?php

require __DIR__ . '/vendor/autoload.php';

use Latitude\QueryBuilder\Engine\MySqlEngine;
use Latitude\QueryBuilder\Engine\CommonEngine;
use Latitude\QueryBuilder\QueryFactory;
use function Latitude\QueryBuilder\field;
use function Latitude\QueryBuilder\search;
use function Latitude\QueryBuilder\group;
use function Latitude\QueryBuilder\func;
use function Latitude\QueryBuilder\alias;
use function Latitude\QueryBuilder\on;

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
    var $factory;
    var $engine;
    var $data;
    var $key_columns_values;
    var $data_values;
    var $total_records;
    var $writable_columns;
    var $readable_columns;
    var $options_columns;
    var $key_columns;
    var $log_query;

    function send_error($text){
        echo json_encode(["Result" => "Error", "Message" => $text], JSON_UNESCAPED_UNICODE);
        die();
    }

    function __construct($db, $primary_table, $key_columns, $engine = NULL, $log_query = FALSE){
        $this->db = $db;
        $this->log_query = $log_query;

        if ($engine == NULL){
            $this->engine = new MySqlEngine();
        } else {
            $this->engine = $engine;
        }

        // INTERNAL DATA API

        // FOR ALL QUERY:

        // Query factory
        $this->factory = new QueryFactory($this->engine);

        // Allow query
        $this->allowed_query = ['select', 'options', 'insert', 'update', 'delete', 'upload'];

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

    function prepare(){
        // Empty
    }

    function process() {
        $this->call_with_extends('parsing_request');
        if ($this->operation == 'upload'){
            $this->call_with_extends('processing_upload');
        } else {
            $this->call_with_extends('builing_query');
            $this->call_with_extends('executing_query');
        }
        $this->call_with_extends('sending_result');
    }

    function parsing_request() {
        header('Content-Type: application/json;charset=utf-8');
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
        if((count($_FILES) > 0) && in_array('upload', $this->allowed_query)){
            $this->operation = 'upload';
        }
    }

    function builing_query() {
        if(in_array($this->operation, ['select','options'])){
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

            $this->call_with_extends('builing_write_query');
        }

    }

    function building_read_query() {
        if($this->operation == 'select'){
            $this->call_with_extends('builing_select_query');
        } elseif ($this->operation == 'options'){
            $this->call_with_extends('builing_options_query');
        }
    }

    function setting_readable_columns(){
        if($this->readable_columns !== NULL){
            foreach($this->readable_columns as $col){
                $this->query->addColumn($col);
            }
        }
    }

    function setting_options_columns(){
        if($this->options_columns !== NULL){
            foreach($this->options_columns as $col){
                $this->query->addColumn($col);
            }
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

    function builing_write_query() {
        if($this->operation == 'insert'){
            $this->call_with_extends('builing_insert_query');
            $this->call_with_extends('setting_writable_columns');
        } elseif ($this->operation == 'update'){
            $this->call_with_extends('builing_update_query');
            $this->call_with_extends('setting_writable_columns');
        } elseif ($this->operation == 'delete'){
            $this->call_with_extends('builing_delete_query');
        }
    }


    function builing_select_query() {
        $this->query = $this->factory->select()->from($this->primary_table);
    }

    function builing_options_query() {
        $this->query = $this->factory->select()->from($this->primary_table);
    }

    function builing_insert_query() {
        $this->query = $this->factory->insert($this->primary_table, $this->data_values);
    }

    function builing_update_query() {
        $this->query = $this->factory->update($this->primary_table, $this->data_values);
        foreach($this->key_columns_values as $col => $val){
            $this->query->andWhere(field($col)->eq($val));
        }
    }

    function processing_upload() {
        $this->files = [];
        $this->file_names = [];

        foreach ($_FILES as $key => $value){
            if(count($this->files) > $this->files_max_count){
                break;
            }
            if($_FILES[$key]['size'] > $this->files_max_size){
                echo json_encode(['Result'=>'Error', 'Message'=>'File too large']);
            }
            $hash = md5_file($_FILES[$key]['tmp_name']);
            $name = $_FILES[$key]['name'];
            $timestamp = time();
            $ext = pathinfo($_FILES[$key]['name'])['extension'];

            $this->files[] = $_FILES[$key]['tmp_name'];
            $this->file_names[] = "$hash:".$name.':'.$timestamp.';';
            //move_uploaded_file($_FILES[$key]['tmp_name'], 'uploads/' . $hash .'.'. $ext);
        }
    }

    function builing_delete_query() {
        $this->query = $this->factory->delete($this->primary_table);
        foreach($this->key_columns_values as $col => $val){
            $this->query->andWhere(field($col)->eq($val));
        }
    }

    function applying_filters() {
        foreach($this->param['column_orders'] as $col => $ord){
                if (in_array($ord, ['ASC','DESC'])){
                    $this->query->orderBy($col, $ord);
                }
            }

        foreach($this->param['column_searches'] as $col => $val){
                if (strpos($col,'+') !== FALSE){
                    $ccolumns = explode('+', $column);
                    $rule = search($ccolumns[0])->contains($val);
                    foreach(array_slice($ccolumns, 1) as $ccol){
                        $rule->or(search($ccol)->contains($val));
                    }
                    $this->query->andWhere(group($rule));
                } else {
                    $this->query->andWhere(search($col)->contains($val));
                }

        }


        foreach($this->param['column_filters'] as $col => $val){
            $this->query->andWhere(field($col)->eq($val));
        }

    }

    function applying_limits(){
        if ($this->param["page"] != 0){
            $this->query->offset($this->param["start"])->limit($this->param["page"]);
            //$this->query->offset('43; HELLO!')->limit('43; HELLO!');
        }
    }

    function executing_query() {
        if ($this->operation == 'upload'){
            return;
        }

        if(($this->operation == 'select') && (get_class($this->engine) == 'MySqlEngine')){
            $this->query->calcFoundRows(true);
        }

        $this->data = $this->execute_query($this->query);

        if ($this->data === false) {
            return; // Error in query
        }

        if ($this->operation == 'select') {
            if(get_class($this->engine) == 'MySqlEngine'){
                $this->total_records = $this->db->query('SELECT FOUND_ROWS()')->fetch_row()[0];
            } else {
                $this->call_with_extends('building_read_query');
                $this->call_with_extends('applying_filters');
                $this->total_records = count($this->execute_query($this->query));
            }

        }
    }

    function sending_result() {
        if(in_array($this->operation, ['select','options'])){
            $this->call_with_extends('sending_read_result');
        }

        if(in_array($this->operation, ['insert','update','delete'])){
            $this->call_with_extends('sending_write_result');
        }

        if($this->operation == 'upload'){
            $this->call_with_extends('sending_upload_result');
        }
    }

    function sending_read_result() {
        if($this->operation == 'select'){
            $this->call_with_extends('sending_select_result');
        }
        if($this->operation == 'options'){
            $this->call_with_extends('sending_options_result');
        }
    }

    function sending_upload_result() {
        echo json_encode(['Result'=>'OK', 'Files'=> implode($this->file_names,'')]);
    }

    function sending_write_result() {
        echo json_encode(["Result" => "OK"], JSON_UNESCAPED_UNICODE);
    }

    function sending_select_result() {
        echo json_encode(["Result" => "OK", "Records" => $this->data, "TotalRecordCount" => $this->total_records], JSON_UNESCAPED_UNICODE);
    }

    function sending_options_result() {
        echo json_encode(['Result' => 'OK', 'Options' => $this->data], JSON_UNESCAPED_UNICODE);
    }

    function execute_query($query){
        if ($query != NULL) {
            $query->compile();
            $sqlquery = $query->sql($this->engine);
            $stmt = $this->db->prepare($sqlquery);
            if($this->log_query){
                error_log('SQL: '.$sqlquery);
            }
            if(is_bool($stmt)){
                $error_txt = implode(' ',$this->db->errorInfo());
                error_log('QUERY: '.$sqlquery);
                error_log('ERROR: '.$error_txt);
                $this->send_error($error_txt);
                return false;
            }
            $stmt->setFetchMode(PDO::FETCH_ASSOC);
            if($stmt->execute($query->params($this->engine))){
                $rdata = [];
                while($row = $stmt->fetch()){
                    $rdata[]=$row;
                }
                if(count($rdata) == 0){
                    return true;
                }
                return $rdata;
            }else{
                $error_txt = implode(' ',$this->db->errorInfo());
                error_log('QUERY: '.$sqlquery);
                error_log('ERROR: '.$error_txt);
                $this->send_error($error_txt);
                return false;
            }
        }
        return true;
    }
}
