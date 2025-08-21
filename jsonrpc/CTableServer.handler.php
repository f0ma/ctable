<?php

require "Database.php";

$tableChanged = new JsonRPCSignal('tableChanged');

function apply_path ($q, $columns, $path){
    $query_kind = $q->top_level_query();

    if($query_kind == "select" || $query_kind == "update" || $query_kind == "delete"){
        foreach($path as $p){
            if(isset($p["mapping"])){
                foreach($p["mapping"] as $m){
                    if(!in_array($m[1], $columns)) throw new Exception("Unexpected column ".$m[1]);
                    $q->query[$query_kind]['where'][]=["eq"=>[$m[1],["const"=>$p['keys'][$m[0]]]]];
                }
            }
        }
    }

    if($query_kind == "insert"){
        if(isset($q->query[$query_kind]['select'])) {
            foreach($path as $p){
                if(isset($p["mapping"])){
                    foreach($p["mapping"] as $m){
                        if(!in_array($m[1], $columns)) throw new Exception("Unexpected column ".$m[1]);
                        $q->query[$query_kind]['columns'][]=$m[1];
                        $q->query[$query_kind]['select']['columns'][]=$m[1];
                        $q->query[$query_kind]['select']['where'][]=["eq"=>[$m[1],["const"=>$p['keys'][$m[0]]]]];
                    }
                }
            }
        } else {
            foreach($path as $p){
                if(isset($p["mapping"])){
                    foreach($p["mapping"] as $m){
                        if(!in_array($m[1], $columns)) throw new Exception("Unexpected column ".$m[1]);
                        $q->query[$query_kind]['columns'][]=$m[1];
                        $q->query[$query_kind]['values'][]=["const"=>$p['keys'][$m[0]]];
                    }
                }
            }
        }
    }

    //return $q;
}

function apply_filters($q, $columns, $filter=[], $order=[], $limit=0, $offset=0){
    $query_kind = $q->top_level_query();
    if ($query_kind != "select") throw new Exception("Filters uses with select only");

    $allowed_filters = ["eq","neq","ge","gt","le","lt","like","is_null","is_not_null","like_l","like_r","like_lr"];
    if($filter !== NULL){
        foreach($filter as $f){
            if(!in_array($f[0], $allowed_filters)) throw new Exception("Unexpected filter ".$f[0]);
            if(!in_array($f[1], $columns)) throw new Exception("Unexpected column ".$f[1]);
            if(in_array($f[0], ["eq","neq","ge","gt","le","lt","like"])){
                $q->query['select']['where'][]=[$f[0]=>[$f[1],["const"=>$f[2]]]];
            }
            if(in_array($f[0], ["like_l"])){
                $q->query['select']['where'][]=['like'=>[$f[1],["const"=>"%".$f[2]]]];
            }
            if(in_array($f[0], ["like_r"])){
                $q->query['select']['where'][]=['like'=>[$f[1],["const"=>$f[2]."%"]]];
            }
            if(in_array($f[0], ["like_lr"])){
                $q->query['select']['where'][]=['like'=>[$f[1],["const"=>"%".$f[2]."%"]]];
            }
            if(in_array($f[0], ["is_null","is_not_null"])){
                $q->query['select']['where'][]=[$f[0]=>[$f[1]]];
            }
        }
    }
    error_log(var_export($order, true));
    if($order !== NULL){
        foreach($order as $sord){
            foreach($sord as $cl => $ord){
                if(!in_array($cl, $columns)) throw new Exception("Unexpected column ".$cl);
                if(!in_array($ord, ["asc","desc"])) throw new Exception("Unexpected order ".$ord);
                $q->query['select']['order_by'][]=[$cl=>$ord];
            }
        }
    }
    if($limit !== NULL){
        if ($limit != 0){
            $q->query['select']['limit']=$limit;
            }
    }
    if($offset !== NULL){
        if ($offset != 0){
            $q->query['select']['offset']=$offset;
        }
    }

    //return $q;
}

class CTableServer extends JsonRPCHandler {

    private $table_configs = [];
    private $table_classes = [];
    private $table_files = [];

    function __construct(){
        foreach (glob("*.table.php") as $filename) {
            list($class_name, $tail) = explode('.', $filename, 2);
            if(!class_exists($class_name)){
                require $filename;
            }
            $table_info = $class_name::load_table_config();
            $this->table_configs[$table_info['name']] = $table_info;
            $this->table_classes[$table_info['name']] = $class_name;
        }
    }

    public function tables() {
        $result = [];
        foreach($this->table_configs as $k => $v){
            $result[]=["name"=>$v["name"], "label"=>$v["label"], "width" => $v["width"], "default_sorting" => $v["default_sorting"], "default_filtering" => $v["default_filtering"]];
        }
        return $result;
    }

    public function links() {
        return [["url"=>"https://google.com", "label"=>"Ссылка вот"]];
    }

    public function columns($table_name) {
        return $this->table_configs[$table_name]['columns'];
    }

    public function subtables($table_name) {
        if(!isset($this->table_configs[$table_name]['subtables']))
            return [];
        return $this->table_configs[$table_name]['subtables'];
    }

    public function select($path, $filter=[], $order=[], $limit=0, $offset=0) {

        $target = end($path)["table"];

        $qhandler = new $this->table_classes[$target]();

        return $qhandler->select($path, $filter,$order,$limit,$offset);
    }

    public function insert($path, $data) {

        $target = end($path)["table"];

        $qhandler = new $this->table_classes[$target]();

        $qhandler->insert($path, $data);
    }

    public function update($path, $keys, $data) {
        $target = end($path)["table"];

        $qhandler = new $this->table_classes[$target]();

        foreach ($keys as $k){
            $qhandler->update($path, $k, $data);
        }
    }

    public function duplicate($path, $keys) {
        $target = end($path)["table"];

        $qhandler = new $this->table_classes[$target]();

        foreach ($keys as $k){
            $qhandler->duplicate($path, $k);
        }


    }

    public function delete($path, $keys) {
        $target = end($path)["table"];

        $qhandler = new $this->table_classes[$target]();

        foreach ($keys as $k){
            $qhandler->delete($path, $k);
        }

    }

    public function options($path, $filter=[], $limit=0) {
        $target = end($path)["table"];

        $qhandler = new $this->table_classes[$target]();

        return $qhandler->options($path, $filter, $limit);
    }
}
