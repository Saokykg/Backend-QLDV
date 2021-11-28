const db = require('./connection');
const share = require('../share');
var sqlsqd = "Select id, `Số quyết định`, DATE_FORMAT(`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`, `Nội dung` " +
                        "from soquyetdinh ";

module.exports = class utilsSoQuyetDinh{
    
    constructor(id, sqd, ngay, noidung){
        this.id = id;
        this.sqd = sqd;
        this.ngay = ngay;
        this.noidung = share.encode(noidung);
    }

    static getAll(){
        var sql = sqlsqd;
        return db.execute(sql);
    }

    static getById(id){
        var sql = sqlsqd + " where id = ? ";
        return db.execute(sql,[id]);
    }

    static async update(userid, hanhdong, oldinfo, info){
        var check = 0;
        check = await findDifferent(oldinfo, info);
        if (check == 2) return -1;
        var sql = "select updateSoQuyetDinh(?,?,?,?,?) as result;"
        var inserts = [userid, hanhdong, info.id, info.sqd, info.ngay];
        return db.execute(sql, inserts);
    }

    static insert(userid, info){
        var sql = "select InsertSoQuyetDinh(?,?,?,?) as result;";
        var inserts = [userid, info.sqd, info.ngay, info.noidung];
        return db.execute(sql, inserts);
    }

    static deleteByid(id){
        var sql = "delete from soquyetdinh where id = ? ";
        return db.execute(sql,[id]);
    }
    
    static lastinsertid(){
        var sql = "select  LAST_INSERT_ID() as id";
        return db.execute(sql);
    }
}


async function findDifferent(oldinfo, info){
    var check = 0;
    // console.log(oldinfo, info);
    if (oldinfo[`Số quyết định`]    == info.sqd) {check++; info.sqd = null;}
    if (oldinfo[`Ngày ban hành`]    == info.ngay) {check++; info.ngay = null;}
    return check;
}