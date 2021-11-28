const db = require('./connection');
require('dotenv').config();
var mysql = require('mysql')

module.exports = class utilsHistory{

    static getAll(){
        var sql = "select ac.`id`, `action`, hs.`Số thẻ đảng`, hs.`Họ và tên đệm`, hs.`Tên`, `table`, `username`, `time`,ac.`key` " +
        " from `action` ac left join `account` acc on ac.`user` = acc.`id` left join `hoso` hs  " +
        " on hs.`id` = acc.`hoso_id` order by id DESC";
        return db.execute(sql);
    }
    
    static get(act){
        var sql = "select ac.`id`,  hs.`Số thẻ đảng`, hs.`Họ và tên đệm`, hs.`Tên`, `table`, `username`, `time`,ac.`key` " +
        " from `action` ac, `account` acc, `hoso` hs  " +
        " where ac.`user` = acc.`id` and `action` = ? and hs.`id` = acc.`hoso_id` order by id DESC";
        sql = (mysql.format(sql,[act]));
        return db.execute(sql);
    }
    
    static getDetails(id){
        var sql = "select * from lichsu where `action` = ? ";
        return db.execute(sql,[id]);
    }

    static getDetailsThem(id){
        var sql = "select `column`, `data` "+
        " from `lichsu` ls, `action` ac "+
        " where ls.`action` = ac.`id` and ac.`id` = ? ";
        return db.execute(sql,[id]);
    }

    static getDetailsCapNhat(id){
         var sql = " SELECT    "+
    "    `thistory`.`column` AS `Thông tin`,`thistory`.`old data` AS `Cũ`, coalesce(`tcheck`.`data`,`thistory`.`old data` )  AS `Mới`   "+
    "  FROM   "+
    "    (select `ls`.`column` AS `column`, `ls`.`data` AS `old data` from `lichsu_chungthuc` ls where  "+
    "    (`column`, `date`) IN "+
    "    ( "+
    "    SELECT  `ls`.`column` AS `column`,  max(`date`) "+
    "    FROM   (`lichsu_chungthuc` `ls`)   "+
    "            WHERE  ((`date` <  "+
    "                    (SELECT `action`.`time`   "+
    "                    FROM `action`   "+
    "                    WHERE (`action`.`id` = ?)) "+
    "                    ) AND  "+
    "                    (`row`, `table`) IN   "+
    "                    (SELECT  `action`.`key`,`action`.`table`   "+
    "                    FROM `action`   "+
    "                    WHERE (`action`.`id` = ?)) "+
    "                    ) "+
    "   Group by `column`)) `thistory`  "+
    "    LEFT JOIN (SELECT `ls`.`column` AS `column`, `ls`.`data` AS `data`   "+
    "    FROM `lichsu` `ls`  "+
    "    WHERE (`ls`.`action` = ?)) `tcheck` ON (`thistory`.`column` = `tcheck`.`column`)";
        return db.execute(sql,[id,id,id]);
    }

    static getDetailsXoa(id){
        var sql = " SELECT `ls`.`column` AS `Thông tin`, `ls`.`data` AS `dữ liệu` "+
        " FROM (`lichsu` `ls`  JOIN `action` `ac`) "+
        " WHERE ((`ls`.`action` = `ac`.`id`) "+
        "         AND (`ls`.`column` , `ac`.`time`) IN (SELECT `ls`.`column`, MAX(`ac`.`time`) "+
        "         FROM  (`lichsu` `ls` JOIN `action` `ac`) "+
        "         WHERE ((`ac`.`id` = `ls`.`action`)   AND (`ac`.`time` <= (SELECT `action`.`time` "+
        "                 FROM  `action` "+
        "                 WHERE   (`action`.`id` = ?))) AND ((`ac`.`key` , `ac`.`table`) =  "+
        "                 (SELECT   `action`.`key`, `action`.`table` "+
        "                 FROM `action` "+
        "                 WHERE (`action`.`id` = ?)))) "+
        "         GROUP BY `ls`.`column`))" ;
        return db.execute(sql,[id,id])
    }
    static getDetailsHeThong(id){
        var sql = " SELECT  "+ 
        "     `thistory`.`column` AS `Thông tin`,`thistory`.`old data` AS `Cũ`, coalesce(`tcheck`.`data`,`thistory`.`old data` )  AS `Mới` "+ 
        " FROM "+ 
        "     ((SELECT  `ls`.`column` AS `column`, `ls`.`data` AS `old data` "+ 
        "     FROM   (`action` `ac` JOIN `lichsu` `ls`) "+ 
        "     WHERE "+ 
        "         ((`ls`.`action` = `ac`.`id`) "+ 
        "             AND (`ac`.`table` , `ls`.`column`, `ac`.`time`) IN (SELECT  "+ 
        "                 `ac`.`table`, `ls`.`column`, MAX(`ac`.`time`) "+ 
        "             FROM    (`action` `ac` "+ 
        "             JOIN `lichsu` `ls`) "+ 
        "             WHERE  ((`ls`.`action` = `ac`.`id`) "+ 
        "                     AND (`ac`.`time` < (SELECT `action`.`time` "+ 
        "                     FROM `action` "+ 
        "                     WHERE (`action`.`id` = ?))) AND (`ac`.`table` = (SELECT  `action`.`table` "+ 
        "                     FROM `action` "+ 
        "                     WHERE (`action`.`id` = ?)))) "+ 
        "             GROUP BY `ac`.`table` , `ls`.`column`))) `thistory` "+
        "     LEFT JOIN (SELECT `ls`.`column` AS `column`, `ls`.`data` AS `data` "+ 
        "     FROM `lichsu` `ls` "+ 
        "     WHERE (`ls`.`action` = ?)) `tcheck` ON ((`thistory`.`column` = `tcheck`.`column`))) ";
        return db.execute(sql,[id,id,id]);
    }
}