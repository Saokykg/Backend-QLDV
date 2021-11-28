var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
var utilsLoc = require('../Utils/utilsLoc');



//middleware for checking access token
// router.use(utils.authenticateToken);

router.get('/' , async (req,res, next) => {
    let rs = await utilsLoc.getAll();
    res.json(rs);
})


module.exports = router;