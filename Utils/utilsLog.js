const db = require('./connection');
const share = require('../share');
const e = require('express');
module.exports = class utilsNgoaiQuoc{
 
    constructor(id, action, table, column, row, data, user, date){
        this.id = id;
        this.action = action;
        this.table = table;
        this.column = column;
        this.row = row;
        this.data = data;
        this.user = user;
        this.date = date;
    }

    static getNone(){
        var sql = "select * from hoso where id = 999 ";
        return db.execute(sql);
    }

    static insert(info){
        var sql = "call lichsu('insert', ?, ?, ?, ?, ?, ?);";
        return db.execute(sql,[info.action, info.table, info.column, info.row, info.data, info.user]);
    }

    static getLog(table, column, id){
        if (column == 'Chi bộ'){
            var sql = "select `Tên chi bộ` as `value`, date_format(`date`, '%d-%m-%Y') as `start` "+
            " from lichsu_chungthuc ls, chibo cb"+ 
            " where cb.`id` = ls.`data` and `table` = ? and `column` = ? and `row` = ? ";
            return db.execute(sql,[table, column, id])
        }
        else{
            var sql = "select `data` as `value`, date_format(`date`, '%d-%m-%Y') as `start` "+
            " from lichsu_chungthuc "+ 
            " where `table` = ? and `column` = ? and `row` = ? ";
            return db.execute(sql,[table, column, id])
        }
    }

    static deleteAction(userid, table, key){
        return db.execute("call saveAction(?,?,'Xóa',?)",[userid, table, key])
    }

}