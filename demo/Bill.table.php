<?php

class Bill {
    private $db;

    function __construct(){
        $this->db = connect_to_database();
    }

    static function load_table_config(){
        return json_decode(file_get_contents('bill.json'), true);
    }

    public function select($path, $filter=[], $order=[], $limit=0, $offset=0) {

        $q = SQLYamlQuery::simple_select("bill", ["id", "account_id", "date", "sum", "state"]);

        apply_path($q, ["account_id"], $path);
        apply_filters($q, ["id", "account_id", "date", "sum", "state"], $filter, $order, $limit, $offset);

        $rows = $q->execute($this->db, [], $accept = 'ok', $calc_rows = TRUE);
        $num = $q->found_rows();

        return ["rows" => $rows, "total" => $num];
    }

    public function insert($path, $data) {
        $q = SQLYamlQuery::simple_insert("bill", ["date", "sum", "state"], $data);

        apply_path($q, ["account_id"], $path);

        $q->execute($this->db);
    }

    public function update($path, $keys, $data) {
        $q = SQLYamlQuery::simple_update("bill", ["id"], $keys, ["account_id", "date", "sum", "state"], $data);
        error_log(var_export($q->query, true));

        //$q->execute($this->db);

        //apply_path($q, ["account_id"], $path);

        $q->execute($this->db);
    }

    public function duplicate($path, $keys) {
        $q = SQLYamlQuery::simple_copy("bill", ["id"], $keys, ["account_id", "date", "sum", "state"]);

        apply_path($q, ["account_id"], $path);

        $q->execute($this->db);
    }

    public function delete($path, $keys) {
        $q = SQLYamlQuery::simple_delete("bill", ["id"], $keys);

        apply_path($q, ["account_id"], $path);

        $q->execute($this->db);
    }

    public function options($path, $filter=[], $limit=100) {

        $q = SQLYamlQuery::simple_select("bill", ["id"]);
        $q->query['select']['columns'][]=["sql"=>"CONCAT(`sum`,\"$\") as `proc`"];


        apply_filters($q, ["id", "proc"], $filter, [], $limit, 0);

        error_log(var_export($q->query, true));

        error_log($q->sql());

        $rows = $q->execute($this->db);

        return ["rows" => $rows, "keys" => ["id"], "label" => "proc"];
    }


}
