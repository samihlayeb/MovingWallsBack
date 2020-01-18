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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', router);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// start server
// eslint-disable-next-line no-undef

router.post('/authenticate', authenticate);
router.get('/current', getCurrent);
router.get('/home', homepage );
function authenticate(req, res, next) {
  console.log('Authenticating...');
  console.log(req.body);
  if (req.body.userName == 'mv' && req.body.password == 'mv')
  {
    var token = jwt.sign({ username: req.body.userName, password: req.body.userName }, secret, { expiresIn: '24h' });
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
  var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers

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

function homepage (req, res, next) {

  res.status(200)
      .json({message: 'OK'})
}
