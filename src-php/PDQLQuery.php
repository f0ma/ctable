<?php

class PDQLQueryException extends Exception { }

class PDQLQuery {
    var $db;
    var $query_kind; // raw, select, update, delete, insert
    var $_table = NULL;
    var $select_columns = [];
    var $raw_sql = NULL;
    var $dml_columns = [];

    var $autovar_index = 0;

    var $joins = [];
    var $last_join_term = "JOIN";
    var $last_join_table = NULL;

    var $where_list = ['AND'=>["_INSERT_"]];
    var $where_balance = 0;

    var $var_list = [];

    var $order_by_list = [];

    var $_limit = NULL;
    var $_offset = NULL;

    var $_one = NULL;

    var $group_by_list = [];

    var $having_balance = 0;
    var $having_list = ['AND'=>["_INSERT_"]];

    var $error_text = '';

    var $exec_result = NULL;
    var $statment = NULL;

    function _is_assoc_array(array $array) {
        if(!is_array($array)) return FALSE;
        return count(array_filter(array_keys($array), 'is_string')) == count($array);
    }

    function _is_seq_array(array $array) {
        if(!is_array($array)) return FALSE;
        return count(array_filter(array_keys($array), 'is_integer')) == count($array);
    }

    function _next_autovar(){
        $avar = ":var_auto_{$this->autovar_index}";
        $this->autovar_index += 1;
        return $avar;
    }

    function _autoformat_id(string $id){
        if (preg_match('/^[a-zA-Z_][a-zA-Z0-9_.]*$/', $id)){
            $cmps = explode('.', $id);
            $qcmps = [];
            foreach($cmps as $c){
                $qcmps[]='`'.$c.'`';
            }
            return implode('.',$qcmps);
        }
        return $id;
    }

    function column(string $id){
        if (preg_match('/^[a-zA-Z_][a-zA-Z0-9_.]*$/', $id)){
            $cmps = explode('.', $id);
            $qcmps = [];
            foreach($cmps as $c){
                $qcmps[]='`'.$c.'`';
            }
            return implode('.',$qcmps);
        }
        throw new PDQLQueryException('Incorrect column identifier '.$this->$id);
    }

    function table($table){
        if(is_array($table))
            $this->_table = $this->_prepare_argument($table);
        else
            $this->_table = $this->_autoformat_id($table);
        return $this;
    }

    function from($table){
        return $this->table($table);
    }

    function one(){
        $this->_one = true;
        return $this;
    }

    function select(){
        if(!(($this->query_kind == NULL) || ($this->query_kind == 'select')))
            throw new PDQLQueryException('Query type already defined as '.$this->query_kind);
        $this->query_kind = 'select';
        foreach(func_get_args() as $col){
            if(is_array($col) && $this->_is_seq_array($col)){
                foreach($col as $kcol){
                    $this->select_columns[$this->_autoformat_id($kcol)] = NULL;
                }
                continue;
            }
            if(is_array($col) && $this->_is_assoc_array($col)){
                foreach($col as $kcol => $vcol){
                    if(is_array($vcol) && count($vcol) == 1)
                        $this->select_columns[$this->_autoformat_id($kcol)] = $this->_autoformat_id($vcol[0]);
                    else
                        $this->select_columns[$this->_autoformat_id($kcol)] = $vcol;
                }
                continue;
            }
            throw new PDQLQueryException('Arguments should be arrays or key-value arrays for alias');
        }
        return $this;
    }

    function where_base_operator($op){
        if(!in_array($op,  ['AND', 'OR']))
            throw new PDQLQueryException('Only "AND" and "OR" possible operators');
        $key = array_keys($this->where_list)[0];
        $terms = $this->where_list[$key];
        unset($this->where_list[$key]);
        $this->where_list[$op] = $terms;
        return $this;
    }

    function having_base_operator($op){
        if(!in_array($op,  ['AND', 'OR']))
            throw new PDQLQueryException('Only "AND" and "OR" possible operators');
        $key = array_keys($this->having_list)[0];
        $terms = $this->having_list[$key];
        unset($this->having_list[$key]);
        $this->having_list[$op] = $terms;
        return $this;
    }

