require('rootpath')();
const express = require('express');
const app = express();
const router = express.Router();
var secret = 'movingwalls';
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('./models/User');

var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('../public/swagger');

var dummyData = require('../public/dummyData.json');
app.use('/MovingWalls', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', router);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// start server
// eslint-disable-next-line no-undef

router.post('/authenticate', authenticate);
router.get('/current', getCurrent);

function authenticate(req, res, next) {
    console.log('Authenticating...');
    console.log(req.body);
    if (req.body.userName == 'mv' && req.body.password == 'mv')
    {
        var rememberMe = req.body.rememberMe;
        var token;
        if (rememberMe == 1){
            token = jwt.sign({ username: req.body.userName, password: req.body.userName }, secret);
        } else {
            token = jwt.sign({ username: req.body.userName, password: req.body.userName }, secret, { expiresIn: '24h' });
        }
        res.status(200).json({ success: true, message: 'User authenticated!', token: token});

        //res.status(200)
        //  .json({message: ' Login successful'})
    }
    else {
        res.status(500)
            .json({message: 'erreur'})
    }
}


function getCurrent () {}
module.exports = router;
app.use(router);
const port =
    process.env.NODE_ENV === 'production' ? process.env.PORT || 80 : 4000;
const server = app.listen(port, function() {
    // eslint-disable-next-line no-console
    console.log('Server listening on port ' + port);
});

// Middleware for Routes that checks for token - Place all routes after this route that require the user to already be logged in
router.use(function(req, res, next) {
    console.log('checktoken');
    var token = req.body.token || req.body.query || req.headers['x-access-token'] || req.headers['Bearer Token']; // Check for token in body, URL, or headers

    // Check if token is valid and not expired
    if (token) {
        // Function to verify token
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                res.json({ success: false, message: 'Token invalid' }); // Token has expired or is invalid
            } else {
                req.decoded = decoded; // Assign to req. variable to be able to use it in next() route ('/me' route)
                next(); // Required to leave middleware
            }
        });
    } else {
        res.json({ success: false, message: 'No token provided' }); // Return error if no token was provided in the request
    }
});

/**
 Pagination()
 @param: indexStart
 @param: indexEnd
 @return:
 dataSize: number of all items
 data: a list of items from @indexStart to @indexEnd
 **/
router.post('/home', homepage );
function homepage (req, res, next) {
    var indexStart  = req.body.indexStart;
    var indexEnd = req.body.indexEnd;
    res.status(200)
        .json({data: dummyData.slice(indexStart,indexEnd), dataSize: dummyData.length})
}



/**
 Sort()
 @param: indexStart
 @param: indexEnd
 @return:
 dataSize: number of all items
 data: a list of items from @indexStart to @indexEnd sorted with:
 Published > Processed > Ongoing > Archived
 **/
router.post('/sort', sort );
function sort(req, res, next) {
    var indexStart  = req.body.indexStart;
    var indexEnd = req.body.indexEnd;
    var sortedData = dummyData.sort(compareFn);
    res.status(200)
        .json({data: sortedData.slice(indexStart,indexEnd), dataSize: dummyData.length})
}
function compareFn(varFirst, varSecond){
    var varFirstPower = getStatusPower(varFirst);
    var varSecondPower = getStatusPower(varSecond);
    if (varFirstPower == varSecondPower) return 0;
    if (varFirstPower > varSecondPower) return 1;
    return -1
}
function getStatusPower(campaign) {
    switch(campaign.status){
        case "Archived": {
            return 4;
            break;
        }
        case "Ongoing":{
            return 3;
            break;
        }
        case "Processed":{
            return 2;
            break;
        }
        case "Published":{
            return 1;
            break;
        }
        default:
            return 0;
    }
}



/**
 Search()
 @param: indexStart
 @param: indexEnd
 @param: searchParam : base on which param of your campaign you want to search
 @param: value : the value of the param you want to find
 @return:
 dataSize: number of all items
 data: a list of items from @indexStart to @indexEnd containing @value as its @searchParam
 **/
router.post('/search', search );
function search(req, res, next) {
    var indexStart  = req.body.indexStart;
    var indexEnd = req.body.indexEnd;
    var searchBy = req.body.searchParam;
    var valToBeFound = req.body.value.toLowerCase();
    var filteredData = new Array();
    switch (searchBy) {
        case "company": {
            filteredData = searchByCompany(valToBeFound); break;
        }
        case "date": {
            filteredData = searchByDate(valToBeFound); break;
        }
        case "status": {
            filteredData = searchByStatus(valToBeFound); break;
        }
    }
    res.status(200)
        .json({data: filteredData.slice(indexStart,indexEnd), dataSize: dummyData.length})
}
//test heroku
function searchByCompany (valToBeFound) {
    return dummyData.filter ( campaign => campaign.company.toLowerCase() == valToBeFound);
}
function searchByDate (valToBeFound) {
    return dummyData.filter ( campaign => campaign.date == valToBeFound);
}
function searchByStatus (valToBeFound) {
    return dummyData.filter ( campaign => campaign.status.toLowerCase() == valToBeFound);
}
