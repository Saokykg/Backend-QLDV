const db = require('./connection');
const mysql = require('mysql2');
const share = require('../share');

var sqllienlac = "select * from `thongtinlienlac` ";
var sqlorder = " order by `Loại`";

module.exports = class utilsLienLac{
    
    constructor(id, idhs, loai, diachi, level){
        this.id = id;
        this.idhs = idhs;
        this.loai = share.encode(loai);
        this.diachi = share.encode(diachi);
        this.level = share.encode(level);
    }

    static getAll(){
        var sql = sqllienlac + sqlorder;
        return db.execute(sql);
    }

    static getById(id){
        var sql = sqllienlac + " where id = ?";
        return db.execute(sql,[id]);
    }

    static getByIdHS(idhs){
        var sql = sqllienlac + " where `idhs` = ?" + sqlorder;
        return db.execute(sql,[idhs]);
    }

    static getLienLacchinh(idhs){
        var chinh = share.encode('Chính');
        var sql = sqllienlac + " where `idhs` = ? and `Level` = ? " + sqlorder;
        return db.execute(sql,[idhs, chinh]);
    }

    static async update(userid, hanhdong, oldinfo, info){
        var check = 0;

        check = await findDifferent(oldinfo, info);
        if (check == 1) return -1;
        var sql = "SELECT updateContact(?,?,?,?) as result";

        var inserts = [userid, hanhdong, info.id, info.diachi]; 
        console.log(mysql.format(sql,inserts));

        return db.execute(sql, inserts);
    }
    static insert(userid, ngay, info){
        var inserts = [];
        var sql = "SELECT InsertContact(?,?,?,?,?,?) as result;";
            inserts.push(userid, ngay, info.idhs, info.loai, info.diachi, info.level);
        // console.log(mysql.format(sql,inserts));
        return db.execute(sql, inserts);
    }

    static delete(id){
        var sql = "DELETE FROM `thongtinlienlac` where `id` = ? ";
        return db.execute(sql,[id]);
    }

    static deleteNotIn(list){
        var sql = "delete from `thongtinlienlac` where `idhs` = ? and `id` NOT IN (";
        var sqlmid ="";
        for (const i of list){
            sqlmid += ", ?";
        }
        sql+=sqlmid.substring(4)+ ")";
        return db.execute(sql,list)
    }
    
    static deleteByIdHS(idhs){
        var sql = "DELETE FROM `thongtinlienlac` where `idhs` = ? ";
        return db.execute(sql,[idhs]);
    }

}


async function findDifferent(oldinfo, info){
    var check = 0;
    if (oldinfo[`Địa chỉ`]    == info.diachi) {check++; info.diachi = null;}
    return check;
}