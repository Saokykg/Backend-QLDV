const { execute } = require('./connection');
const db = require('./connection');
const share = require('../share')
const mysql = require('mysql');
const { insert } = require('./utilsKyLuat');
const utilsChiBo = require('./utilsChiBo');
// ROW_NUMBER() OVER (ORDER BY `Họ tên` DESC) AS `STT`
var sqlthongbao = "select id, DATE_FORMAT(`Ngày tạo`,'%d-%m-%Y') as `Ngày tạo`, `Nội dung`, " +
                " DATE_FORMAT(`Ngày diễn ra sự kiện`,'%d-%m-%Y') as `Ngày diễn ra sự kiện`,`Loại`, `idLoai`, `link`, `Đã xem`  from thongbao";

module.exports = class utilsthongbao{
    
    constructor(id, ngaytao, noidung, ngaysukien, loai, idloai, link){
        this.id = id;
        this.ngaytao = ngaytao;
        this.noidung = share.encode(noidung);
        this.ngaysukien = ngaysukien;
        this.loai = share.encode(loai);
        this.idloai = idloai;
        this.link = share.encode(link);
    }

    static getAll(){
        var sql = "select id, DATE_FORMAT(`Ngày tạo`,'%d-%m-%Y') as `Ngày tạo`, `Nội dung`, DATE_FORMAT(`Ngày diễn ra sự kiện`,'%d-%m-%Y') as `Ngày diễn ra sự kiện`,`Loại`, `idLoai`, `link` "+
            " from thongbao order by `Ngày tạo` ";
        return db.execute(sql);
    }

    static get3month(){
        var sql = "select id, DATE_FORMAT(`Ngày tạo`,'%d-%m-%Y') as `Ngày tạo`, `Nội dung`, DATE_FORMAT(`Ngày diễn ra sự kiện`,'%d-%m-%Y') as `Ngày diễn ra sự kiện`,`Loại`, `idLoai`, `link` "+
            " from thongbao "+
            " where (datediff(curdate(), `Ngày diễn ra sự kiện`) <= 90 and `Ngày diễn ra sự kiện` <= curdate()) or"+
            " (datediff(`Ngày diễn ra sự kiện`, curdate()) <= 30 and `Ngày diễn ra sự kiện` >= curdate()) order by `Ngày diễn ra sự kiện` ";
        // console.log(sql);
            return db.execute(sql);
    }

    static getNow(){
        var sql = sqlthongbao + " where datediff(`Ngày diễn ra sự kiện`,curdate())  IN (0,1,7,15,30) and `Ngày diễn ra sự kiện` >= curdate() order by `Ngày diễn ra sự kiện`";
        // console.log(sql);
        return db.execute(sql);
    }

    static getToday(){
        var sql = sqlthongbao + " where datediff(`Ngày diễn ra sự kiện`,curdate())  between 0 and 30 and `Ngày diễn ra sự kiện` >= curdate() and `Đã xem` = 0 order by `Ngày tạo`";
        // console.log(sql);
        return db.execute(sql);
    }

    static renew(){
        var sql = "update `thongbao` set `Đã xem` = 0 where `Ngày diễn ra sự kiện` >= curdate()";
        return db.execute(sql);
    }

    static getById(id){
        var sql = "select DATE_FORMAT(`Ngày tạo`,'%d-%m-%Y') as `Ngày tạo`, `Nội dung`, DATE_FORMAT(`Ngày diễn ra sự kiện`,'%d-%m-%Y') as `Ngày diễn ra sự kiện`,`Loại`, `idLoai` "+
            " from thongbao where id = ? ";
        return db.execute(sql,[id]);
    }

    static insert(info){
        var sql = "INSERT INTO `thongbao` ( `Ngày tạo`, `Nội dung`, `Ngày diễn ra sự kiện`,`Loại`,`idLoai`,`Link`) "+
            "VALUES (curdate(),?,?,?,?,?)";
        return db.execute(sql,[info.noidung, info.ngaysukien, info.loai, info.idloai, info.link]);
    }
    
    static getByIdLoai(id,loai){
        var sql = "select * from thongbao where `idLoai` = ? and `Loại` = ? ";
        return db.execute(sql,[id,loai]);
    }

    static readed(id){
        var sql = " update `thongbao` set `Đã xem` = 1 where id = ? ";
        return db.execute(sql,[id]);
    }

    static disable(id, da){
        var sql = "delete from `thongbao` where `idLoai` = ? and `Ngày diễn ra sự kiện` > STR_TO_DATE(?,'%d-%m-%Y') ";
        return db.execute(sql,[id, da])
    }

    static update(info){
        var sqltop = "update `thongbao` set ";

        var sqlmid ="";
        var inserts = [];

        sqlmid += "  `Ngày tạo` = ? ";inserts.push(info.ngaytao);
        sqlmid += ", `Nội dung` = ? ";inserts.push(info.noidung);
        sqlmid += ", `Ngày diễn ra sự kiện` = ? ";inserts.push(info.ngaysukien);
        sqlmid += ", `Loại` = ? ";inserts.push(info.loai);
        sqlmid += ", `idLoai` = ? ";inserts.push(info.idloai);
        sqlmid += ", `link` = ? ";inserts.push(info.link);
        
        var sqlbot = " where `id` = ? ";

        inserts.push(id);
        var sql = sqltop + sqlmid +sqlbot;

        return db.execute(sql, inserts);
    }
    static deleteById(id){
        var sql = "delete from thongbao where id = ? ";
        return db.execute(sql,[id]);
    }

    static deleteType(idhs, type){
        type = share.encode(type);
        var sql = "delete from thongbao where idloai = ? and `Loại` = ? ";
        return db.execute(sql,[idhs, type]);
    }

    static insertHuyhieu(info){
        var sql =" insert into `thongbao` (`Ngày tạo`, `Nội dung`, `Ngày diễn ra sự kiện`,`Loại`,`idLoai`,`link`)  VALUES ";
        var inserts = [];
        var tmpsql = " (?, ?, DATE_ADD(STR_TO_DATE(?, '%d-%m-%Y'), INTERVAL ? year), ?, ?, ?) ,";
        var tuoidangs = [30,40,50,55,60,65,70,75,80,85,90];
        for (const tuoi of tuoidangs){
            sql += tmpsql;
            inserts.push(info.ngaytao, info.noidung + tuoi + " Năm tuổi đảng ", info.ngaysukien, tuoi, info.loai, info.idloai, info.link);
        }
        sql = sql.substring(0, sql.length - 1);
        return db.execute(sql, inserts);
    }
    
    static insertGiaNhap(info){
        var sql = "insert into `thongbao` (`Ngày tạo`, `Nội dung`, `Ngày diễn ra sự kiện`,`Loại`,`idLoai`,`link`)  VALUES  "+
                " (?, ?, DATE_ADD(STR_TO_DATE(?, '%d-%m-%Y'), INTERVAL 1 year), ?, ?, ?)  ";
        var inserts = [info.ngaytao, info.noidung , info.ngaysukien, info.loai, info.idloai, info.link];
        return db.execute(sql, inserts);
    }
    
    static insertTotNghiep(){

    }
    
}