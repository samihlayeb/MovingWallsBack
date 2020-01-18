const express = require('express');
const router = express.Router();
router.post('/authenticate', authenticate);
router.get('/current', getCurrent);

function authenticate(req, res, next) {
    console.log('Authenticating...');
    console.log(req.body);
    if (req.user.userName == 'mv' && req.user.password == 'mv')
    {
        res.status(200)
            .json({message: ' Login successful'})
    }
else {
    res.status(500)
        .json({message: 'erreur'})
    }
}
function getCurrent () {}
module.exports = router;
