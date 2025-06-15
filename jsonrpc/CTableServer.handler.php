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


$tableChanged = new JsonRPCSignal('tableChanged');

class CTableServer extends JsonRPCHandler {
    public function tables() {
        return [["name"=>"account", "label"=>"Accounts", "width" => 60]];
    }

    public function links() {
        return [["url"=>"https://google.com", "label"=>"Ссылка вот"]];
    }

    public function columns($table_name) {
        if($table_name == 'account'){
            return json_decode(file_get_contents('account.json'), true)['columns'];
        }
    }

    public function select($table_name, $filter=[], $order=[], $limit=100, $offset=0) {
        global $db;
        if($table_name == 'account'){
            $stmt = $db->query("SELECT `id`, `firstname`, `lastname`, `reg_date`, `status`, `image`, `tags` FROM `account`");
            return $stmt->fetchAll();
        }
        return [];
    }

    public function insert($table_name, $data) {
        global $db;
        //global $tableChanged;
        if($table_name == 'account'){
            $col_list = [];
            $set_list = [];
            $key_list = [];

            foreach(['firstname', 'lastname', 'reg_date', 'status', 'image', 'tags'] as $col){
                if(array_key_exists($col, $data)){
                    $col_list[]='`'.$col.'`';
                    $set_list[]=':'.$col;
                    $key_list[]=$col;
                }
            }

            $stmt = $db->prepare("INSERT INTO `account` (".implode(', ', $col_list).") VALUES (".implode(', ', $set_list).")");

            foreach($key_list as $col){
                $stmt->bindParam(':'.$col , $data[$col], PDO::PARAM_STR);
            }

            $stmt->execute();
        }
        //$tableChanged->emit($table_name);
    }

    public function update($table_name, $keys, $data) {
        global $db;
        //global $tableChanged;
        if($table_name == 'account'){
            foreach ($keys as $k){
                $set_expr = [];
                foreach($data as $col => $val){
                    $set_expr[]= "`$col` = :$col";
                }
                $stmt = $db->prepare("UPDATE `account` SET ".implode(", ", $set_expr)." WHERE `id` = :id");
                $stmt->bindParam(':id', $k['id'], PDO::PARAM_INT);
                foreach($data as $col => $val){
                    $stmt->bindParam(':'.$col, $data[$col], PDO::PARAM_STR);
                }
                $stmt->execute();
            }
        }
        //$tableChanged->emit($table_name);
    }

    public function duplicate($table_name, $keys) {
        global $db;
        //global $tableChanged;
        if($table_name == 'account'){
            foreach ($keys as $k){
                $stmt = $db->prepare("INSERT INTO `account` (`firstname`, `lastname`, `reg_date`, `status`, `image`, `tags`) SELECT `firstname`, `lastname`, `reg_date`, `status`, `image`, `tags` FROM `account` WHERE `id` = :id");
                $stmt->bindParam(':id', $k['id'], PDO::PARAM_INT);
                $stmt->execute();
            }
            //$tableChanged->emit($table_name);
        }

    }

    public function delete($table_name, $keys) {
        global $db;
        //global $tableChanged;
        if($table_name == 'account'){
            foreach ($keys as $k){
                $stmt = $db->prepare("DELETE FROM `account` WHERE `id` = :id");
                $stmt->bindParam(':id', $k['id'], PDO::PARAM_INT);
                $stmt->execute();
            }
            //$tableChanged->emit($table_name);
        }
    }

    public function options($table_name, $filter=[], $limit=100) {
        return [ "1"=>"Jones", "2"=>"Joan", "3"=>"Gill"];
    }
}
