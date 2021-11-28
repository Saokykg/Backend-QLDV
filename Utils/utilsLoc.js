const db = require('./connection');
const mysql = require('mysql2');
module.exports = class utilsLoc{
    
    constructor(){
    }

    

    static getAll(list){
        var sql = "?";
        
        var sqlselect =" select ";
        var sqlfrom =" from hoso hs, chibo cb";
        var sqlwhere =" where ";
        
        for (const info of list) {
            switch(info[table]) {
                case "hoso":
                  if (info[filter] !== null){
                      for (const tmp of info[filter]){
                            
                      }
                  }
                  break;
                case "chibo":
                  // code block
                  break;
                default:
                  // code block
              }
        }

        sql = sqlselect + "   " + sqlfrom + "  " + sqlwhere ;
        
        return sql;
    }

    static selecthoso(){
        var sql = "hs.`id`, hs`Số thẻ đảng`,`Họ tên`,`Loại DV`,`Tốt nghiệp`, hs`Chi bộ`, null as `Chức vụ`, hs`Quê quán`,  " +
        "hs.`Giới tính`, hs`Tôn giáo`, hs`Dân tộc`, hs`Học hàm`, hs`Học vấn`, hs`Học vị`, DATE_FORMAT(`Ngày sinh`,'%Y-%m-%d') as `Ngày sinh`, " + 
        "hs.`Nghề nghiệp`, hs`Nơi ở hiện tại`, hs`Đơn vị công tác`, hs`Số lý lịch`, hs`Lý luận chính trị`, hs`Bị kỷ luật`, h.`Active`, hs`Ghi chú` ";
        return sql;
    }

}