<?php

require "CTableClass.php";
require "database.php";

class MyTable extends CTable {
        function builing_query () {}
        function executing_query () {}
        function fill_data_before_sending_options_result () {
            $this->data = [[0,'Unknown'],[1,'OK'], [2,'Blocked'],[10,'Unknown'],[11,'OK'], [12,'Blocked'],[20,'Unknown'],[21,'OK'], [22,'Blocked'],[30,'Unknown'],[31,'OK'], [32,'Blocked'],[40,'Unknown'],[41,'OK'], [42,'Blocked']];
        }
}

$t = new MyTable($db, '', []);
$t->process();
 
