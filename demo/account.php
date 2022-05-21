<?php

require "CTableClass.php";
require "database.php";

class MyTable extends CTable {

}

$t = new MyTable($db, 'account', ['id'], TRUE);
$t->set_upload_dir('/tmp');
$t->process();
 
