const { execute } = require('./connection');
const db = require('./connection');
var mysql = require('mysql');
const share = require('../share');
module.exports = class utilsthongbao{
    
    //chibo
    //so luong chi bo
    static countChiBo(ngay){
        var sql = "select count(*) as `value` from lichsu_chibo "+
        " where (STR_TO_DATE(?, '%d-%m-%Y') between `start` and `end`) "+
        " or (STR_TO_DATE(?, '%d-%m-%Y') >= `start` and isnull(`end`)) ";
        return db.execute(sql,[ngay,ngay]);
    }

    static getChiBo(ngay){
        var sql =" select `Tên chi bộ` as `name`, coalesce(`value`, 0) as `value` "+ 
            " from "+ 
            " ( "+ 
            " select count(`idhs`) as `value`, `chibo` from "+ 
            " (select `row` as `idhs` from lichsu_active where `data` = 1 and (`row`, `date`) IN "+ 
            " (Select `row`, max(`date`) from lichsu_active where `date` <= str_to_date(?,'%d-%m-%Y')   "+ 
            " group by `row`) group by `row`) as tactive "+ 
            " LEFT JOIN "+ 
            " (select `row`,`data` as `chibo` from lichsu_chibo where (`row`, `date`) IN "+ 
            " (Select `row`, max(`date`) from lichsu_chibo where `date` <= str_to_date(?,'%d-%m-%Y')  "+  
            " group by `row`) group by `row`) AS tbchibo "+ 
            " ON tactive.`idhs` = tbchibo.`row` "+ 
            " group by `chibo`) as tvalue "+ 
            " RIGHT JOIN "+ 
            " (select * from chibo) as tbchibo  "+ 
            " ON tvalue.`chibo` = tbchibo.`id`";
       return db.execute(sql,[ngay, ngay])
   }

    static getChiBoKhoang(dau, cuoi){
         var sql =" select `Tên chi bộ` as `name`, coalesce(`value`, 0) as `value` "+
        "   from  "+
        "   ( "+
        "   select count(`idhs`) as `value`, `chibo` from "+
        "   (SELECT t1.`row` as `idhs` FROM lichsu_active t1  "+
        "   LEFT JOIN  "+
        "   (SELECT `row`, max(`date`) as `duoi` from lichsu_active where "+
        "   `date` <= str_to_date(?,'%d-%m-%Y')   "+
        "   group by `row`) t2 "+
        "   ON t1.`row` = t2.`row` "+
        "   WHERE `data` = '1' and (`date` <=  str_to_date(?,'%d-%m-%Y')) and (`date` >= `duoi` OR isnull(`duoi`)) "+
        "   group by t1.`row`) as tactive "+
        "   LEFT JOIN "+
        "   (select `row`,`data` as `chibo` from lichsu_chibo where (`row`, `date`) IN "+
        "   (Select `row`, max(`date`) from lichsu_chibo where `date` <= str_to_date(?,'%d-%m-%Y') "+
        "   group by `row`) group by `row`) AS tbchibo "+
        "   ON tactive.`idhs` = tbchibo.`row` "+
        "   group by `chibo`) as tvalue "+
        "   RIGHT JOIN "+
        "   (select * from chibo) as tbchibo  "+
        "   ON tvalue.`chibo` = tbchibo.`id`";
        // console.log(mysql.format(sql,[dau, cuoi, dau, cuoi]));
        return db.execute(sql,[dau, cuoi, cuoi]);
    }

    static getChiBo_DangVien(id, ngay){
        var sql = "select hs.`id`, hs.`Số thẻ đảng`, hs.`Họ và tên đệm`, hs.`Tên`, DATE_FORMAT(sh.`start`,'%d-%m-%Y') as `Ngày bắt đầu SH`, DATE_FORMAT(sh.`end`,'%d-%m-%Y')  as `Ngày kết thúc SH` " +
             " from hoso hs, lichsu_chibo ls, chibo cb, lichsu_sinhoat sh " +
             " where (cb.id = ls.`id`) and (sh.`idhs` = hs.`id`) and (sh.`chibo` = ls.`id`) and cb.id = ? "+
             " and ((STR_TO_DATE(?, '%d-%m-%Y') between ls.`start` and ls.`end`) or (STR_TO_DATE(?, '%d-%m-%Y') >= ls.`start` and isnull(ls.`end`))) " +
             " and ((STR_TO_DATE(?, '%d-%m-%Y') between sh.`start` and sh.`end`) or (STR_TO_DATE(?, '%d-%m-%Y') >= sh.`start` and isnull(sh.`end`))) ";
        return db.execute(sql,[id,ngay,ngay,ngay,ngay]);
    }

    static getDangVien(ngay, chibo){
        var sql = "select tbloai.`name` as `name`, coalesce(`value`, 0) as `value`  "+
        "  from   "+
        "  (   "+
        "  select count(tgianhap.`idhs`) as `value`, `Loại` as `name` from "+
        "  (select `row` as `idhs` from lichsu_active where `data` = 1 and (`row`, `date`) IN   "+
        "  (Select `row`, max(`date`) from lichsu_active where `date` <= str_to_date(?,'%d-%m-%Y')     "+
        "  group by `row`) group by `row`) as tactive   "+
        "  LEFT JOIN   "+
        "  (select `idhs`,`Loại` from gianhapdang where (`idhs`,`Thời gian gia nhập`) IN "+
        "  (select `idhs`, max(`Thời gian gia nhập`) from gianhapdang  "+
        "  where `Thời gian gia nhập` <= str_to_date(?,'%d-%m-%Y') group by `idhs`) "+
        "  ) as tgianhap "+
        "  ON tactive.`idhs` = tgianhap.`idhs` "+
        "  RIGHT JOIN "+
        "  (select `row`,`data` as `chibo` from lichsu_chibo where `data` = ? and (`row`, `date`) IN  "+
        "  (Select `row`, max(`date`) from lichsu_chibo where `date` <= str_to_date(?,'%d-%m-%Y')  "+
        "  group by `row`) group by `row`) AS tbchibo  "+
        "  on tbchibo.`row` = tactive.`idhs`  "+
        "  group by `chibo`) as tvalue   "+
        "  RIGHT JOIN   "+
        "  (select `data` as `name` from lichsu_chungthuc  "+
        "  where `table`= 'gianhapdang' and `column` = 'Loại' group by `data`) as tbloai  "+
        "  ON tvalue.`name` = tbloai.`name`";
        return db.execute(sql,[ngay, ngay, chibo, ngay]);
    }

    static getDangVienKhoang(dau, cuoi, chibo){
        var sql = "select tbloai.`name` as `name`, coalesce(`value`, 0) as `value`  "+
        "  from   "+
        "  (   "+
        "  select count(tgianhap.`idhs`) as `value`, `Loại` as `name` from "+
        "  (SELECT t1.`row` as `idhs` FROM lichsu_active t1  "+
        "  LEFT JOIN   "+
        "  (SELECT `row`, max(`date`) as `duoi` from lichsu_active where  "+
        "  `date` <= str_to_date(?,'%d-%m-%Y') "+
        "  group by `row`) t2  "+
        "  ON t1.`row` = t2.`row`  "+
        "  WHERE `data` = '1' and (`date` <=  str_to_date(?,'%d-%m-%Y')) and (`date` >= `duoi` OR isnull(`duoi`))  "+
        "  group by t1.`row`)  as tactive  "+
        "  LEFT JOIN   "+
        "  (select `idhs`,`Loại` from gianhapdang where (`idhs`,`Thời gian gia nhập`) IN "+
        "  (select `idhs`, max(`Thời gian gia nhập`) from gianhapdang  "+
        "  where `Thời gian gia nhập` <= str_to_date(?,'%d-%m-%Y') group by `idhs`) "+
        "  ) as tgianhap "+
        "  ON tactive.`idhs` = tgianhap.`idhs` "+
        "  RIGHT JOIN "+
        "  (select `row`,`data` as `chibo` from lichsu_chibo where `data` = ? and (`row`, `date`) IN  "+
        "  (Select `row`, max(`date`) from lichsu_chibo where `date` <= str_to_date(?,'%d-%m-%Y')  "+
        "  group by `row`) group by `row`) AS tbchibo  "+
        "  on tbchibo.`row` = tactive.`idhs`  "+
        "  group by `chibo`) as tvalue   "+
        "  RIGHT JOIN   "+
        "  (select `data` as `name` from lichsu_chungthuc  "+
        "  where `table`= 'gianhapdang' and `column` = 'Loại' group by `data`) as tbloai  "+
        "  ON tvalue.`name` = tbloai.`name`";
        // console.log(mysql.format(sql,[dau, cuoi, cuoi, chibo, cuoi]));
        return db.execute(sql,[dau, cuoi, cuoi, chibo, cuoi]);
    }

    static getDSchiBo(ngay){
        var sql = "Select `id`, `Tên chi bộ` as `t` from chibo where `active` = true";
        return db.execute(sql);
    }

    static getDSchiBoKhoang(dau, cuoi){
         var sql = "select cb.`id`, `Tên chi bộ` as t "+
        "  from  lichsu_chibo  ls , chibo cb  "+
        "  where ls.`id` = cb.`id` and   "+
        "  (ls.`id` , `start`) in   "+
        "  (select id , max(`start`)  "+
        "  from lichsu_chibo "+
        "   where  (id, `start`) not in "+
        "  (select id, `start` from  lichsu_chibo "+   
        "  where `end` < STR_TO_DATE(?,'%d-%m-%Y') or `start` > STR_TO_DATE(?,'%d-%m-%Y')) group by id) ";
        // console.log(mysql.format(sql,[dau, cuoi]));
        return db.execute(sql,[dau, cuoi]);
    }

    static getLoaiDangVien(ngay, type, chibo){
        var sql = "select `Họ và tên đệm`, `Tên`, DATE_FORMAT(`Thời gian gia nhập`,'%d-%m-%Y') as `Ngày gia nhập` " +
        " from gianhapdang gnd, hoso hs" +
        " where gnd.`id` = hs.`id` and `Loại` = ? " +
        " and (gnd.`id`, `Thời gian gia nhập`) IN  " +
        " (select id, max(`Thời gian gia nhập`) as `Thời gian gia nhập` " +
        " from gianhapdang " +
        " group by id " +
        " having (STR_TO_DATE(?, '%d-%m-%Y')  >  `Thời gian gia nhập`)) " ;
        // console.log(mysql.format(sql,[type, ngay]));
        return db.execute(sql,[type, ngay]);
    }
    

    static getDoiTuong(cuoi, chibo){
        var sql = "select tbloai.`name` as `name`, coalesce(`value`, 0) as `value`  "+
        "  from   "+
        "  (   "+
        "  select count(tgianhap.`idhs`) as `value`, `Loại` as `name` from "+
        "  (select `row` as `idhs` from lichsu_active where `data` = 1 and (`row`, `date`) IN   "+
        "  (Select `row`, max(`date`) from lichsu_active where `date` <= str_to_date(?,'%d-%m-%Y')     "+
        "  group by `row`) group by `row`) as tactive   "+
        "  LEFT JOIN   "+
        "  (select `row` as `idhs`,`data` as `Loại` from lichsu_doituong where (`row`,`date`) IN "+
        "  (select `row`, max(`date`) from lichsu_doituong  "+
        "  where `date` <= str_to_date(?,'%d-%m-%Y') group by `row`) "+
        "  ) as tgianhap "+
        "  ON tactive.`idhs` = tgianhap.`idhs` "+
        "  RIGHT JOIN "+
        "  (select `row`,`data` as `chibo` from lichsu_chibo where `data` = ? and (`row`, `date`) IN  "+
        "  (Select `row`, max(`date`) from lichsu_chibo where `date` <= str_to_date(?,'%d-%m-%Y')  "+
        "  group by `row`) group by `row`) AS tbchibo  "+
        "  on tbchibo.`row` = tactive.`idhs`  "+
        "  group by `Loại`) as tvalue   "+
        "  RIGHT JOIN   "+
        "  (select `data` as `name` from lichsu_chungthuc  "+
        "  where `table`= 'hoso' and `column` = 'Đối tượng' group by `data`) as tbloai  "+
        "  ON tvalue.`name` = tbloai.`name`";
        return db.execute(sql,[cuoi, cuoi, chibo, cuoi]);
    }

    static getDoiTuongKhoang(dau, cuoi, chibo){
        var sql = "select tbloai.`name` as `name`, coalesce(`value`, 0) as `value`  "+
        "  from   "+
        "  (   "+
        "  select count(tgianhap.`idhs`) as `value`, `Loại` as `name` from "+
        "  (SELECT t1.`row` as `idhs` FROM lichsu_active t1  "+
        "  LEFT JOIN   "+
        "  (SELECT `row`, max(`date`) as `duoi` from lichsu_active where  "+
        "  `date` <= str_to_date(?,'%d-%m-%Y') "+
        "  group by `row`) t2  "+
        "  ON t1.`row` = t2.`row`  "+
        "  WHERE `data` = '1' and (`date` <=  str_to_date(?,'%d-%m-%Y')) and (`date` >= `duoi` OR isnull(`duoi`))  "+
        "  group by t1.`row`)  as tactive  "+
        "  LEFT JOIN   "+
        "  (select `row` as `idhs`,`data` as `Loại` from lichsu_doituong where (`row`,`date`) IN "+
        "  (select `row`, max(`date`) from lichsu_doituong  "+
        "  where `date` <= str_to_date(?,'%d-%m-%Y') group by `row`) "+
        "  ) as tgianhap "+
        "  ON tactive.`idhs` = tgianhap.`idhs` "+
        "  RIGHT JOIN "+
        "  (select `row`,`data` as `chibo` from lichsu_chibo where `data` = ? and (`row`, `date`) IN  "+
        "  (Select `row`, max(`date`) from lichsu_chibo where `date` <= str_to_date(?,'%d-%m-%Y')  "+
        "  group by `row`) group by `row`) AS tbchibo  "+
        "  on tbchibo.`row` = tactive.`idhs`  "+
        "  group by `Loại`) as tvalue   "+
        "  RIGHT JOIN   "+
        "  (select `data` as `name` from lichsu_chungthuc  "+
        "  where `table`= 'hoso' and `column` = 'Đối tượng' group by `data`) as tbloai  "+
        "  ON tvalue.`name` = tbloai.`name`";
        return db.execute(sql,[dau, cuoi, cuoi, chibo, cuoi]);
    }

    static getLoaiDoiTuong(ngay, type){
        var sql = "select `Số thẻ đảng`, `Họ và tên đệm`, `Tên` " +
        " from " +
        " (select hs.`id`, `type` " +
        " from lichsu_doituong ls, hoso hs " +
        " where ls.`idhs` = hs.`id` and  " +
        " ((STR_TO_DATE(? , '%d-%m-%Y') between ls.`start` and ls.`end`) or " +
        "  (STR_TO_DATE(?, '%d-%m-%Y') >= ls.`start` and isnull(ls.`end`))) ) as t1 " +
        " left join " +
        " (select hs.`id`, `Họ và tên đệm`, `Tên`, `Số thẻ đảng` as `Số thẻ Đảng`" +
        " from hoso hs, lichsu_sinhoat sh " +
        " where hs.`id` = sh.`idhs` and  " +
        " ((STR_TO_DATE(? , '%d-%m-%Y') between sh.`start` and sh.`end`) or  " +
        " (STR_TO_DATE(? , '%d-%m-%Y') >= sh.`start` and isnull(sh.`end`))) ) as t2 " +
        " on t1.`id` = t2.`id` " +
        " Where `type` = ? "
        return db.execute(sql,[ngay,ngay,ngay,ngay,type])
    }

    static getLLCT(cuoi, chibo){
        var sql = "select tbloai.`name` as `name`, coalesce(`value`, 0) as `value`  "+
        "  from   "+
        "  (   "+
        "  select count(tgianhap.`idhs`) as `value`, `Loại` as `name` from "+
        "  (select `row` as `idhs` from lichsu_active where `data` = 1 and (`row`, `date`) IN   "+
        "  (Select `row`, max(`date`) from lichsu_active where `date` <= str_to_date(?,'%d-%m-%Y')     "+
        "  group by `row`) group by `row`) as tactive   "+
        "  LEFT JOIN   "+
        "  (select `row` as `idhs`,`data` as `Loại` from lichsu_llct where (`row`,`date`) IN "+
        "  (select `row`, max(`date`) from lichsu_llct  "+
        "  where `date` <= str_to_date(?,'%d-%m-%Y') group by `row`) "+
        "  ) as tgianhap "+
        "  ON tactive.`idhs` = tgianhap.`idhs` "+
        "  RIGHT JOIN "+
        "  (select `row`,`data` as `chibo` from lichsu_chibo where `data` = ? and (`row`, `date`) IN  "+
        "  (Select `row`, max(`date`) from lichsu_chibo where `date` <= str_to_date(?,'%d-%m-%Y')  "+
        "  group by `row`) group by `row`) AS tbchibo  "+
        "  on tbchibo.`row` = tactive.`idhs`  "+
        "  group by `Loại`) as tvalue   "+
        "  RIGHT JOIN   "+
        "  (select `data` as `name` from lichsu_chungthuc  "+
        "  where `table`= 'hoso' and `column` = 'Lý luận chính trị' group by `data`) as tbloai  "+
        "  ON tvalue.`name` = tbloai.`name`";
        return db.execute(sql,[cuoi, cuoi, chibo, cuoi]);
    }

    static getLLCTKhoang(dau, cuoi, chibo){
        var sql = "select tbloai.`name` as `name`, coalesce(`value`, 0) as `value`  "+
        "  from   "+
        "  (   "+
        "  select count(tgianhap.`idhs`) as `value`, `Loại` as `name` from "+
        "  (SELECT t1.`row` as `idhs` FROM lichsu_active t1  "+
        "  LEFT JOIN   "+
        "  (SELECT `row`, max(`date`) as `duoi` from lichsu_active where  "+
        "  `date` <= str_to_date(?,'%d-%m-%Y') "+
        "  group by `row`) t2  "+
        "  ON t1.`row` = t2.`row`  "+
        "  WHERE `data` = '1' and (`date` <=  str_to_date(?,'%d-%m-%Y')) and (`date` >= `duoi` OR isnull(`duoi`))  "+
        "  group by t1.`row`)  as tactive  "+
        "  LEFT JOIN   "+
        "  (select `row` as `idhs`,`data` as `Loại` from lichsu_llct where (`row`,`date`) IN "+
        "  (select `row`, max(`date`) from lichsu_llct  "+
        "  where `date` <= str_to_date(?,'%d-%m-%Y') group by `row`) "+
        "  ) as tgianhap "+
        "  ON tactive.`idhs` = tgianhap.`idhs` "+
        "  RIGHT JOIN "+
        "  (select `row`,`data` as `chibo` from lichsu_chibo where `data` = ? and (`row`, `date`) IN  "+
        "  (Select `row`, max(`date`) from lichsu_chibo where `date` <= str_to_date(?,'%d-%m-%Y')  "+
        "  group by `row`) group by `row`) AS tbchibo  "+
        "  on tbchibo.`row` = tactive.`idhs`  "+
        "  group by `Loại`) as tvalue   "+
        "  RIGHT JOIN   "+
        "  (select `data` as `name` from lichsu_chungthuc  "+
        "  where `table`= 'hoso' and `column` = 'Lý luận chính trị' group by `data`) as tbloai  "+
        "  ON tvalue.`name` = tbloai.`name`";
        return db.execute(sql,[dau, cuoi, cuoi, chibo, cuoi]);
    }

    static getLoaiLLCT(ngay, type){
        var sql = "select  `Số thẻ đảng`, `Họ và tên đệm`, `Tên`  " +  
        "  from lichsu_llct ls, hoso hs " +
        "  where `type` = ? and ls.`idhs` = hs.`id` and  (idhs, `start`) IN " +  
        "  (select idhs, max(`start`) as `start` from lichsu_llct   group by idhs having (STR_TO_DATE(?, '%d-%m-%Y')  >=  `start`)) " +
        "  and idhs IN" +
        "  (select hs.`id` " +
        "  from hoso hs, lichsu_sinhoat sh " +
        "  where hs.`id` = sh.`idhs` and  " +
        "  ((STR_TO_DATE(? , '%d-%m-%Y') between sh.`start` and sh.`end`) or  " +
        "  (STR_TO_DATE(? , '%d-%m-%Y') >= sh.`start` and isnull(sh.`end`)))) " ;
        return db.execute(sql,[type, ngay, ngay, ngay])
    }

    static getChucDanh(cuoi, chibo){
        var sql = "select tbloai.`name` as `name`, coalesce(`value`, 0) as `value`  "+
        "  from   "+
        "  (   "+
        "  select count(tgianhap.`idhs`) as `value`, `Loại` as `name` from "+
        "  (select `row` as `idhs` from lichsu_active where `data` = 1 and (`row`, `date`) IN   "+
        "  (Select `row`, max(`date`) from lichsu_active where `date` <= str_to_date(?,'%d-%m-%Y')     "+
        "  group by `row`) group by `row`) as tactive   "+
        "  RIGHT JOIN   "+
        "  (select `row` as `idhs`,`data` as `Loại` from lichsu_chucdanh where (`row`,`date`) IN "+
        "  (select `row`, max(`date`) from lichsu_chucdanh  "+
        "  where `date` <= str_to_date(?,'%d-%m-%Y') group by `row`) "+
        "  ) as tgianhap "+
        "  ON tactive.`idhs` = tgianhap.`idhs` "+
        "  RIGHT JOIN "+
        "  (select `row`,`data` as `chibo` from lichsu_chibo where `data` = ? and (`row`, `date`) IN  "+
        "  (Select `row`, max(`date`) from lichsu_chibo where `date` <= str_to_date(?,'%d-%m-%Y')  "+
        "  group by `row`) group by `row`) AS tbchibo  "+
        "  on tbchibo.`row` = tactive.`idhs`  "+
        "  group by `Loại`) as tvalue   "+
        "  RIGHT JOIN   "+
        "  (select `data` as `name` from lichsu_chungthuc  "+
        "  where `table`= 'hoso' and `column` = 'Chức danh' group by `data`) as tbloai  "+
        "  ON tvalue.`name` = tbloai.`name`";
        return db.execute(sql,[cuoi, cuoi, chibo, cuoi]);
    }

    static getChucDanhKhoang(dau, cuoi, chibo){
        var sql = "select tbloai.`name` as `name`, coalesce(`value`, 0) as `value`  "+
        "  from   "+
        "  (   "+
        "  select count(tgianhap.`idhs`) as `value`, `Loại` as `name` from "+
        "  (SELECT t1.`row` as `idhs` FROM lichsu_active t1  "+
        "  LEFT JOIN   "+
        "  (SELECT `row`, max(`date`) as `duoi` from lichsu_active where  "+
        "  `date` <= str_to_date(?,'%d-%m-%Y') "+
        "  group by `row`) t2  "+
        "  ON t1.`row` = t2.`row`  "+
        "  WHERE `data` = '1' and (`date` <=  str_to_date(?,'%d-%m-%Y')) and (`date` >= `duoi` OR isnull(`duoi`))  "+
        "  group by t1.`row`)  as tactive  "+
        "  LEFT JOIN   "+
        "  (select `row` as `idhs`,`data` as `Loại` from lichsu_chucdanh where (`row`,`date`) IN "+
        "  (select `row`, max(`date`) from lichsu_chucdanh  "+
        "  where `date` <= str_to_date(?,'%d-%m-%Y') group by `row`) "+
        "  ) as tgianhap "+
        "  ON tactive.`idhs` = tgianhap.`idhs` "+
        "  RIGHT JOIN "+
        "  (select `row`,`data` as `chibo` from lichsu_chibo where `data` = ? and (`row`, `date`) IN  "+
        "  (Select `row`, max(`date`) from lichsu_chibo where `date` <= str_to_date(?,'%d-%m-%Y')  "+
        "  group by `row`) group by `row`) AS tbchibo  "+
        "  on tbchibo.`row` = tactive.`idhs`  "+
        "  group by `Loại`) as tvalue   "+
        "  RIGHT JOIN   "+
        "  (select `data` as `name` from lichsu_chungthuc  "+
        "  where `table`= 'hoso' and `column` = 'Chức danh' group by `data`) as tbloai  "+
        "  ON tvalue.`name` = tbloai.`name`";
        return db.execute(sql,[dau, cuoi, cuoi, chibo, cuoi]);
    }

    static getLoaiChucDanh(ngay, type){
        var sql = "select `Số thẻ đảng`, `Họ và tên đệm`, `Tên` "+
        "  from lichsu_chucdanh ls, hoso hs  "+
        "  where ls.`idhs` = hs.`id` and `type` = ? and "+
        "  ((STR_TO_DATE(? , '%d-%m-%Y') between ls.`start` and ls.`end`) or "+
        "  (STR_TO_DATE(?, '%d-%m-%Y') >= ls.`start` and isnull(ls.`end`)))  "+
        "  and hs.`id` IN  "+
        "  (select hs.`id` "+
        "  from hoso hs, lichsu_sinhoat sh  "+
        "  where hs.`id` = sh.`idhs` and  "+
        "  ((STR_TO_DATE(? , '%d-%m-%Y') between sh.`start` and sh.`end`) or "+
        "  (STR_TO_DATE(? , '%d-%m-%Y') >= sh.`start` and isnull(sh.`end`))) ) ";
        return db.execute(sql,[type, ngay, ngay, ngay, ngay]) ;
    }
}

