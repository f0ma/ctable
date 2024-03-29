<?php

$dbloc = "demo.db";
$dblocrw = "demo.real.db";
$dbmtime = "demo.timestamp";

$mtime = 0;

if (file_exists($dbmtime)){
    $mtime = file_get_contents($dbmtime);
}

if( time() - $mtime > 60*15){
    unlink($dblocrw);
    copy($dbloc,$dblocrw);
    file_put_contents($dbmtime, time());
}

$db = new PDO("sqlite:".$dblocrw);

//$db->setAttribute(PDO::MYSQL_ATTR_FOUND_ROWS, TRUE);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
