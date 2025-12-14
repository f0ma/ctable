<?php

class Account {
    private $db;
    private $user_data;

    function __construct(){
        $this->db = connect_to_database();
        $this->user_data = get_user_data();
    }

    static function load_table_config(){
        return json_decode(file_get_contents('account.json'), true);
    }

    public function select($path, $filter=[], $order=[], $limit=100, $offset=0) {

        $q = SQLYamlQuery::simple_select("account", ["id", "firstname", "lastname", "reg_date", "status", "image", "tags", "files"]);

        apply_filters($q, ["id", "firstname", "lastname", "reg_date", "status", "image", "tags", "files"], $filter, $order, $limit, $offset);

        //error_log(var_export($q->query, true));

        $rows = $q->execute($this->db, [], $accept = 'ok', $calc_rows = TRUE);
        $num = $q->found_rows();

        SQLYamlQuery::enrich_data_by_link($this->db, $rows, "bills", "bill", "id", "id", "account_id");

        //SQLYamlQuery::update_link_data($row, "bills", "bill", ["id" => "account_id"]);

        foreach($rows as &$r){
            $r["firstname"] = '<b>'.$r["firstname"].'<b>';
        }

        return ["rows" => $rows, "total" => $num];
    }

    public function insert($path, $data) {
        $q = SQLYamlQuery::simple_insert("account", ["firstname", "lastname", "reg_date", "status", "image", "tags", "files"], $data);
        $q->execute($this->db);

        return ["insert" => ["id" => $this->db->lastInsertId()]];
    }

    public function update($path, $keys, $data) {
        //error_log(var_export($data, true));


        $q = SQLYamlQuery::simple_update("account", ["id"], $keys, ["firstname", "lastname", "reg_date", "status", "image", "tags", "files"], $data);

        //error_log(var_export($q->query, true));

        $q->execute($this->db);

        return ["update" => $keys];
    }

    public function duplicate($path, $keys) {
        $q = SQLYamlQuery::simple_copy("account", ["id"], $keys, ["firstname", "lastname", "reg_date", "status", "image", "tags", "files"]);
        $q->execute($this->db);
    }

    public function delete($path, $keys) {
        $q = SQLYamlQuery::simple_delete("account", ["id"], $keys);
        $q->execute($this->db);
    }

    public function options($path, $filter=[], $limit=0) {

        $q = SQLYamlQuery::simple_select("account", ["id"]);
        $q->query['select']['columns'][]=["sql"=>"CONCAT(`firstname`,\" \",`lastname`) as `name`"];


        apply_filters($q, ["id", "name"], $filter, [['name'=>"asc"]], $limit, 0);

        //error_log(var_export($q->query, true));

        //error_log($q->sql());

        $rows = $q->execute($this->db);

        return ["rows" => $rows, "keys" => ["id"], "label" => "name"];
    }

    public function download($path, $keys, $column, $index){
        $q = SQLYamlQuery::simple_select("account", ["files"], ['id'], $keys);
        $rows = $q->execute($this->db);
        $row = $rows[0];
        $parts = explode(';', $row['files']);
        $file_info = explode(':',$parts[$index]);
        return ["file"=>$file_info[0], "size"=>$file_info[1], "name"=>$file_info[2]];
    }

    public function print_table($path, $keys){
        $file = __DIR__ . "/demo.timestamp";
        return ["file"=>$file, "size"=>filesize($file), "name"=>'demo.txt'];
    }

    public function take_action($path, $keys){
        return [];
    }
}
