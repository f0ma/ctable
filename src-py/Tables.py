from CTable import CTable
import sqlite3

from pypika import Query, Table, Field, Order
from pypika import functions as fn


class Account(CTable):
    def __init__(self):
        self.con = sqlite3.connect('demo.db')
        self.con.row_factory = lambda C, R: { c[0]: R[i] for i, c in enumerate(C.description) }
        self.cur = self.con.cursor()
        super().__init__()
        self.table = Table('account')
        self.keys = ['id']

    def __del__(self):
        self.con.close()


class Bill(CTable):
    def __init__(self):
        self.con = sqlite3.connect('demo.db')
        self.con.row_factory = lambda C, R: { c[0]: R[i] for i, c in enumerate(C.description) }
        self.cur = self.con.cursor()
        super().__init__()
        self.table = Table('bill')
        self.keys = ['id']

    def __del__(self):
        self.con.close()


class Options(CTable):
    def options(self, args):
        self.result = {"Result" : "OK", "Options" : [[0,'Unknown'],[1,'OK'],[2,'Blocked']]}

proc_classes = {'/account':Account, '/opts':Options, '/bill':Bill}
