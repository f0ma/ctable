<?php

require "CTableClass.php";
require "database.php";

class MyTable extends CTable {

    function sending_upload_result() {
        header('Content-Type: application/json;charset=utf-8');
        echo json_encode(['Result'=>'OK', 'Filename'=> '/tmp/test.png']);
    }

}

$t = new MyTable($db, 'account', ['id'], TRUE);
$t->set_upload_dir('/tmp');
$t->process();
 