    function where_begin($op = 'AND'){
        $this->where_balance += 1;
        $this->_begin_where_group($this->where_list, $op);
    }

    function where_end(){
        $this->where_balance -= 1;
        $this->_end_where_group($this->where_list);
    }

    function having_begin($op = 'AND'){
        $this->having_balance += 1;
        $this->_begin_where_group($this->having_list, $op);
    }

    function having_end(){
        $this->having_balance -= 1;
        $this->_end_where_group($this->having_list);
    }

    function _begin_where_group(&$list, $op){
        $terms = array_values($list)[0];
        $key = array_keys($list)[0];
        if(end($terms) == "_INSERT_"){
            $mark = array_pop($list[$key]);
            $list[$key][]=[$op => [$mark]];
            return true;
        } else {
            foreach($list[$key] as &$t){
                if (!is_array($t)) continue;
                if ($this->_begin_where_group($t, $op)) break;
            }
        }
    }

    function _end_where_group(&$list){
        $terms = array_values($list)[0];
        $key = array_keys($list)[0];
        if(end($terms) == "_INSERT_"){
            $mark = array_pop($list[$key]);
            return true;
        } else {
            foreach($list[$key] as &$t){
                if (!is_array($t)) continue;
                if ($this->_end_where_group($t)){
                    $list[$key][]="_INSERT_";
                    break;
                }
            }
        }
    }

    function _put_term_in_list(&$list, $term){
        $terms = array_values($list)[0];
        $key = array_keys($list)[0];
        if(end($terms) == "_INSERT_"){
            $mark = array_pop($list[$key]);
            $list[$key][]=$term;
            $list[$key][]=$mark;
            return true;
        } else {
            foreach($list[$key] as &$t){
                if (!is_array($t)) continue;
                if ($this->_put_term_in_list($t, $term)) break;
            }
        }
    }

    function where($term, $vars = []){
        if(!is_string($term))
            throw new PDQLQueryException('Where clause should be string');

        $this->_put_term_in_list($this->where_list, $term);
        $this->bind($vars);
        return $this;
    }

    function _prepare_argument($arg){
        $rarg = '';
        if(is_array($arg) && count($arg) == 1) {
            if($arg[0][0] == ':'){
                $rarg = $arg[0];
            } else {
                $rarg = $this->_autoformat_id($arg[0]);
            }
        } else {
            $rarg = $this->_next_autovar();
            $this->bind([substr($rarg, 1) => $arg]);
        }
        return $rarg;
    }

    function where_eq($column, $value){
        return $this->where($this->_prepare_argument($column).' = '.$this->_prepare_argument($value));
    }

    function where_ge($column, $value){
        return $this->where($this->_prepare_argument($column).' >= '.$this->_prepare_argument($value));
    }

    function where_le($column, $value){
        return $this->where($this->_prepare_argument($column).' <= '.$this->_prepare_argument($value));
    }

    function where_neq($column, $value){
        return $this->where($this->_prepare_argument($column).' <> '.$this->_prepare_argument($value));
    }

    function where_gt($column, $value){
        return $this->where($this->_prepare_argument($column).' > '.$this->_prepare_argument($value));
    }

    function where_lt($column, $value){
        return $this->where($this->_prepare_argument($column).' < '.$this->_prepare_argument($value));
    }

    function where_like($column, $value){
        return $this->where($this->_prepare_argument($column).' LIKE '.$this->_prepare_argument($value));
    }

    function where_is_null($column){
        return $this->where($this->_prepare_argument($column).' IS NULL');
    }

    function where_is_not_null($column){
        return $this->where($this->_prepare_argument($column).' IS NOT NULL');
    }

    function having($term, $vars = []){
        if(!is_string($term))
            throw new PDQLQueryException('Where clause should be string');

        $this->_put_term_in_list($this->having_list, $term);
        $this->bind($vars);
        return $this;
    }

