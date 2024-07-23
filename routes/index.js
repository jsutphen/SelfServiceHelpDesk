const express = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Ticket = require('../models/Ticket');
const HardwareInstallationTicket = require('../models/HardwareInstallationTicket');
const User = require('../models/User');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

router.get('/new-ticket', (req, res) => {
  res.render('newTicket');
});

router.post('/new-ticket', asyncHandler(async (req, res) => {
  let ticket;
  if (req.body.ticketType === 'hardwareInstallation') {
    ticket = new HardwareInstallationTicket({
      oldLocation: req.body.oldLocation,
      newLocation: req.body.newLocation,
      hardware: req.body.hardware,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    });
  } else {
    ticket = new Ticket({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    });
  }
  let id;
  await ticket.save().then((savedTicket) => {
    id = savedTicket.id;
  });
  // prettify id
  // id is very, very likely also unique with only 14 characters
  // as it is made up of 4 bytes of timestamp and additional
  // random bytes
  id = `${id.substring(0, 4)}-${id.substring(5, 9)}-${id.substring(10, 14)}`;
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
  }
  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    if (err) {
      next(err);
    }
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await user.save();
    req.login(user, (loginErr) => {
      if (loginErr) {
        next(loginErr);
      }
      res.redirect('/');
    });
  });
}));

router.get('/login', (req, res) => {
  res.render('login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
  }),
);

module.exports = router;
