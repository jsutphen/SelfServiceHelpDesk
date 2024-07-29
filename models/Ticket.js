const mongoose = require('mongoose');
const TicketType = require('./TicketType');

const ticketSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    time: { type: Date, required: true, default: Date.now() },
    ticketType: { type: TicketType.ticketTypeSchema, required: true },
    additionalFields: [{ type: Object }],
  },
  {
    toJSON: { virtuals: true },
  },
);

ticketSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

ticketSchema.virtual('prettyDate').get(function () {
  const year = this.time.getFullYear();
  const month = this.time.getMonth();
  const day = this.time.getDate();
  return `${year}/${month}/${day}`;
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
