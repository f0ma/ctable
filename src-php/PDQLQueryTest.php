<?php
use PHPUnit\Framework\TestCase;

require "PDQLQuery.php";

class PDQLQueryTest extends TestCase
{
    public function testInsert() {
        $q = new PDQLQuery();
        $q->table('test')->insert(['id'=>3, 'code'=> "abc", 'a1'=>NULL, 'a2'=>FALSE, 'a3'=>TRUE, 'a4'=>'']);
        $this->assertEquals($q->sql(), 'INSERT INTO `test` (`id`, `code`, `a1`, `a2`, `a3`, `a4`) VALUES (:dml_auto_0, :dml_auto_1, NULL, FALSE, TRUE, :dml_auto_5);');
        $this->assertEquals($q->variables(), ['dml_auto_0' => 3, 'dml_auto_1' => 'abc', 'dml_auto_5' => '']);
    }

    public function testUpdate() {
        $q = new PDQLQuery();
        $q->table('test')->update(['id'=>3, 'code'=> "abc", 'a1'=>NULL, 'a2'=>FALSE, 'a3'=>TRUE, 'a4'=>''])->where('1 > 0');
        $this->assertEquals($q->sql(), 'UPDATE `test` SET `id`=:dml_auto_0, `code`=:dml_auto_1, `a1`= NULL, `a2`= FALSE, `a3`= TRUE, `a4`=:dml_auto_5 WHERE 1 > 0;');
        $this->assertEquals($q->variables(), ['dml_auto_0' => 3, 'dml_auto_1' => 'abc', 'dml_auto_5' => '']);
    }

    public function testDelete() {
        $q = new PDQLQuery();
        $q->table('test')->delete()->where('1 > 0');
        $this->assertEquals($q->sql(), 'DELETE FROM `test` WHERE 1 > 0;');
        $this->assertEquals($q->variables(), []);
    }

    public function testWhere() {
        $q = new PDQLQuery();
        $q->table('test')->delete()->where('1 > :a',['a'=>0])->where('1 < :b',['b'=>-1]);
        $this->assertEquals($q->sql(), 'DELETE FROM `test` WHERE 1 > :a AND 1 < :b;');
        $this->assertEquals($q->variables(), ['a' => 0, 'b'=> -1]);

        $q = new PDQLQuery();
        $q->table('test')->delete()->where('1 > :a')->where('1 < :b');
        $q->bind(['a' => 0, 'b'=> -1]);
        $this->assertEquals($q->sql(), 'DELETE FROM `test` WHERE 1 > :a AND 1 < :b;');
        $this->assertEquals($q->variables(), ['a' => 0, 'b'=> -1]);
    }

    public function testWhereGroup() {
        $q = new PDQLQuery();
        $q->table('test')->delete();
        $q->where('1 > :a',['a'=>0]);
        $q->where_begin();
        $q->where_begin();
        $q->where('1 < :b',['b'=>1]);
        $q->where('1 < :c',['c'=>2]);
        $q->where_end();
        $q->where_begin('OR');
        $q->where('1 < :b');
        $q->where('1 < :c');
        $q->where_end();
        $q->where('1 < :d',['d'=>3]);
        $q->where_end();

        $this->assertEquals($q->sql(), 'DELETE FROM `test` WHERE 1 > :a AND ((1 < :b AND 1 < :c) AND (1 < :b OR 1 < :c) AND 1 < :d);');
        $this->assertEquals($q->variables(), ['a' => 0, 'b'=> 1, 'c' => 2, 'd' => 3]);
    }

    public function testSelectGroup() {
        $q = new PDQLQuery();
        $q->select(['cnt'=>'count(*)', 'id_max' => 'max(id)'])->from('test')->group_by('id')->having('id_max > :x', ['x' => 3])->one();
        $this->assertEquals($q->sql(), 'SELECT count(*) AS `cnt`, max(id) AS `id_max` FROM `test` GROUP BY `id` HAVING id_max > :x LIMIT 1;');
        $this->assertEquals($q->variables(), ['x' => 3]);
    }

    public function testOffsetLimit() {
        $q = new PDQLQuery();
        $q->select()->from('test')->offset(10)->limit(100);
        $this->assertEquals($q->sql(), "SELECT * FROM `test` LIMIT 100 OFFSET 10;");
    }

    public function testAutoVars() {
        $q = new PDQLQuery();
        $q->query_uid = 'auto';
        $q->select()->from('test')->where_eq(['x'], 10)->where_gt('y', ['q'])->where_le(['a'], ['b'])->where_is_null(['s']);
        $this->assertEquals($q->sql(), "SELECT * FROM `test` WHERE `x` = :var_auto_0 AND :var_auto_1 > `q` AND `a` <= `b` AND `s` IS NULL;");
        $this->assertEquals($q->variables(), ['var_auto_0' => 10, 'var_auto_1' => 'y']);
    }

}
?>