    function group_by($term) {
        $this->group_by_list[]= $term;
        return $this;
    }

    function join($kind='', $table = NULL){
        if ($table === NULL ){
            $table = $kind;
            $kind = '';
        }

        if(!in_array($kind,['','INNER','LEFT','RIGHT','OUTER','FULL']))
            throw new PDQLQueryException('Only "INNER", "LEFT", "RIGHT", "FULL" and "OUTER" joins available');

        if($this->query_kind != 'select')
            throw new PDQLQueryException('Joins available only for select');

        if($kind == ''){
            $this->last_join_term = '';
        } else {
            $this->last_join_term = $kind." JOIN";
        }

        if(is_array($table))
            $this->last_join_table = $this->_prepare_argument($table);
        else
            $this->last_join_table = $this->_autoformat_id($table);

        return $this;
    }

    function on($term){
        if($this->query_kind != 'select')
            throw new PDQLQueryException('Joins available only for select');
        if(!($this->_table !== NULL && $this->last_join_table !== NULL))
            throw new PDQLQueryException('Use join() before on() call');
        if(count($this->joins) > 0 && end($this->joins)[0] == $this->last_join_term && end($this->joins)[1] == $this->last_join_table){
            $jle = array_pop($this->joins);
            $jle[] = [$term];
            $this->joins[]=$jle;
        } else {
            $this->joins[]=[$this->last_join_term, $this->last_join_table, [$term]];
        }
        return $this;
    }

    function on_eq($col1, $col2){
        return $this->on($this->_prepare_argument($col1).' = '.$this->_prepare_argument($col2));
    }

    function update($columns){
        if(!(($this->query_kind == NULL) || ($this->query_kind == 'update')))
            throw new PDQLQueryException('Query type already defined as '.$this->query_kind);
        $this->query_kind = 'update';
        foreach($columns as $k => $v){
            $this->dml_columns[$k] = $v;
        }
        return $this;
    }

    function insert($columns){
        if(!(($this->query_kind == NULL) || ($this->query_kind == 'insert')))
            throw new PDQLQueryException('Query type already defined as '.$this->query_kind);
        $this->query_kind = 'insert';
        foreach($columns as $k => $v){
            $this->dml_columns[$k] = $v;
        }
        return $this;
    }

    function delete(){
        if(!(($this->query_kind == NULL) || ($this->query_kind == 'delete')))
            throw new PDQLQueryException('Query type already defined as '.$this->query_kind);
        $this->query_kind = 'delete';
        return $this;
    }

    function order_by($column, $direction = 'ASC'){
        if($this->query_kind != 'select')
            throw new PDQLQueryException('Order available only for select');
        $this->order_by_list[$column] = $direction;
        return $this;
    }

    function offset($offset){
        $this->_offset = (int) $offset;
        return $this;
    }

    function limit($limit){
        $this->_limit = (int) $limit;
        return $this;
    }

    function unbind($var_name){
        if(!array_key_exists($var_name, $this->var_list)){
            throw new PDQLQueryException('Variable not defined: '.$k);
        }
        unset($this->var_list[$k]);
        return $this;
    }

    function bind($vars, $value = NULL){
        if (is_string($vars)){
            if(array_key_exists($vars, $this->var_list)){
                throw new PDQLQueryException('Silent variable overriding not allowed: '.$k);
            }
            $this->var_list[$vars] = $value;
            return $this;
        }
        if(!$this->_is_assoc_array($vars))
            throw new PDQLQueryException('Argument should be key-value array');
        foreach($vars as $k => $v){
            if(array_key_exists($k, $this->var_list)){
                throw new PDQLQueryException('Silent variable overriding not allowed: '.$k);
            }
            $this->var_list[$k] = $v;
        }
        return $this;
    }

    function raw($sql, $vars = []){
        if(!(($this->query_kind == NULL) || ($this->query_kind == 'raw')))
            throw new PDQLQueryException('Query type already defined as '.$this->query_kind);
        $this->query_kind = 'raw';
        $this->$raw_sql = $sql;
        $this->var_list = $vars;
        return $this;
    }


