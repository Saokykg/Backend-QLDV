var express = require('express');
const utils = require('../middleware/utils');
var router = express.Router();
// var utilsHuyHieu = require('../Utils/utilsHuyHieu');



//middleware for checking access token
// router.use(utils.authenticateToken);

router.get('/' , async (req,res, next) => {
    
})

module.exports = router;