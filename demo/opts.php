<?php

require "CTableClass.php";
require "database.php";

class MyTable extends CTable {
        function builing_query () {}
        function executing_query () {
            $this->data = [[0,'Unknown'],[1,'OK'], [2,'Blocked']];
        }
}

$t = new MyTable($db, '', []);
$t->process();
 