function sqlStartEnd(tablename){ //chibo, dau cuoi      
        var sql = "select t2.name, coalesce(t1.value, 0) as value from " +
            "( select `type` as name , count(idhs) as value "+
            " from " + tablename + " where (idhs,`start`) IN (select idhs, max(`start`) "+
            " from  " + tablename + "  "+
            " where id not in( "+
            " select id from  " + tablename + "  "+
            " where `end` < STR_TO_DATE(?,'%d-%m-%Y') or `start` > STR_TO_DATE(?,'%d-%m-%Y')) "+
            " group by idhs) and idhs IN (select idhs  "+
            " from lichsu_sinhoat "+
            " where chibo = ? and (idhs, start) IN "+
            " (select idhs, max(`start`) from  lichsu_sinhoat   "+
            " where id not in   "+
            " (select id from  lichsu_sinhoat  "+
            " where `end` < STR_TO_DATE(?,'%d-%m-%Y') or `start` > STR_TO_DATE(?,'%d-%m-%Y') ) "+
            " group by idhs )) "+
            " group by `type` ) as t1" +
            " right join " +
            " (select `type` as name from "+ tablename +" group by `type`) as t2 "+
            " ON t1.name = t2.name";
        return sql; 
}
function sqlStart(tablename){
        var sql = "select t2.name, coalesce(t1.value, 0) as value from " +
            "( select `type` as `name`, count(idhs) as `value` "+
            " from lichsu_llct "+
            " where (idhs,`start`) IN "+
            " (select idhs, max(`start`) from lichsu_llct "+
            " where `start` <= STR_TO_DATE(?,'%d-%m-%Y') group by idhs) "+
            " and idhs IN (select idhs  "+
            " from lichsu_sinhoat "+
            " where chibo = ? and (idhs, start) IN "+
            " (select idhs, max(`start`) from  lichsu_sinhoat   "+
            " where id not in   "+
            " (select id from  lichsu_sinhoat  "+
            " where `end` < STR_TO_DATE(?,'%d-%m-%Y') or `start` > STR_TO_DATE(?,'%d-%m-%Y') ) "+
            " group by idhs )) "+
            " group by `type` ) as t1" +
            " right join " +
            " (select `type` as name from "+ tablename +" group by `type`) as t2 "+
            " ON t1.name = t2.name";
        return sql; 
}