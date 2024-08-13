const mongoose = require('mongoose');
const TicketType = require('./TicketType');
const { fieldSchema } = require('./Field');

function fourDigitRandomString() {
  let result = '';
  for (let i = 0; i < 4; i += 1) {
    result += Math.floor(Math.random() * 36).toString(36);
  }
  return result;
}

const ticketSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default() {
        return `${Date.now().toString(36)}${fourDigitRandomString()}`;
      },
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    time: { type: Date, required: true, default: Date.now() },
    ticketType: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'TicketType' },
    additionalFields: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Field' }],
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
  return `${this.id.substring(0, 4)}-${this.id.substring(4, 8)}`
  + `-${this.id.substring(8, 12)}`;
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
