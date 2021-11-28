var express = require('express');
var router = express.Router();
const utils = require('../middleware/utils');
const utilsAcc = require('../Utils/utilsAccount');
const util = require('../middleware/utils');
const jwt = require('jsonwebtoken');
const crypto  = require('crypto');
const permission = require('../middleware/permission');
const utilsGroup = require('../Utils/utilsGroup');

/* GET users listing. */
// router.use(permission.authorize);
router.use(permission.read);

router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/fulllist', async(req, res, next) => {
    var group = await utilsGroup.getFullGroup();
    res.json(group[0]);
});

router.get('/list', async(req, res, next) => {
    var group = await utilsGroup.getGroup();
    res.json(group[0]);
});
  
router.get('/list/:id', async(req, res, next) => {
    var group = await utilsGroup.getGroupId(req.params.id);
    group = group[0][0];

    var rs1 = await utilsGroup.getUserInGroup(req.params.id);
    rs1 = rs1[0];
    group.user = rs1;

    var rs2 = await utilsGroup.getGroupPermission(req.params.id);
    rs2 = rs2[0];
    // console.log(rs);
    rs2.forEach( (r) =>{
        r.permission = r.permission.split(',').sort();
        for(let i = 0; i<r.permission.length; i++){
            r.permission[i]= parseInt(r.permission[i]);
        }
    })
    group.permission = rs2;

    res.json(group);
});

router.post('/insert', async(req, res, next) => {   
    try {
        var group = req.body.group;
        var info = new utilsGroup(null, group.name, group.description );
        var rs = await utilsGroup.insert(info);
        res.json({
            groupid : rs[0].insertId,
            "res":"Thành công"});
    } catch (error) {
        res.statusCode = 404;
        res.json({"error":"Thất bại"})
    }
});

router.put('/update', async(req, res, next) => {
    try {
        var group = req.body.group;
        var info = new utilsGroup(group.id, group.name, group.description );
        await utilsGroup.update(info);
        res.json({"res":"Thành công"});
    } catch (error) {
        res.statusCode = 404;
        res.json({"error":"Thất bại"})
    }
});

router.put('/deactive', async(req, res, next) => {
    try {
        var ids = req.body.id;
        ids.unshift(0);
        console.log(ids);
        await utilsGroup.active(ids);
        res.json({"res":"Thành công"});
    } catch (error) {
        res.statusCode = 404;
        console.log(error);
        res.json({"error":"Thất bại"})
    }
});

router.put('/active', async(req, res, next) => {
    try {
        var ids = req.body.id;
        ids.unshift(1);
        console.log(ids);
        await utilsGroup.active(ids);
        res.json({"res":"Thành công"});
    } catch (error) {
        res.statusCode = 404;
        console.log(error);
        res.json({"error":"Thất bại"})
    }
});

router.get('/groupUser/:id', async(req, res, next) => {
    var rs = await utilsGroup.getUserInGroup(req.params.id);
    rs = rs[0];
    res.json(rs);
});

router.get('/groupPermision/:id', async(req, res, next) => {
    var rs = await utilsGroup.getGroupPermission(req.params.id);
    rs = rs[0];
    // console.log(rs);
    rs.forEach( (r) =>{
        r.permission = r.permission.split(',').sort();
        for(let i = 0; i<r.permission.length; i++){
            r.permission[i]= parseInt(r.permission[i]);
        }
    })
    res.json(rs);
});

router.put('/updateGroupPermisison', async(req, res, next) => {
    try {
        var group = req.body.group;
        await utilsGroup.deleteGroupPermission(group.id)
        group.permission.forEach( async (per) =>{
          var rs = await utilsGroup.insertGroupPermission(group.id, per);
        })
        res.statusCode = 200;
        res.statusMessage = 'Update success';
        messenger = "Cập nhật thành công";
      } catch (error) {
        res.statusMessage = 'FAILED';
        console.log(error);
        messenger = "Cập nhật thất bại";
      }
      res.json({"res":messenger});   
});

router.post('/addUserGroup', async(req, res, next) => {
    try {
        const userid = req.body.user;
        const groupid = req.body.groupid;
        console.log(userid, groupid);
        await utilsGroup.deleteUserGroup(userid);
        await utilsGroup.addUserGroup(groupid, userid);
        res.statusCode = 200;
        res.statusMessage = 'Update success';
        messenger = "Cập nhật thành công";
      } catch (error) {
        res.statusMessage = 'FAILED';
        console.log(error);
        messenger = "Cập nhật thất bại";
      }
      res.json({"res":messenger});   
});

router.delete('/removeUserGroup/:groupid/:userid', async(req, res, next) => {
    try {
        const userid = req.params.userid;
        const groupid = req.params.groupid;
        if(userid && groupid){
            await utilsGroup.removeUserGroup(groupid, userid);
            res.statusMessage = 'Update success';
            messenger = "Cập nhật thành công";
        }
        else{
            res.sendStatus(400);
            return;
        }
      } catch (error) {
        res.statusMessage = 'FAILED';
        console.log(error);
        messenger = "Cập nhật thất bại";
      }
      res.json({"res":messenger});   
});

module.exports = router;
