<?php

require "CTableClass.php";
require "database.php";

class MyTable extends CTable {
        function builing_query () {}
        function executing_query () {}
        function fill_data_before_sending_options_result () {
            $this->data = [[0,'Unknown'],[1,'OK'], [2,'Blocked']];
        }
}

$t = new MyTable($db, '', []);
$t->process();
 
