<?php

require "SQLYamlQuery.php";

function connect_to_database() {

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

    return $db;

}

function client_config() {
    return ["jwt_token"=>"server-key-update-in-production", "uploads_directory"=>"uploads", "jwt_expires"=> 24*60*60, "jwt_renew" => 12*60*60];
}

function client_login($username, $password){
    //error_log(password_hash($password, PASSWORD_DEFAULT));

    $q = SQLYamlQuery::simple_select("user", ["id", "user", "club_name", "enable", "hash"]);
    $q->query['select']['where'][]= ['eq'=>[ "user", ['const' => $username]]];
    $q->query['select']['where'][]= ['eq'=>[ "enable", ['const' => 1]]];
    $q->query['select']['limit'] = 1;
    $rows = $q->execute(connect_to_database(), [], $accept = 'one');
    $row = $rows[0];

    if (password_verify($password, $row["hash"])){
        unset($row["hash"]);
        unset($row["enable"]);
        return $row;
    }

    return NULL;
}

function client_renew($userinfo){
    $q = SQLYamlQuery::simple_select("user", ["id", "user", "club_name"]);
    $q->query['select']['where'][]= ['eq'=>[ "user", ['const' => $userinfo["user"]]]];
    $q->query['select']['where'][]= ['eq'=>[ "enable", ['const' => 1]]];
    $q->query['select']['limit'] = 1;
    $rows = $q->execute(connect_to_database(), [], $accept = 'one');
    $row = $rows[0];
    return $row;
}

function client_logout($userinfo){
    return NULL;
}
