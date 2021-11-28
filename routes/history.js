var express = require('express');
const permission = require('../middleware/permission');
var router = express.Router();
const share = require('../share');
const utilsHistory = require('../Utils/utilsHistory');

// router.use(permission.admin);

router.get('/listFull' , async function(req, res, next) {
    var rs = await filter(req.query, res, 'all');
});


router.get('/listThem' , async function(req, res, next) {
    var rs = await filter(req.query, res, 'Thêm mới');
});

router.get('/listHeThong' , async function(req, res, next) {
    var rs = await filter(req.query, res, 'Hệ thống thực thi');
});

router.get('/listCapNhat' , async function(req, res, next) {
    var rs = await filter(req.query, res, 'Cập nhật');
});

router.get('/listChinhSua' , async function(req, res, next) {
    var rs = await filter(req.query, res, 'Chỉnh sửa');
});

router.get('/listXoa' , async function(req, res, next) {
    var rs = await filter(req.query, res, 'Xóa');
});

router.get('/listThem/:id' , async function(req, res, next) {
    var rs = await utilsHistory.getDetailsThem(req.params.id);
    rs = await share.decodeArray(rs[0]);
    res.json(rs);
});

router.get('/listHeThong/:id' , async function(req, res, next) {
    var rs = await utilsHistory.getDetailsCapNhat(req.params.id);
    rs = await share.decodeArray(rs[0]);
    res.json(rs);
});

router.get('/listCapNhat/:id' , async function(req, res, next) {
    var rs = await utilsHistory.getDetailsCapNhat(req.params.id);
    rs = await share.decodeArray(rs[0]);
    res.json(rs);
});

router.get('/listChinhSua/:id' , async function(req, res, next) {
    var rs = await utilsHistory.getDetailsCapNhat(req.params.id);
    rs = await share.decodeArray(rs[0]);
    res.json(rs);
});

router.get('/listXoa/:id' , async function(req, res, next) {
    var rs = await utilsHistory.getDetailsXoa(req.params.id);
    rs = await share.decodeArray(rs[0]);
    res.json(rs);
});

async function filter(qr, res, key) {
    var page;
    if (key == 'all')
        var rs = await utilsHistory.getAll();
    else    
        var rs = await utilsHistory.get(key);
    rs = await share.decodeArray(rs[0]);
    console.log(rs);

    var start, end;
    if (qr.user)
        rs = rs.filter( r => r['username'].includes(qr.user));
        
    if (qr.ten)
        rs = rs.filter( r => (r['Họ và tên đệm'] +" "+ r['Tên']).toString().includes(qr.ten));
    
    if (qr.std)
       rs = rs.filter( r => (r['Số thẻ đảng'].includes(qr.std)))

    if (qr.start)
        start = new Date(qr.start) //Y-m-d
    else
        start = new Date('1900-01-01');
    
    if (qr.table)
        rs = rs.filter( r => (r['table'].includes(qr.table)))

    if (qr.end)
        end = new Date(qr.end) //Y-m-d
    else
        end = new Date();

    if (qr.start || qr.end)
        rs = rs.filter( r => (r['time'] > start && r['time'] < end ));

    if (qr.page)
        page = parseInt(qr.page);
    else
        page = 0;

    if (isNaN(page)){
        res.sendStatus(400);
        return;
    }
    var count = rs.length;
    if (page != 0){
        page = page - 1;
        var respages = Math.ceil(rs.length / 50);
        rs = rs.filter((r, i)=>{
            return i >= 50*page && i < 50*(page+1);
        })
    }  
    else var respages = 1;
    
    // console.log(rs.length)
    res.json({
        "pages": respages,
        "count": count,
        "history":rs
    });
}
module.exports = router;