    function _where_restruct($list){
        $base_op = array_keys($list)[0];
        $cls = array_values($list[$base_op]);
        $aterms = [];
        foreach($cls as $c){
            if(is_array($c)){
                $csterm = $this->_where_restruct($c);
                if($csterm != '')
                    if(count($c[array_keys($c)[0]]) > 1)
                        $aterms[] = '('.$csterm.')';
                    else
                        $aterms[] = $csterm;
            } else if($c != "_INSERT_") {
                $aterms[] = $c;
            }
        }
        if (count($aterms) == 0)
            return '';
        else
            return implode(" ".$base_op." ",$aterms);
    }

    function sql_where(){
        if($this->where_balance != 0)
            throw new PDQLQueryException('WHERE groups unbalanced');

        $s = $this->_where_restruct($this->where_list);

        if($s != ''){
            $s = " WHERE ".$s;
        }
        return $s;
    }

    function sql_having(){
        if($this->where_balance != 0)
            throw new PDQLQueryException('HAVING groups unbalanced');

        $s = $this->_where_restruct($this->having_list);

        if($s != ''){
            $s = " HAVING ".$s;
        }
        return $s;
    }

    function sql_group_by(){
        $s = '';
        if(count($this->group_by_list) > 0){
            $terms = [];
            foreach($this->group_by_list as $g){
                $terms[]= $this->_autoformat_id($g);
            }
            $s = " GROUP BY ".implode(', ',$terms);
        }
        return $s;
    }

    function sql_order_by(){
        $s = '';
        if(count($this->order_by_list) > 0){
            $terms = [];
            foreach($this->order_by_list as $c => $ord){
                $terms[]= $this->_autoformat_id($c).' '.$ord;
            }
            $s = " ORDER BY ".implode(', ',$terms);
        }
        return $s;
    }

    function sql_limits(){
        $s = "";
        if($this->_one === true){
            $s.= " LIMIT 1";
        } else {
            if($this->_limit !== NULL){
                $s.= " LIMIT $this->_limit";
            }
            if($this->_offset !== NULL){
                $s.= " OFFSET $this->_offset";
            }
        }
        return $s;
    }

