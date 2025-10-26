<?php


function base64UrlEncode(string $data): string
{
    $base64Url = strtr(base64_encode($data), '+/', '-_');

    return rtrim($base64Url, '=');
}

function base64UrlDecode(string $base64Url): string
{
    return base64_decode(strtr($base64Url, '-_', '+/'));
}

interface YamlCodec {
    static function from_yaml($s);
    static function to_yaml($s);
}

include('Spyc.php');

class YamlCodecSpyc implements YamlCodec {
    static function from_yaml($s) {
        return spyc_load($s);
    }
    static function to_yaml($s){
        return spyc_dump($s);
    }
}


class SQLYamlQuery {

    private $vars;
    private $binds;
    public $query;
    private $codec;
    private $total_rows;

    static function simple_delete($table, $keys_should, $keys, $codec = YamlCodecSpyc::class){
        $query = <<<EOF
        ---
        delete:
          table: ""
          where: []
        EOF;
        $d = $codec::from_yaml($query);
        $d['delete']['table'] = $table;
        foreach($keys_should as $k){
            if(!array_key_exists($k, $keys)) throw new Exception("Insuffitient key ".$k);
            $d['delete']['where'][]= ['eq'=>[$k,['const' => $keys[$k]]]];
        }
        return new SQLYamlQuery($d, $codec = $codec);
    }

    static function simple_update($table, $keys_should, $keys, $columns_may, $columns, $codec = YamlCodecSpyc::class){
        $query = <<<EOF
        ---
        update:
          table: ""
          columns: []
          values: []
          where: []
        EOF;
        $d = $codec::from_yaml($query);
        $d['update']['table'] = $table;
        foreach($columns_may as $k){
            if(array_key_exists($k, $columns)){
                //error_log(var_export("-->".$k, true));

                $d['update']['columns'][]= $k;
                $d['update']['values'][]= ['const' => $columns[$k]];
            }
        }
        foreach($keys_should as $k){
            if(!array_key_exists($k, $keys)) throw new Exception("Insuffitient key ".$k);
            $d['update']['where'][]= ['eq'=>[$k,['const' => $keys[$k]]]];
        }

        return new SQLYamlQuery($d, $codec = $codec);
    }

    static function simple_select($table, $columns, $keys_should=[], $keys=[], $codec = YamlCodecSpyc::class){
        $query = <<<EOF
        ---
        select:
          columns: []
          from: []
          where: []
        EOF;
        $d = $codec::from_yaml($query);
        $d['select']['columns'] = $columns;
        $d['select']['from'] = [$table];

        foreach($keys_should as $k){
            if(!array_key_exists($k, $keys)) throw new Exception("Insuffitient key ".$k);
            $d['select']['where'][]= ['eq'=>[$k,['const' => $keys[$k]]]];
        }

        return new SQLYamlQuery($d, $codec = $codec);
    }


    static function enrich_data_by_link($db, &$rows, $new_column, $table, $column, $link_src, $link_tgt, $codec = YamlCodecSpyc::class){

        $in_list = [];

        foreach($rows as &$row){
            $in_list[] = ['const'=>$row[$link_src]];
            $row[$new_column] = "";
        }

        $query = <<<EOF
        ---
        select:
          columns: []
          from: []
          where: []
        EOF;
        $d = $codec::from_yaml($query);
        $d['select']['columns'] = [$column, $link_tgt];
        $d['select']['from'] = [$table];
        $d['select']['where'][]= ['in'=>[$link_tgt, $in_list]];

        $q = new SQLYamlQuery($d, $codec = $codec);

        $link_data = $q->execute($db, [], $accept = 'ok');

        foreach($link_data as $ld){
            foreach($rows as &$row){
                if($row[$link_src] == $ld[$link_tgt])
                {
                    if($row[$new_column] == ""){
                        $row[$new_column] = "".$ld[$column];
                    } else {
                        $row[$new_column].= ";".$ld[$column];
                    }

                }
            }
        }
    }


