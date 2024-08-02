const mongoose = require('mongoose');
const TicketType = require('./TicketType');
const { fieldSchema } = require('./Field');

const ticketSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    time: { type: Date, required: true, default: Date.now() },
    ticketType: { type: TicketType.ticketTypeSchema, required: true },
    additionalFields: [{ type: fieldSchema }],
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
  const month = this.time.getMonth() + 1;
  const day = this.time.getDate();
  return `${year}/${month}/${day}`;
});

ticketSchema.virtual('prettyID').get(function () {
  return `${this.id.substring(0, 4)}-${this.id.substring(4, 8)}-${this.id.substring(8, 12)}`;
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
