const express = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { body, param } = require('express-validator');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { TicketType } = require('../models/TicketType');
const { Field } = require('../models/Field');
const { FieldType } = require('../models/FieldType');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  if (!req.user) res.redirect('/login');

  const ticketTypes = await TicketType.find({});
  res.render('index', { ticketTypes });
}));

router.get('/ticket/:ticketTypeShortName', asyncHandler(async (req, res) => {
  if (!req.user) res.redirect('/login');

  param('ticketTypeShortName')
    .escape();
  const ticketType = await TicketType.findOne(
    { shortName: req.params.ticketTypeShortName, active: true },
  ).populate('additionalFieldTypes').exec();
  if (!ticketType) {
    return res.redirect('/');
  }
  return res.render('ticket', { additionalFieldTypes: ticketType.additionalFieldTypes });
}));

router.post('/ticket/:ticketTypeShortName', asyncHandler(async (req, res) => {
  if (!req.user) res.redirect('/login');

  param('ticketTypeShortName')
    .escape();
  const ticketType = await TicketType.findOne(
    { shortName: req.params.ticketTypeShortName, active: true },
  ).populate('additionalFieldTypes').exec();

  if (!ticketType) {
    res.redirect('/');
  }

  body('firstName')
    .escape();
  body('lastName')
    .escape();
  const ticket = new Ticket({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    ticketType: ticketType.id,
    additionalFields: [],
  });

  ticketType.additionalFieldTypes.forEach(async (fieldType) => {
    body(fieldType.shortName)
      .escape();
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
  if (!req.user) res.redirect('/login');
  if (!req.user.isAdmin) res.redirect('/');

  const unHyphenedPrettyId = req.params.ticketPrettyId.replaceAll('-', '');
  const ticket = await Ticket.findById(unHyphenedPrettyId)
    .populate('additionalFields')
    .populate('ticketType')
    .exec();
  res.render('ticketDetail', { ticket });
}));

router.post('/ticketDetail/:ticketPrettyId/delete', asyncHandler(async (req, res) => {
  if (!req.user) res.redirect('/login');
  if (!req.user.isAdmin) res.redirect('/');

  const unHyphenedPrettyId = req.params.ticketPrettyId.replaceAll('-', '');
  const ticket = await Ticket.findById(unHyphenedPrettyId);
  if (ticket) {
    ticket.additionalFields.forEach(async (field) => {
      await Field.findByIdAndDelete(field);
    });
    await Ticket.findByIdAndDelete(ticket.id);
  }
  res.redirect('/ticketsDashBoard');
}));

router.get('/ticketsDashboard', asyncHandler(async (req, res) => {
  if (!req.user) res.redirect('/login');
  if (!req.user.isAdmin) res.redirect('/');

  const tickets = await Ticket.find({}).populate('ticketType').exec();
  res.render('ticketsDashBoard', { tickets });
}));

router.get('/createTemplate', asyncHandler(async (req, res) => {
  if (!req.user) res.redirect('/login');
  if (!req.user.isAdmin) res.redirect('/');

  const allFieldTypes = await FieldType.find();
  res.render('createTemplate', { allFieldTypes });
}));

router.post('/createTemplate', asyncHandler(async (req, res) => {
  if (!req.user) res.redirect('/login');
  if (!req.user.isAdmin) res.redirect('/');

  const ticketType = new TicketType({
    shortName: req.body.shortName,
    typeName: req.body.typeName,
    additionalFieldTypes: [],
    active: true,
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

router.get('/manageTemplates', asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) res.redirect('/');

  const allTicketTypes = await TicketType.find({});
  res.render('manageTemplates', { allTicketTypes });
}));

router.get('/editTemplate/:ticketTypeId', asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) res.redirect('/');

  const ticketType = await TicketType.findById(req.params.ticketTypeId)
    .populate('additionalFieldTypes')
    .exec();
  res.render('editTemplate', { ticketType });
}));

router.post('/editTemplate/:ticketTypeId',
  body('shortName').escape(),
  body('typeName').trim().escape(),

  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) res.redirect('/');

    const ticketType = await TicketType.findById(req.params.ticketTypeId);

    // go through all additionalFieldTypes in ticketType and update their name properties
    ticketType.additionalFieldTypes.forEach(async (id /* type mongoose.Types.ObjectId */) => {
      await FieldType.findByIdAndUpdate(id, { name: req.body[id.toString()] });
    });

    // when fields are added on the form, their html name attribute will be
    // additionalFieldTypesNames and additionalFieldTypesTypes, which will be
    // arrays if more than one field is added
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

    if (req.body.ticketTypeActive === 'on') {
      ticketType.active = true;
    } else {
      ticketType.active = false;
    }

    ticketType.shortName = req.body.shortName;
    ticketType.typeName = req.body.typeName;

    await ticketType.save();
    res.redirect(`/editTemplate/${ticketType.id}`);
  }),
);

router.post('/editTemplate/:ticketTypeId/delete', 
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) res.redirect('/');

    const ticketType = await TicketType.findById(req.params.ticketTypeId)
      .populate('additionalFieldTypes');
    if (!ticketType) {
      return res.redirect('/');
    }
    const allTickets = await Ticket.find();
    const hasTickets = allTickets.some(
      (ticket) => ticket.ticketType.equals(req.params.ticketTypeId),
    );
    if (hasTickets) {
      const error = 'Lösche erst alle Tickets von diesem Typ';
      res.render('editTemplate', { ticketType, error });
    } else {
      await TicketType.findByIdAndDelete(ticketType.id);
      res.redirect('/manageTemplates');
    }
  }),
);

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

router.get('/userManagement', asyncHandler(async (req, res, next) => {
  if (!req.user) res.redirect('/login');
  if (!req.user.isAdmin) res.redirect('/');

  const allUsers = await User.find();
  res.render('userManagement', { allUsers });
}));

router.get('/users/:id', asyncHandler(async (req, res, next) => {
  if (!req.user) res.redirect('/login');
  if (!req.user.isAdmin) res.redirect('/');

  const account = await User.findById(req.params.id);
  if (account) {
    res.render('user', { account });
  }
}));

router.post('/users/:id', asyncHandler(async (req, res, next) => {
  if (!req.user) res.redirect('/login');
  if (!req.user.isAdmin) res.redirect('/');

  const account = await User.findById(req.params.id);
  if (account) {
    if (req.body.isAdmin === 'on') {
      account.isAdmin = true;
    } else {
      account.isAdmin = false;
    }
    await account.save();
    res.render('user', { account });
  }
}));

module.exports = router;
