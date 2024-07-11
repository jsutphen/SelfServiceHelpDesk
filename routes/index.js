var express = require('express');
const asyncHandler = require('express-async-handler');
var router = express.Router();
const Ticket = require('../models/Ticket');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/new-ticket', (req, res, next) =>  {
  res.render('newTicket');
});

router.post('/new-ticket', asyncHandler(async(req, res, next) => {
  const name = req.body.firstName + req.body.lastName;
  const email = req.body.email;
  const ticket = new Ticket({ name: name, email: email});
  let id;
  await ticket.save().then( savedTicket =>
    id = savedTicket.id
  );
  // prettify id
  id = id.substring(0,4) + '-' + 
    id.substring(5,9) + '-' + id.substring(10,14);
  res.render('submissionComplete', { id: id });
}));

module.exports = router;