    function sql(){
        if ($this->query_kind == 'raw'){
            return $this->$raw_sql;
        }

        if ($this->query_kind == 'insert'){
            if ($this->_table == NULL)
                throw new PDQLQueryException('Main table is undefined');
            $cnames = [];
            $values = [];
            $vindex = 0;
            foreach($this->dml_columns as $k => $v){
                $cnames[] = "`$k`";
                if($v === NULL){
                    $values[] = "NULL";
                } else if($v === TRUE){
                    $values[] = "TRUE";
                } else if($v === FALSE){
                    $values[] = "FALSE";
                } else {
                    $values[] = ":dml_auto_$vindex";
                }
                $vindex += 1;
            }

            $im_cnames = implode(', ',$cnames);
            $im_values = implode(', ',$values);

            return "INSERT INTO $this->_table ($im_cnames) VALUES ($im_values);";
        }

        if ($this->query_kind == 'update'){
            if($this->_table == NULL)
                throw new PDQLQueryException('Main table is undefined');

            $cset = [];
            $vindex = 0;
            foreach($this->dml_columns as $k => $v){
                if($v === NULL){
                    $cset[] = "`$k`= NULL";
                } else if($v === TRUE){
                    $cset[] = "`$k`= TRUE";
                } else if($v === FALSE){
                    $cset[] = "`$k`= FALSE";
                } else {
                    $cset[] = "`$k`=:dml_auto_$vindex";
                }
                $vindex += 1;
            }

            $im_cset = implode(', ',$cset);

            $query = "UPDATE $this->_table SET $im_cset";

            $where_clause = $this->sql_where();
            $limits_clause = $this->sql_limits();

            if($where_clause == NULL)
                throw new PDQLQueryException('Unconstrained UPDATE not allowed');

            return $query.$where_clause.$limits_clause.";";
        }

        if ($this->query_kind == 'delete'){
            if($this->_table == NULL)
                throw new PDQLQueryException('Main table is undefined');

            $where_clause = $this->sql_where();
            $limits_clause = $this->sql_limits();

            if($where_clause == NULL)
                throw new PDQLQueryException('Unconstrained DELETE not allowed');

            return "DELETE FROM $this->_table".$where_clause.$limits_clause.";";
        }

        if ($this->query_kind == 'select'){
            if($this->_table == NULL)
                throw new PDQLQueryException('Main table is undefined');

            $columns_clause = "*";

            if((count($this->joins) > 0) && (count($this->select_columns) == 0))
                throw new PDQLQueryException('For query with JOINs columns should be defined explicitly');

            if (count($this->select_columns) > 0){
                $columns_clause = '';
                $columns = [];
                foreach($this->select_columns as $kcol => $vcol){
                    if($vcol != NULL){
                        $columns[]=$vcol.' AS '.$kcol;
                    } else {
                        $columns[]=$kcol;
                    }
                }
                $columns_clause = implode(', ', $columns);
            }
            $join_clause = "";
            if(count($this->joins) > 0){
                foreach($this->joins as $j){
                    $ons = array_slice($j, 2);
                    $oterms = [];
                    foreach($ons as $t){
                        if(count($t) == 2){
                            $oterms[]="$t[0] = $t[1]";
                        } else {
                            $oterms[]="$t[0]";
                        }
                    }

                    $join_clause.=" $j[0] $j[1] ON ".implode(' AND ', $oterms);
                }
            }
            $where_clause = $this->sql_where();
            $having_clause = $this->sql_having();
            $limits_clause = $this->sql_limits();
            $groupby_clause = $this->sql_group_by();
            $orderby_clause = $this->sql_order_by();

            return "SELECT ".$columns_clause." FROM {$this->_table}".$join_clause.$where_clause.$groupby_clause.$having_clause.$orderby_clause.$limits_clause.";";
        }
    }

    function sql_sub(){
        return '('.substr($this->sql(),0,-1).')';
    }

    function variables(){
        $dml_vars = [];
        $vindex = 0;
        foreach($this->dml_columns as $k => $v){
            if($v !== NULL AND $v !== FALSE AND $v !== TRUE){
                $dml_vars["dml_auto_$vindex"] = $v;
            }
            $vindex += 1;
        }
        return array_merge($dml_vars, $this->var_list);
    }

    function conditions(){
        return $this->where_list;
    }

    function row_count(){
         if($this->exec_result === FALSE)
             throw new PDQLQueryException('Trying to get row_count for failed request');
    }

    // ok, any, empty, not_empty, affected, not_affected
    function execute($db, $accept = 'ok'){
        $this->statment = $db->prepare($this->sql());

        if($this->statment === FALSE){
            throw new PDQLQueryException('Error in prepare statment');
        }

        $this->exec_result = $this->statment->execute($this->variables());

        if($this->exec_result === FALSE){
            $this->error_text = implode(' ', $db->errorInfo());
            if($accept != 'any')
                throw new PDQLQueryException('Query failed, but it is not allowed');
            return FALSE;
        }

        $rdata = [];

        $rdata = $this->statment->fetchAll();

        if($this->statment->rowCount() > 0 && $accept == 'not_affected')
            throw new PDQLQueryException('Query rowCount is not 0, but should be "not_affected"');

        if($this->statment->rowCount() == 0 && $accept == 'affected')
            throw new PDQLQueryException('Query rowCount is 0, but should be "affected"');

        if(count($rdata) > 0 && $accept == 'empty')
            throw new PDQLQueryException('Query result is empty, but should be "not_empty"');

        if(count($rdata) == 0 && $accept == 'not_empty')
            throw new PDQLQueryException('Query result is not empty, but should be "empty"');

        return $rdata;
    }

}

