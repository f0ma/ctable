<?php

require "CTableClass.php";
require "database.php";

use Latitude\QueryBuilder\Engine\SqliteEngine;

class MyTable extends CTable {

}

$t = new MyTable($db, 'bill', ['id'], new SqliteEngine());
$t->process();
 
