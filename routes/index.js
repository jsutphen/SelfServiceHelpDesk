const express = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const TicketType = require('../models/TicketType');
const { Field } = require('../models/Field');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const ticketTypes = await TicketType.TicketType.find({});
  res.render('index', { ticketTypes });
}));

router.get('/ticket/:ticketTypeShortName', asyncHandler(async (req, res) => {
  const ticketType = await TicketType.TicketType.findOne(
    { shortName: req.params.ticketTypeShortName },
  );
  if (!ticketType) {
    res.redirect('/');
  }

  return res.render('ticket', { additionalFieldNames: ticketType.additionalFieldNames });
}));

router.post('/ticket/:ticketTypeShortName', asyncHandler(async (req, res) => {
  const ticketType = await TicketType.TicketType.findOne(
    { shortName: req.params.ticketTypeShortName },
  );

  if (!ticketType) {
    res.redirect('/');
  }

  const ticket = new Ticket({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    ticketType: ticketType.id,
    additionalFields: [],
  });

  ticketType.additionalFieldNames.forEach(async (fieldName) => {
    const field = new Field({
      name: fieldName,
      value: req.body[fieldName.replace(' ', '_')],
    });
    ticket.additionalFields.push(field.id);
    await field.save();
  });

  await ticket.save();

  res.render('submissionComplete', { id: ticket.prettyID });
}));

router.get('/ticketsDashboard', asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({}).populate('ticketType').exec();
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
