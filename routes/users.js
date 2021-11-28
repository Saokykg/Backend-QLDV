var express = require('express');
var router = express.Router();
const utils = require('../middleware/utils');
const utilsAcc = require('../Utils/utilsAccount');
const util = require('../middleware/utils');
const jwt = require('jsonwebtoken');
const crypto  = require('crypto');
const permission = require('../middleware/permission');
const Share = require('../share');
const utilHoSo = require('../Utils/utilsHoSo');
const utilsAccount = require('../Utils/utilsAccount');


/* GET users listing. */
// router.use(permission.authorize);
router.use(permission.read);

router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/getPerId/:id', async (req, res, next) => { 
  var rs = await utilsAcc.getPermission(req.params.id);
  rs = rs[0];
  // console.log(rs);
  rs.forEach( (r) =>{
    r.permission = r.permission.split(',').sort();
    for(let i = 0; i<r.permission.length; i++){
        r.permission[i]= parseInt(r.permission[i]);
    }
  })
  res.json(rs);
})

router.get('/getPer', async (req, res, next) => { 
  var rs = await utilsAcc.getPerName();
  console.log(rs[0]);
  rs = rs[0];
  rs.forEach( (r) =>{
    r.permission = r.permission.split(',');
    var list = [];
    r.permission.forEach( (v) =>{
      var tmp = v.split(';');
      var tmp2 = {};
      tmp2[`id`] = parseInt(tmp[1]);
      tmp2[`name`] = tmp[0];
      list.push(tmp2);
    })
    r.permission = list;
  })
  // console.log(rs);
  res.json(rs);
})

router.put('/updatePer', permission.authorize, async (req, res, next) => { 
  try {
    var user = req.body.user;
    await utilsAcc.deletePermission(user.id)
    user.permission.forEach( async (per) =>{
      var rs = await utilsAcc.insertPermission(user.id, per);
    })
      res.statusCode = 200;
      res.statusMessage = 'Update success';
      messenger = "Cập nhật thành công";
  } catch (error) {
    res.statusMessage = 'FAILED';
    messenger = "Cập nhật thất bại";
  }
  res.json({"res":messenger});   
})

router.get('/user', async (req, res, next) => { 
  var rs = await utilsAcc.getUser();
  rs = await Share.decodeArray(rs[0]);
  res.json(rs);
})

router.get('/user/:id', async (req, res, next) => { 
  var rs = await utilsAcc.getUserId(req.params.id);
  rs = await Share.decode(rs[0]);
  rs =rs[0];
  if (rs['group'])
    rs['group'] = rs['group'].split(',');  
  else
    rs['group'] = [];
  res.json(rs);
})

router.get('/nonCreatedUser', async (req, res, next) =>{
  var rs = await utilHoSo.getListNoAccount();
  rs = await Share.decodeArray(rs[0]);
  res.json(rs);
})

router.put('/disable/:id', async (req,res,next) =>{
    try {
      var userid = req.params.id;
      await utilsAcc.active(userid, 0);
      messenger = "Vô hiệu hóa thành công";
      res.json({"res":messenger})
    } catch (err) {
      res.sendStatus(400);
      console.log(err);
    }
})

module.exports = router;
