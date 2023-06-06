import json
import traceback

import multipart
from pypika import Query, Table, Field, Order
from pypika import functions as fn


class CTable:
    def __init__(self):
        self.result = None
        self.ncount = None
        self.table = None
        self.keys = ['id']

    def process(self, args):

        try:
            if 'download' in args:
                self.download(args)
            if 'select' in args:
                self.select(args)
            if 'options' in args:
                self.options(args)
            if 'insert' in args:
                self.insert(args)
            if 'update' in args:
                self.update(args)
            if 'delete' in args:
                self.delete(args)
            if 'custom_read' in args:
                self.custom_read(args)
            if 'custom_write' in args:
                self.custom_write(args)
        except Exception as e:
            traceback.print_exc()
            self.result = {"Result": "Error", "Message": str(e)}

        return self

    def download(self, args):
        pass

    def select(self, args):
        count_query = Query.from_(self.table).select(fn.Count('*'))
        select_query = Query.from_(self.table).select('*')

        params = json.loads(args['select'][0])

        if params['page'] != 0:
            select_query.offset(params['start']).limit(params['page'])

        for k,v in params['column_filters'].items():
            select_query = select_query.where(self.table[k] == v)
            count_query = count_query.where(self.table[k] == v)

        for k,v in params['column_searches'].items():
            select_query = select_query.where(self.table[k].like('%%%s%%' % v))
            count_query = count_query.where(self.table[k].like('%%%s%%' % v))

        for k,v in params['column_orders'].items():
            if v == 'ASC':
                select_query = select_query.orderby(k, order= Order.asc)
                count_query = count_query.orderby(k, order=Order.asc)
            if v == 'DESC':
                select_query = select_query.orderby(k, order= Order.desc)
                count_query = count_query.orderby(k, order=Order.desc)

        self.cur.execute(str(count_query))
        self.ncount = list(self.cur.fetchone().values())[0]
        self.cur.execute(str(select_query))
        self.result = {"Result" : "OK", "Records" : self.cur.fetchall(), "TotalRecordCount" : self.ncount}

    def options(self, args):
        pass

    def insert(self, args):
        params = json.loads(args['insert'][0])
        print(list(params.keys()), list(params.values()))
        insert_query = Query.into(self.table).columns(list(params.keys())).insert(list(params.values()))
        self.cur.execute(str(insert_query))
        print(str(insert_query))
        self.con.commit()
        self.result = {"Result" : "OK"}

    def update(self, args):
        params = json.loads(args['update'][0])
        update_query = Query.update(self.table)
        for k,v in params.items():
            if k in self.keys:
                update_query = update_query.where(self.table[k] == v)
            else:
                update_query = update_query.set(k,v)
        self.cur.execute(str(update_query))
        print(str(update_query))
        self.con.commit()
        self.result = {"Result" : "OK"}

    def delete(self, args):
        params = json.loads(args['delete'][0])
        delete_query = Query.from_(self.table).delete()
        for k,v in params.items():
            if k in self.keys:
                delete_query = delete_query.where(self.table[k] == v)
        self.cur.execute(str(delete_query))
        print(str(delete_query))
        self.con.commit()
        self.result = {"Result" : "OK"}

    def custom_read(self, args):
        pass

    def custom_write(self, args):
        pass

    def get_result(self):
        return self.result