    static function sync_data_by_link($db, $data, $table, $column, $value, $link_tgt){
        $q1 = SQLYamlQuery::simple_delete($table, [$link_tgt], [$link_tgt => $value]);
        //error_log(var_export($q1->sql(), true));
        $q1->execute($db, [], $accept = 'ok');
        if($data == "") return;
        foreach(explode(';',$data) as $d){
            $q2 = SQLYamlQuery::simple_insert($table, [$column, $link_tgt], [$column => $d, $link_tgt => $value]);
            //error_log(var_export($q2->sql(), true));
            $q2->execute($db, [], $accept = 'ok');
        }
    }

    static function simple_insert($table, $columns_may, $columns, $codec = YamlCodecSpyc::class){
        $query = <<<EOF
        ---
        insert:
            table: ""
            columns: []
            values: []
        EOF;
        $d = $codec::from_yaml($query);
        $d['insert']['table'] = $table;
        foreach($columns_may as $k){
            if(array_key_exists($k, $columns)){
                $d['insert']['columns'][]= $k;
                $d['insert']['values'][]= ['const' => $columns[$k]];
            }
        }
        return new SQLYamlQuery($d, $codec = $codec);
    }

    static function simple_copy($table, $keys_should, $keys, $columns, $codec = YamlCodecSpyc::class){
        $query = <<<EOF
        ---
        insert:
            table: ""
            columns: []
            select:
               columns: []
               from: []
               where: []
        EOF;
        $d = $codec::from_yaml($query);
        $d['insert']['table'] = $table;
        $d['insert']['select']['from'] = [$table];
        $d['insert']['select']['columns'] = $columns;
        $d['insert']['columns'] = $columns;

        foreach($keys_should as $k){
            if(!array_key_exists($k, $keys)) throw new Exception("Insuffitient key ".$k);
            $d['insert']['select']['where'][]= ['eq'=>[$k,['const' => $keys[$k]]]];
        }

        return new SQLYamlQuery($d, $codec = $codec);
    }

    function sql(){
        $this->vars = [];
        return $this->visit([], $this->query);;
    }

    function bind($var, $val){
        $this->binds[$var] = $val;
    }

    function __construct ($data = NULL, $codec = YamlCodecSpyc::class){
        $this->codec = $codec;
        $this->vars = [];
        $this->binds = [];
        $this->query = NULL;

        if ($data instanceof SQLYamlQuery){
            $this->query = $data->query;
        } elseif(is_array($data)) {
            $this->query = $data;
        } elseif(is_string($data)) {
            $this->query = $this->codec::from_yaml($data);
        }

    }

    function merge($data = NULL) {
        $merger = [];
        if ($data instanceof SQLYamlQuery){
            $merger = $data->query;
        } elseif(is_array($data)) {
            $merger = $data;
        } else  if(is_string($data)) {
            $merger = $this->codec::from_yaml($data);
        }
        $this->query = array_merge_recursive($this->query, $merger);
        return $this;
    }

    function replace($data = NULL) {
        $merger = [];
        if ($data instanceof SQLYamlQuery){
            $merger = $data->query;
        } elseif(is_array($data)) {
            $merger = $data;
        } else  if(is_string($data)) {
            $merger = $this->codec::from_yaml($data);
        }
        $this->query = array_replace_recursive($this->query, $merger);
        return $this;
    }

    function visit($path, $node, $implode_list = true){

        if(!is_array($node)){
            if (end($path) == "var"){
                $this->vars[]=$node;
                return ":".$node;
            } elseif (end($path) == "const"){
                if(is_string($node)){
                    return '"'.addslashes($node).'"';
                } elseif (is_bool($node)){
                    return $node ? "TRUE" : "FALSE";
                } elseif (is_null($node)){
                    return "NULL";
                } else {
                    return (string) $node;
                }

            } elseif (is_string($node)){
                // By default is ident

                preg_match('/([\w.]+)(\s+(as)\s+(\w+))?/', $node, $matches);

                $alias = "";
                $iname = $matches[1];

                if(count($matches) == 5){
                    $alias = " AS `".$matches[4]."`";
                }

                $icmps = explode(".",$iname);
                $icmps2 = [];
                foreach($icmps as $c){
                    $icmps2[]='`'.$c.'`';
                }
                return implode(".",$icmps2).$alias;

            }
            return $node;
        }
        if(array_is_list($node)){
            //if (str_starts_with(end($path), "fn ")){
            //
            //}

            $results = [];
            foreach ($node as $snode){
                $results[]=$this->visit($path, $snode);
            }
            if($implode_list){
                return implode(", ", $results);
            } else {
                return $results;
            }
        } else {
            $results = [];
            foreach ($node as $knode=>$vnode){
                $mpath = $path;
                $mpath[]=$knode;

                if (method_exists($this, "s_".$knode)) {
                    $results[]=$this->{"s_".$knode}($mpath, $vnode);
                } elseif (str_starts_with($knode, "fn ")){
                    $results[]=$this->s_fn($mpath, $vnode);
                }  else {
                    $results[]=$this->visit($mpath, $vnode);
                }

            }
            return implode(" ", $results);
        }

    }

