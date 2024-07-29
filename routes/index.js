const express = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const TicketType = require('../models/TicketType');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const ticketTypes = await TicketType.TicketType.find({});
  res.render('index', { ticketTypes });
  // res.send(ticketTypes);
}));

router.get('/ticket/:ticketTypeShortName', asyncHandler(async (req, res, next) => {
  const ticketType = await TicketType.TicketType.findOne(
    { shortName: req.params.ticketTypeShortName },
  );
  if (!ticketType) {
    return next();
  }

  return res.render('ticket', { additionalFieldNames: ticketType.additionalFieldNames });
  // return res.send(ticketType);
}));

router.post('/ticket/:ticketTypeShortName', asyncHandler(async (req, res, next) => {
  const ticketType = await TicketType.TicketType.find(
    { shortName: req.params.ticketTypeShortName },
  );

  if (ticketType.length === 0) {
    return;
  }
  const ticket = new Ticket({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
  });

  ticketType.additionalFieldNames.forEach((fieldName) => {
    ticket.additionalFields[fieldName] = req.body[fieldName];
  });

  let id;
  await ticket.save().then((savedTicket) => {
    id = savedTicket.id;
  });
  // prettify id
  // id is very, very likely also unique with only 12 characters
  // as it is made up of 4 bytes of timestamp and additional
  // random bytes
  id = `${id.substring(0, 4)}-${id.substring(4, 8)}-${id.substring(8, 12)}`;
  res.render('submissionComplete', { id });
}));

router.get('/tickets', asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({});
  res.render('ticketsDashBoard', { tickets });
}));

router.get('/signup', (req, res) => {
  res.render('signUp');
});

router.post('/signup', asyncHandler(async (req, res, next) => {
  const alreadyExistsCheck = await User.findOne({ username: req.body.username });
  if (alreadyExistsCheck != null) {
    // res.send(alreadyExistsCheck )
    res.render('signUp', { userError: 'Dieser Nutzername ist bereits vergeben!' });
  } else {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        next(err);
      } else {
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
        });
        await user.save();
        req.login(user, (loginErr) => {
          if (loginErr) {
            next(loginErr);
          } else {
            res.redirect('/');
          }
        });
      }
    });
  }
}));

router.get('/login', (req, res) => {
  res.render('login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login', // Changed to '/login' for clarity
  }),
);

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/');
  });
});

module.exports = router;
