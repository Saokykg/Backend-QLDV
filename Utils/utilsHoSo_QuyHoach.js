const db = require('./connection');
const share = require('../share')

module.exports = class utilsHoSo_QuyHoach{

    constructor(id, idhs, idqh, chucvu, donvi){
        this.id = id;
        this.idhs = idhs;
        this.idqh = idqh;
        this.chucvu = share.encode(chucvu);
        this.donvi = donvi;
    }

    static getAllpure(id){
        var sql = "select `id`, `idhs` as `id hồ sơ`, `idqh` as `id quy hoạch`, `Chức vụ`, `Đơn vị` from hoso_quyhoach where `idqh` = ? ";
        return db.execute(sql,[id]);
    }

    static getByidHS(id){
        var sql = "select qh.`Số quyết định` as `id` , qh.`Cấp quy hoạch`, `Chức vụ` , `Đơn vị`, `Nhiệm kỳ` "+
        " from hoso_quyhoach hsqh, quyhoach qh "+
        " where `idhs` = ? and qh.`Số quyết định` = hsqh.`idqh` ";
        return db.execute(sql,[id]);
    }

    static getById(id){
        var sql = "select `id`, `idhs` as `id hồ sơ`, `idqh` as `id quy hoạch`, `Chức vụ`, `Đơn vị` from hoso_quyhoach where `id` = ? ";
        return db.execute(sql, [id]);
    }

    static getAll(){
        var sql = " select `Số thẻ đảng`, `Số lý lịch`,`Họ và tên đệm`, `Tên`, `Ngày sinh`, `Ngày vào đảng` as `Ngày vào đảng`, `Chi bộ`, db, ct, DATE_FORMAT(`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`,sqd.`Số quyết định`,DATE_FORMAT(`Ngày`,'%d-%m-%Y') as `Ngày`, `Cấp quy hoạch`, hsqh.`Chức vụ`, `Nhiệm kỳ`, `Đơn vị` "+
                    " from hosopure hs, quyhoach qh, hoso_quyhoach hsqh, soquyetdinh sqd "+
                    " where hs.`id` = hsqh.`idhs` and qh.`Số quyết định` = hsqh.`idqh`and sqd.`id` = qh.`Số quyết định` "+
                    " order by `Cấp quy hoạch` DESC , `Đơn vị` ASC ";
        return db.execute(sql);
    }

    static getAllinOne(id){
        var sql = " select `Số thẻ đảng`, `Số lý lịch`,`Họ và tên đệm`, `Tên`, `Ngày sinh`, `Ngày vào đảng`, `Chi bộ`, db, ct, DATE_FORMAT(`Ngày ban hành`,'%d-%m-%Y') as `Ngày ban hành`,sqd.`Số quyết định`,DATE_FORMAT(`Ngày`,'%d-%m-%Y') as `Ngày`,  `Cấp quy hoạch`, hsqh.`Chức vụ`, `Nhiệm kỳ`, `Đơn vị` "+
                    " from hosopure hs, quyhoach qh, hoso_quyhoach hsqh, soquyetdinh sqd "+
                    " where hs.`id` = hsqh.`idhs` and qh.`Số quyết định` = hsqh.`idqh` and sqd.`id` = qh.`Số quyết định`  and qh.`Số quyết định` = ?  "+
                    " order by `Cấp quy hoạch` DESC , `Đơn vị` ASC ";
        return db.execute(sql,[id]);
    }

    static getFulllist(id){
        var sql = "select hs.`Số thẻ đảng`, `Họ và tên đệm`, `Tên`, DATE_FORMAT(`Ngày sinh`,'%d-%m-%Y') as `Ngày sinh`, DATE_FORMAT(gnd.`Thời gian gia nhập`,'%d-%m-%Y') as `Gia nhập`, `Cấp quy hoạch`, `Nhiệm kỳ`, `Chức vụ``,`Đơn vị` " +
        " from hoso hs, quyhoach qh, hoso_quyhoach hsqh, gianhapdang gnd "+
        " where hs.`id` = gnd.`id` and gnd.`Loại` = '" + share.encode('Chính thức') + "' and hs.`id` = hsqh.`idhs` and hsqh.`idqh`= qh.`Số quyết định` and qh.`Số quyết định` = ? order by `Cấp quy hoạch` DESC";
        return db.execute(sql,[id]);
    }

    static insert(userid, ngaybanhanh, info){ 
        var sql = "SELECT InsertHoSo_QuyHoach(?,?,?,?,?,?) as result;";
        var inserts = [userid, ngaybanhanh, info.idhs, info.idqh,  info.chucvu, info.donvi];
        return db.execute(sql, inserts);    
    }


    static async update(userid, hanhdong, oldinfo, info){
        var check = 0;
        check = await findDifferent(oldinfo, info);
        if (check == 4) return -1;
        // console.log(info);
        var sql = "Select updateHoSo_QuyHoach(?,?,?,?,?,?,?) as result; "
        var inserts = [userid, hanhdong, info.id, info.idhs, info.idqh, info.chucvu, info.donvi];
        return db.execute(sql, inserts);
    }

    static delete(id){
        var sql = "delete from `hoso_quyhoach` where `idqh` = ? ";
        return db.execute(sql,[id]);
    }

    static deletebyid(idqh){
        var sql = "delete from hoso_quyhoach where `idqh` = ?  ";
        return db.execute(sql,[idqh]);
    }

    static deleteOL(ids){
        var sql = "delete from `hoso_quyhoach` where `id` not in ( ";
        for (const id of ids){
            sql += " ? ,";
        }
        sql = sql.substring(0, sql.length -1) + ")";
        console.log(require('mysql').format(sql, ids));
        return db.execute(sql, ids);
    }

}

async function findDifferent(oldinfo, info){
    var check = 0;
    // console.log(oldinfo);
        if (oldinfo[`id hồ sơ`]    == info.idhs) {check++; info.idhs = null;}
        if (oldinfo[`id quy hoạch`]== info.idqh) {check++; info.idqh = null;}
        if (oldinfo[`Chức vụ`]     == info.chucvu){check++; info.chucvu = null;}
        if (oldinfo[`Đơn vị`]      == info.donvi) {check++; info.donvi = null;}
    return check;
}