    function validate_args($path, $node, $req, $opt){
        foreach($req as $r){
            if(!isset($node[$r])) throw new Exception("Missing requried argument ".$r." in ".implode(" ", $path));
        }

        foreach($node as $k => $v){
            if((!in_array($k, $req)) && (!in_array($k, $opt)))
            if(!isset($node[$r])) throw new Exception("Unknown argument ".$r." in ".implode(" ", $path));
        }
    }

    function s_select($path, $node){
        $this->validate_args($path, $node, ["columns", "from"], ["where","group_by","having","order_by","limit","offset"]);

        $r = "SELECT ".$this->visit(array_merge($path, ["columns"]), $node['columns'])." FROM ";

        $f = $this->visit(array_merge($path, ["from"]), $node['from'], $implode_list = false);
        $fstr = "";
        $fpref = [];

        if(!is_array($f)) throw new Exception("Select FROM is not array");

        for ($i = 0; $i < count($f); $i++) {
            if($i == 0) {
                $fpref[]=" ";
            } elseif(isset($node['from'][$i]['join'])) {
                $fpref[]=" ";
            } else {
                $fpref[]=", ";
            }
        }

        for ($i = 0; $i < count($f); $i++) {
            $fstr.=$fpref[$i].$f[$i];
        }

        $r.=$fstr;


        if (array_key_exists('where',$node) && $node['where'] !== "" && count($node['where']) > 0){
            $r.=" WHERE ".$this->s_and(array_merge($path, ["where"]), $node['where']);
        }

        if (array_key_exists('group_by',$node) && $node['group_by'] !== "" && count($node['group_by']) > 0){
            $r.=" GROUP BY ".$this->visit(array_merge($path, ["group_by"]), $node['group_by']);
        }

        if (array_key_exists('having',$node) && $node['having'] !== "" && count($node['having']) > 0){
            $r.=" HAVING ".$this->s_and(array_merge($path, ["having"]), $node['having']);
        }

        if (array_key_exists('order_by',$node) && $node['order_by'] !== "" && count($node['order_by']) > 0){
            $r.=" ORDER BY ".$this->s_order(array_merge($path, ["order_by"]), $node['order_by']);
        }

        if (array_key_exists('limit',$node)){
            $r.=" LIMIT ".$this->visit(array_merge($path, ["limit"]), $node['limit']);
        }

        if (array_key_exists('offset',$node)){
            $r.=" OFFSET ".$this->visit(array_merge($path, ["offset"]), $node['offset']);
        }

        return $r;
    }

    function s_insert($path, $node){
        $this->validate_args($path, $node, ["table", "columns"], ["values", "select"]);
        if (isset($node['values'])){
            return "INSERT INTO ".$this->visit($path, $node['table'])." (".$this->visit($path, $node['columns']).") VALUES (".$this->visit($path, $node['values']).")";
        } elseif (isset($node['select'])) {
            return "INSERT INTO ".$this->visit($path, $node['table'])." (".$this->visit($path, $node['columns']).") ".$this->s_select(array_merge($path, ["select"]), $node['select']);
        } else {
            throw new Exception("Unknown insert format: values of select should be set");
        }
    }

