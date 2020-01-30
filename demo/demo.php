<?php

// This is demo code for ctables CRUD
// Please do not use this code in production!
// Multiple secure checks against SQL injections is omitted!

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

header("Content-type: application/json; charset=utf-8");

$db = new SQLite3($dblocrw); 

$table = $db->escapeString($_GET['table']);

if(isset($_GET['select'])){

    sleep(1.5); // For loading bar

    $opts = json_decode($_GET['select'], true);

    $whereword = '';

    if(isset($opts['column_filters']) and count($opts['column_filters']) > 0){
        $rules = [];
        foreach($opts['column_filters'] as $column => $filter){
            $rules[]= $db->escapeString($column).' = "'.$db->escapeString($filter).'"';
        }
        if ($whereword == '') {
            $whereword = " WHERE ";
        }
        $whereword.= implode('AND ',$rules)." ";
    }

    if(isset($opts['column_searches']) and count($opts['column_searches']) > 0){
        $rules = [];
        foreach($opts['column_searches'] as $column => $filter){
            $rules[]= $db->escapeString($column).' LIKE "'.$db->escapeString("%".$filter."%").'"';
        }
        if ($whereword == '') {
            $whereword = " WHERE ";
        } else {
            $whereword.= ' AND ';
        }
        $whereword.= implode(' AND ',$rules)." ";
    }

    $ordword = '';

    if(isset($opts['column_orders']) and count($opts['column_orders']) > 0){
        $rules = [];
        foreach($opts['column_orders'] as $column => $order){
            $rules[]= $db->escapeString($column)." ".$db->escapeString($order);
        }
        $ordword = " ORDER BY ".implode(', ',$rules)." ";
    }

    $limitword = '';

    if(isset($opts['start']) and $opts['page']){
        $limitword.="LIMIT ".$opts['start'].", ".$opts['page'];
    }

    $result = $db->query('SELECT * FROM '.$table.' '.$whereword.' '.$ordword.' '.$limitword);

    $records = [];

    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $records[]=$row;
    }

    $count = $db->query('SELECT COUNT(*) as N FROM '.$table.' '.$whereword)->fetchArray(SQLITE3_ASSOC)['N'];

    echo json_encode(['Result'=>'OK','Records'=>$records,'TotalRecordCount'=>$count]);
}

if(isset($_POST['insert'])){
    sleep(0.5);

    $rec = json_decode($_POST['insert'], true);

    $intolist = [];
    $valuelist = [];

    foreach ($rec as $key => $value){
        $intolist[]= $db->escapeString($key);
        $valuelist[]= '"'.$db->escapeString($value).'"';
    }
    $intoword = implode(', ', $intolist);
    $valueword = implode(', ', $valuelist);

    error_log('INSERT INTO '.$table.' ('.$intoword.') VALUES ('.$valueword.')');

    $db->query('INSERT INTO '.$table.' ('.$intoword.') VALUES ('.$valueword.')');

    echo json_encode(['Result'=>'OK']);
}


if(isset($_POST['update'])){
    sleep(0.5);

    $rec = json_decode($_POST['update'], true);

    $setlist = [];
    foreach ($rec as $key => $value){
        $setlist[]= $db->escapeString($key).' = "'.$db->escapeString($value).'"';
    }
    $setword = implode(', ', $setlist);

    $db->query('UPDATE '.$table.' SET '.$setword.' WHERE id='.$db->escapeString($rec['id']));

    echo json_encode(['Result'=>'OK']);
}

if(isset($_POST['delete'])){
    sleep(0.5);

    $rec = json_decode($_POST['delete'], true);
    $db->query('DELETE FROM '.$table.' WHERE id='.$db->escapeString($rec['id']));
    echo json_encode(['Result'=>'OK']);
}

if(isset($_GET['options'])){
    sleep(0.5);
    echo json_encode(['Result' => 'OK', 'Options' => [[0,'Unknown'],[1,'OK'], [2,'Blocked']]]);
}

if(isset($_GET['upload'])){
    sleep(2);

    $files = '';

    foreach ($_FILES as $key => $value){
        if($_FILES[$key]['size'] > 1000000){
            echo json_encode(['Result'=>'Error', 'Message'=>'File too large']);
        }
        $hash = md5_file($_FILES[$key]['tmp_name']);
        $name = $_FILES[$key]['name'];
        $timestamp = time();
        $ext = pathinfo($_FILES[$key]['name'])['extension'];

        //move_uploaded_file($_FILES[$key]['tmp_name'], 'uploads/' . $hash .'.'. $ext);

        $files .= '$hash:'.$name.':'.$timestamp.';';
    }

    echo json_encode(['Result'=>'OK', 'Files'=> $files]);
}

?>

