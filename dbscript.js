const mongoose = require('mongoose');
const { TicketType } = require('./models/TicketType');
const { FieldType } = require('./models/FieldType');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.DB);

  const allTickets = await Ticket.find();
  allTickets.forEach((element) => {
    console.log(element.ticketType.equals('66c50e6cf2ffbd20ec3888b3'));
  });

  await mongoose.disconnect();
}
main().catch((err) => console.log(err));