    function s_update($path, $node){
        $this->validate_args($path, $node, ["table","columns", "values", "where"], []);

        $set_ids = $this->visit($path, $node['columns'], $implode_list = false);
        $set_vals = $this->visit($path, $node['values'], $implode_list = false);

        $r = "";
        for($i = 0;$i< count($set_ids);$i++){
           if($i != 0) {
               $r.=", ";
           }
           $r.=$set_ids[$i]." = ".$set_vals[$i];
        }

        $r = "UPDATE ".$this->visit($path, $node['table'])." SET ".$r;

        if (array_key_exists('where',$node) && $node['where'][0] !== ""){
            $r.=" WHERE ".$this->s_and(array_merge($path, ["where"]), $node['where']);
        }

        if (array_key_exists('limit',$node)){
            $r.=" LIMIT ".$this->visit(array_merge($path, ["limit"]), $node['limit']);
        }

        return $r;
    }

    function s_delete($path, $node){
        $this->validate_args($path, $node, ["table", "where"], []);

        $r = "DELETE FROM ".$this->visit($path, $node['table']);

        if (array_key_exists('where',$node)){
            $r.=" WHERE ".$this->s_and(array_merge($path, ["where"]), $node['where']);
        }

        if (array_key_exists('limit',$node)){
            $r.=" LIMIT ".$this->visit(array_merge($path, ["limit"]), $node['limit']);
        }

        return $r;
    }

    function s_tuple($path, $node){
        return "(".$this->visit($path, $node).")";
    }

    function s_join($path, $node){
        $this->validate_args($path, $node, ["kind","to","on"], []);
        $kind = "JOIN";
        $kinds = ["inner" => "INNER JOIN", "left" => "LEFT JOIN", "right" => "RIGHT JOIN", "outer" => "OUTER JOIN"];

        if(!isset($kinds[$node['kind']])) {
            throw new Exception("Unknown join kind in ".implode(" ", $path));
        }

        if (isset($node['kind'])){
            $kind = $kinds[$node['kind']];
        }

        return $kind." ".$this->visit(array_merge($path, ["to"]), $node['to'])." ON ".$this->s_and(array_merge($path, ["on"]), $node['on']);
    }

    function s_order($path, $node){
        $r = "";
        for($i =0; $i<count($node);$i++){
            if($i > 0) {
                $r.=", ";
            }
            $r.=$this->visit(array_merge($path, ["order"]), array_keys($node[$i])[0]);
            if (array_values($node[$i])[0] == "asc") {
                $r.=" ASC";
            } elseif (array_values($node[$i])[0] == "desc") {
                $r.=" DESC";
            } else {
                throw new Exception("Unknown sort order in ".implode(" ", $path));
            }
        }
        return $r;
    }

    function s_and($path, $node){
        $cmps = $this->visit($path, $node, $implode_list = false);

        if (count($cmps) == 1){
            return $cmps[0];
        }

        $lpt = "";
        $rpt = "";

        if(end($path) == "and" || end($path) == "or"){
            $lpt = "(";
            $rpt = ")";
        }

        return $lpt.implode(" AND ", $cmps).$rpt;

    }

    function s_or($path, $node){
        $cmps = $this->visit($path, $node, $implode_list = false);

        if (count($cmps) == 1){
            return $cmps[0];
        }

        $lpt = "";
        $rpt = "";

        if(end($path) == "and" || end($path) == "or"){
            $lpt = "(";
            $rpt = ")";
        }

        return $lpt.implode(" OR ", $cmps).$rpt;
    }

    function s_eq($path, $node){
        return $this->visit(array_merge($path, ["eq"]), $node[0])." = ".$this->visit(array_merge($path, ["eq"]), $node[1]);
    }

    function s_neq($path, $node){
        return $this->visit(array_merge($path, ["neq"]), $node[0])." <> ".$this->visit(array_merge($path, ["neq"]), $node[1]);
    }

    function s_ge($path, $node){
        return $this->visit(array_merge($path, ["ge"]), $node[0])." >= ".$this->visit(array_merge($path, ["ge"]), $node[1]);
    }

