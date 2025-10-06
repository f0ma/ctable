<?php

class Test {
    private $db;

    function __construct(){
        $this->db = connect_to_database();
    }

    static function load_table_config(){
        return json_decode(file_get_contents('test.json'), true);
    }

    public function select($path, $filter=[], $order=[], $limit=100, $offset=0) {

        $q = SQLYamlQuery::simple_select("test", ["id", "text", "verify"]);

        #apply_filters($q, ["id", "text", "verify"], $filter, $order, $limit, $offset);

        error_log(var_export($q->query, true));

        $rows = $q->execute($this->db, [], $accept = 'ok', $calc_rows = TRUE);
        $num = $q->found_rows();

        SQLYamlQuery::enrich_data_by_link($this->db, $rows, "members", "team", "account_id", "id", "test_id");

        return ["rows" => $rows, "total" => $num];
    }

    public function insert($path, $data) {
        $q = SQLYamlQuery::simple_insert("test", ["text", "verify"], $data);
        $q->execute($this->db);

        $last_id = $this->db->lastInsertId();

        SQLYamlQuery::sync_data_by_link($this->db, $data["members"], "team", "account_id", $last_id, "test_id");
    }

    public function update($path, $keys, $data) {

        if(array_key_exists("text", $data) || array_key_exists("verify", $data)){
            $q = SQLYamlQuery::simple_update("test", ["id"], $keys, ["text", "verify"], $data);
            $q->execute($this->db);
        }

        if(array_key_exists("members", $data)){
            SQLYamlQuery::sync_data_by_link($this->db, $data["members"], "team", "account_id", $keys["id"], "test_id");
        }
    }

    public function duplicate($path, $keys) {
        $q = SQLYamlQuery::simple_copy("test", ["id"], $keys, ["text", "verify"]);
        $q->execute($this->db);

        $last_id = $this->db->lastInsertId();
        $rows = [["id" => $keys["id"]]];

        SQLYamlQuery::enrich_data_by_link($this->db, $rows, "members", "team", "account_id", "id", "test_id");
        SQLYamlQuery::sync_data_by_link($this->db, $rows[0]["members"], "team", "account_id", $last_id, "test_id");
    }

    public function delete($path, $keys) {
        $q = SQLYamlQuery::simple_delete("test", ["id"], $keys);
        $q->execute($this->db);

        SQLYamlQuery::sync_data_by_link($this->db, "", "team", "account_id", $keys["id"], "test_id");
    }

}
