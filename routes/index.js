var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) {
  res.render('index');
});

router.get('/new-ticket', (req, res, next) =>  {
  res.render('newTicket');
});

module.exports = router;
