const db = require('./connection');

var sqlhuyhieu = "SELECT * from huyhieudang ";

module.exports = class utilsHuyHieu{
    
    constructor(id, ten){
        this.id = id;
        this.ten = ten;
    }

    static getAll(){
        var sql = sqlhuyhieu;
        return db.execute(sql);
    }

    static getById(id){
        var sql = sqlhuyhieu + " where `id` =  ?";
        return db.execute(sql,[id]);
    }

    static getByname(name){
        var sql = sqlhuyhieu + " where `Tên` like ?";
        return db.execute(sql,['%'+name+'%']);
    }

    static countHH(id){
        var sql = "select count(hs.`id`) as c from hoso_huyhieu hshh, hoso hs where hs.`id` = hshh.`idhs` and hs.`id` = ?  group by hs.`id`" ;
        return db.execute(sql,[id]);
    }

    static update(id , ten){
        var sqltop = "update `huyhieudang` set ";

        var sqlmid ="";
        var inserts = [];
        // if (info.loai   !=null ){ sqlmid += ", `Loại` = ? ";         inserts.push(info.loai);}
        sqlmid += " `Tên` = ? ";inserts.push(ten);

        var sqlbot = " where `id` = ? ";

        inserts.push(id);
        var sql = sqltop + sqlmid +sqlbot;

        return db.execute(sql, inserts);
    }
    static insert(ten){
        var sql = "INSERT INTO `huyhieudang` (`Tên`) VALUES (?)";
        var inserts = [ten];
        return db.execute(sql, inserts);
    }

    static delete(id){
        var sql = "DELETE FROM `huyhieudang` where `id` = ? ";
        return db.execute(sql,[id]);
    }

}