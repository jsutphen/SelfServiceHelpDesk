const express = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
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
  const tickets = await Ticket.find({}).populate('ticketType').exec();
  res.render('ticketsDashBoard', { tickets });
}));

router.get('/createTemplate', asyncHandler(async (req, res) => {
  const fieldTypes = await FieldType.find();
  res.render('createTemplate', { fieldTypes });
}));

router.post('/createTemplate', asyncHandler(async (req, res) => {
  const ticketType = new TicketType({
    shortName: req.body.shortName,
    typeName: req.body.typeName,
    additionalFieldTypes: [],
  });

  if (req.body.additionalFieldTypes) {
    if (!Array.isArray(req.body.additionalFieldTypes)) {
      req.body.additionalFieldTypes = [req.body.additionalFieldTypes];
    }
    req.body.additionalFieldTypes.forEach((fieldType) => {
      ticketType.additionalFieldTypes.push(fieldType);
    });
  }

  if (req.body.newFieldTypes) {
    if (!Array.isArray(req.body.newFieldTypes)) {
      req.body.newFieldTypes = [req.body.newFieldTypes];
    }

    req.body.newFieldTypes.forEach(async (fieldType) => {
      const newFieldType = new FieldType({
        name: fieldType.name,
        type: fieldType.type,
      });
      ticketType.additionalFieldTypes.push(newFieldType.id);
      await newFieldType.save();
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
