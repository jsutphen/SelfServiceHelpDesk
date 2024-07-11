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
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const ticket = new Ticket({ 
    firstName: firstName, 
    lastName: lastName,
    email: email
  });
  let id;
  await ticket.save().then( savedTicket =>
    id = savedTicket.id
  );
  // prettify id
  // id is very, very likely also unique with only 14 characters
  // as it is made up of 4 bytes of timestamp and additional 
  // random bytes
  id = id.substring(0,4) + '-' + 
    id.substring(5,9) + '-' + id.substring(10,14);
  res.render('submissionComplete', { id: id });
}));

router.get('/tickets', asyncHandler(async (req, res, next) => {
  const tickets = await Ticket.find({});
  res.render('ticketsDashBoard', { tickets: tickets });
}));

module.exports = router;
