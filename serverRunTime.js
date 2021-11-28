const schedule = require('node-schedule');
const utilsKyLuat      = require('./Utils/utilsKyLuat');
const utilsChuyenSH    = require('./Utils/utilsChuyenSH');
const utilsThanhTich   = require('./Utils/utilsThanhTich');
const utilsHoSo_HuyHieu= require('./Utils/utilsHoSo_HuyHieu');
const utilsNgoaiQuoc   = require('./Utils/utilsNgoaiQuoc');
const utilsSoQuyetDinh = require('./Utils/utilsSoQuyetDinh');
const utilsThongBao    = require('./Utils/utilsThongBao');
const utilsHuyHieu = require('./Utils/utilsHuyHieu');
const utilsGiaNhap = require('./Utils/utilsGiaNhap');
const utilsHoSo_ChucVu = require('./utils/utilsHoSo_ChucVu');
const utilsHoSo = require('./Utils/utilsHoSo');
const utilsAccount = require('./Utils/utilsAccount');
const utilsChiBo = require('./Utils/utilsChiBo');
const share = require('./share');

const job = schedule.scheduleJob('*/1 * * * * *', async function(){
    
    await huyHieu();
    await giaNhap();
    await chuyensh();
    await kyluat();
    console.log("=========================");
});

async function  renewThongBao(){    
    await utilsThongBao.renew();
}

async function sendNotificationMail(){
    var thongbaos = await utilsThongBao.getToday();
    thongbaos = await share.decodeArray(thongbaos[0]);
    if (thongbaos.length!=0){
        var mess =`Sự kiện diễn ra trong ngày hôm nay: <br>`;
        for(const thongbao of thongbaos){
            mess += thongbao['Nội dung'] + `<br>`;
        }
        var emails = await utilsAccount.getEmail();
        emails = emails[0];
        var e = [];
        for (const obj of emails){
            e.push(obj[`email`])
        }
        await share.notificationMail(mess, e);
        console.log(mess);
    }
}

async function huyHieu(){
    var gnd = await utilsGiaNhap.getEventHuyHieu();   
    gnd = await share.decodeArray(gnd[0]);
    for (const g of gnd){
        var check = await utilsHoSo_HuyHieu.check(g[`idhs`], g[`Năm`]);
        check = check[0];
        if (check.length == 0){
            var nd = g[`Số thẻ đảng`] + " - " + g[`Họ và tên đệm`] + " " + g[`Tên`] + " " + g[`Năm`] + " năm tuổi Đảng còn " + g[`countdown`] + " ngày " ;
            var thongbao = new utilsThongBao(null, null, nd, g[`Ngày`], "huyhieu", g[`idhs`], "huyHieu");
            await utilsThongBao.insert(thongbao);
        }
    }
}

async function giaNhap(){
    var gianhap = await utilsGiaNhap.getEventGiaNhap();
    gianhap = await share.decodeArray(gianhap[0]);
    for (const g of gianhap){
            var nd = g[`Số thẻ đảng`] + " - " + g[`Họ và tên đệm`] + " " + g[`Tên`] + " hạn kết nạp Đảng chính thức còn " + g[`countdown`] + " ngày " ;
            var thongbao = new utilsThongBao(null, null, nd, g[`db`], "gianhapdang", g[`idhs`], "hoso");
            await utilsThongBao.insert(thongbao);
    }
}

async function chuyensh(){
    var chuyenshs = await utilsChuyenSH.getTodayEvent();
    chuyenshs = await share.decodeArray(chuyenshs[0]);
    for (const chuyensh  of chuyenshs){
        var action_id = await utilsHoSo.insertAction(1, chuyensh[`id`]);
        action_id = action_id[0][0].id;
        switch(chuyensh[`Loại chuyển`]){
            case 'Nội bộ': 
                var chibo = await utilsChiBo.getByName(chuyensh[`Chuyển đến`]);
                chibo = chibo[0][0].id;
                await utilsHoSo.updateChuyenSH(chuyensh[`idhs`],  chibo, 1, chuyensh[`Ngày đi`], action_id);
                break;
            default :
                await utilsHoSo.updateActive(chuyensh[`idhs`], 0, 1, chuyensh[`Ngày đi`], action_id);
        }
        await utilsHoSo.updateNewChibo(chuyensh[`idhs`]);
    }
}

async function kyluat(){
    var kyluats = await utilsKyLuat.getTodayEvent();
    kyluats = kyluats[0];
    for (const kyluat of kyluats){
        var action_id = await utilsHoSo.insertAction(1, kyluat[`id`]);
        action_id = action_id[0][0].id;
        await utilsHoSo.updateActive(kyluat['idhs'], 0, 1, kyluat[`Ngày`], action_id);
        await utilsHoSo.updateTrangThai(kyluat['idhs'], 3, 1, kyluat[`Ngày`], action_id);
        await utilsHoSo.updateNewTrangThai(kyluat[`idhs`]);
    }
    
}