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

        return ["rows" => $rows, "total" => $num];
    }

    public function insert($path, $data) {
        $q = SQLYamlQuery::simple_insert("test", ["text", "verify"], $data);
        $q->execute($this->db);
    }

    public function update($path, $keys, $data) {
        error_log(var_export($data, true));


        $q = SQLYamlQuery::simple_update("test", ["id"], $keys, ["text", "verify"], $data);

        error_log(var_export($q->query, true));

        $q->execute($this->db);
    }

    public function duplicate($path, $keys) {
        $q = SQLYamlQuery::simple_copy("test", ["id"], $keys, ["text", "verify"]);
        $q->execute($this->db);
    }

    public function delete($path, $keys) {
        $q = SQLYamlQuery::simple_delete("test", ["id"], $keys);
        $q->execute($this->db);
    }

/*    public function options($path, $filter=[], $limit=0) {

        $q = SQLYamlQuery::simple_select("test", ["id"]);
        $q->query['select']['columns'][]=["sql"=>"CONCAT(`firstname`,\" \",`lastname`) as `name`"];


        apply_filters($q, ["id", "name"], $filter, ['name'=>"asc"], $limit, 0);

        error_log(var_export($q->query, true));

        error_log($q->sql());

        $rows = $q->execute($this->db);

        return ["rows" => $rows, "keys" => ["id"], "label" => "name"];
    }
*/
}
