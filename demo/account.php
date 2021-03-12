<?php

require "CTableClass.php";
require "database.php";

use Latitude\QueryBuilder\Engine\SqliteEngine;
use function Latitude\QueryBuilder\on;

class MyTable extends CTable {

    function builing_select_query() {
        $this->query = $this->factory->select()->from($this->primary_table);
    }
}

$t = new MyTable($db, 'account', ['id'], new SqliteEngine(),TRUE);
$t->process();
 