    function s_gt($path, $node){
        return $this->visit(array_merge($path, ["gt"]), $node[0])." > ".$this->visit(array_merge($path, ["gt"]), $node[1]);
    }

    function s_le($path, $node){
        return $this->visit(array_merge($path, ["le"]), $node[0])." <= ".$this->visit(array_merge($path, ["le"]), $node[1]);
    }

    function s_lt($path, $node){
        return $this->visit(array_merge($path, ["lt"]), $node[0])." < ".$this->visit(array_merge($path, ["lt"]), $node[1]);
    }

    function s_in($path, $node){
        if(count($node[1]) == 0)
            return " FALSE ";
        return $this->visit(array_merge($path, ["in"]), $node[0])." IN (".$this->visit(array_merge($path, ["in"]), $node[1]).")";
    }

    function s_not_in($path, $node){
        return $this->visit(array_merge($path, ["not_in"]), $node[0])." NOT IN (".$this->visit(array_merge($path, ["not_in"]), $node[1]).")";
    }

    function s_is_null($path, $node){
        return $this->visit(array_merge($path, ["is_null"]), $node[0]." IS NULL ");
    }

    function s_is_not_null($path, $node){
        return $this->visit(array_merge($path, ["is_not_null"]), $node[0]." IS NOT NULL ");
    }

    function s_like($path, $node){
        return $this->visit(array_merge($path, ["like"]), $node[0])." LIKE ".$this->visit(array_merge($path, ["like"]), $node[1]);
    }

    function s_sql($path, $node){
        return $node;
    }

    function s_fn($path, $node){
        preg_match('/fn\s+(\w+)(\s+(as)\s+(\w+))?/', end($path), $matches);
        $fname = $matches[1];
        $alias = "";
        if(count($matches) == 5){
            $alias = " AS `".$matches[4]."`";
        }
        return $fname." (".$this->visit($path, $node).")".$alias;
    }


    function found_rows(){
        return $this->total_rows;
    }

    function top_level_query(){
        return array_keys($this->query)[0];
    }

    // ok, any, empty, not_empty, affected, affected_one, not_affected
    function execute($db, $vars = [], $accept = 'ok', $calc_rows = FALSE){

        $sql = $this->sql();
        $this->vars = array_merge($this->vars, $vars);

        //error_log($sql);

        $statment = $db->prepare($sql);

        if($statment === FALSE){
            throw new Exception('Error in prepare statment');
        }

        $result = $statment->execute($this->vars);

        if($result === FALSE){
            $this->error_text = implode(' ', $db->errorInfo());
            if($accept != 'any')
                throw new Exception('Query failed, but it is not allowed');
            return FALSE;
        }

        $rdata = [];

        if(str_starts_with($sql, "SELECT"))
            $rdata = $statment->fetchAll();

        if(str_starts_with($sql, "SELECT") && $calc_rows){
            $nr = clone $this;

            if(isset($nr->query['select']['limit'])){
                unset($nr->query['select']['limit']);
            }

            if(isset($nr->query['select']['offset'])){
                unset($nr->query['select']['offset']);
            }

            $nr->query['select']['columns'] = [["sql" => "COUNT(*) AS N"]];
            $st_count = $db->prepare($nr->sql());
            $st_count->execute($this->vars);
            $this->total_rows = $st_count->fetch()['N'];
        } else {
            $this->total_rows = 0;
        }

        if($statment->rowCount() > 0 && $accept == 'not_affected')
            throw new Exception('Query rowCount is not 0, but should be "not_affected"');

        if($statment->rowCount() == 0 && $accept == 'affected')
            throw new Exception('Query rowCount is 0, but should be "affected"');

        if($statment->rowCount() != 1 && $accept == 'affected_one')
            throw new Exception('Query rowCount != 1, but should be "affected_one"');


        if(count($rdata) > 0 && $accept == 'empty')
            throw new Exception('Query result is empty, but should be "not_empty"');

        if(count($rdata) == 0 && $accept == 'not_empty')
            throw new Exception('Query result is not empty, but should be "empty"');

        if(count($rdata) != 1 && $accept == 'one')
            throw new Exception('Query result is not one, but should be "one"');

        return $rdata;
    }


}





