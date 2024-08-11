const express = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { TicketType } = require('../models/TicketType');
const { Field } = require('../models/Field');
const { FieldType } = require('../models/FieldType');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const ticketTypes = await TicketType.find({});
  res.render('index', { ticketTypes });
}));

router.get('/ticket/:ticketTypeShortName', asyncHandler(async (req, res) => {
  const ticketType = await TicketType.findOne(
    { shortName: req.params.ticketTypeShortName },
  ).populate('additionalFieldTypes').exec();
  if (!ticketType) {
    return res.redirect('/');
  }
  return res.render('ticket', { additionalFieldTypes: ticketType.additionalFieldTypes });
}));

router.post('/ticket/:ticketTypeShortName', asyncHandler(async (req, res) => {
  const ticketType = await TicketType.findOne(
    { shortName: req.params.ticketTypeShortName },
  ).populate('additionalFieldTypes').exec();

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

  ticketType.additionalFieldTypes.forEach(async (fieldType) => {
    const field = new Field({
      fieldType: fieldType.id,
      name: fieldType.name,
      value: req.body[fieldType.shortName],
    });
    ticket.additionalFields.push(field.id);
    await field.save();
  });

  await ticket.save();

  res.render('submissionComplete', { id: ticket.prettyID });
}));

router.get('/ticketDetail/:ticketPrettyId', asyncHandler(async (req, res) => {
  const unHyphenedPrettyId = req.params.ticketPrettyId.replaceAll('-', '');
  const ticket = await Ticket.findById(unHyphenedPrettyId)
    .populate('additionalFields')
    .exec();
  res.render('ticketDetail', { ticket });
}));

router.get('/ticketsDashboard', asyncHandler(async (req, res) => {
  if (!req.user) res.redirect('/login');
  const tickets = await Ticket.find({}).populate('ticketType').exec();
  res.render('ticketsDashBoard', { tickets });
}));

router.get('/createTemplate', asyncHandler(async (req, res) => {
  if (!req.user) res.redirect('/login');
  res.render('createTemplate');
}));

router.post('/createTemplate', asyncHandler(async (req, res) => {
  if (!req.user) res.redirect('/login');
  const ticketType = new TicketType({
    shortName: req.body.shortName,
    typeName: req.body.typeName,
    additionalFieldTypes: [],
  });

  if (req.body.additionalFieldTypesNames && req.body.additionalFieldTypesTypes) {
    if (!Array.isArray(req.body.additionalFieldTypesNames)
        && !Array.isArray(req.body.additionalFieldTypesTypes)) {
      req.body.additionalFieldTypesNames = [req.body.additionalFieldTypesNames];
      req.body.additionalFieldTypesTypes = [req.body.additionalFieldTypesTypes];
    }
    req.body.additionalFieldTypesNames.forEach(async (fieldTypeName, index) => {
      const additionalFieldType = new FieldType({
        name: fieldTypeName,
        type: req.body.additionalFieldTypesTypes[index],
      });
      ticketType.additionalFieldTypes.push(additionalFieldType._id);
      await additionalFieldType.save();
    });
  }

  await ticketType.save();

  res.redirect('/');
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

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/');
  });
});

module.exports = router;
