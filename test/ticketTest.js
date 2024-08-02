const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');

function ticketTest1() {
  const ticketType = new TicketType.TicketType({
    shortName: 'testType',
    typeName: 'Test Type',
  });
  const ticket = new Ticket({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.net',
    // possible gotcha: js dates are defined with monthINDEXES ... 0-11
    time: Date.UTC(2024, 6, 31, 12, 0, 0, 0),
    ticketType,
  });

  if (ticket.prettyDate === '2024/7/31') {
    console.log('ticketTest1 succeded');
  } else {
    console.log('ticketTest1 failed');
  }
}

function ticketTest2() {
  const ticketType = new TicketType.TicketType({
    shortName: 'testType',
    typeName: 'Test Type',
  });
  const ticket = new Ticket({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.net',
    ticketType,
  });

  // prettyID is a string with three quadruples
  // of alphanumerical values separated by hyphens
  // which is checked using this regex:
  const re = /\b(([A-z]|[0-9]){4}-){2}([A-z]|[0-9]){4}\b/;
  if (re.test(ticket.prettyID)) {
    console.log('ticketTest2 succeded');
  } else {
    console.log('ticketTest2 failed');
  }
}

ticketTest1();
ticketTest2();
