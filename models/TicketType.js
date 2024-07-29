const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema(
  {
    shortName: { type: String, required: true },
    typeName: { type: String, required: true },
    additionalFieldNames: [{ type: String }],
  },
);

const TicketType = mongoose.model('TicketType', ticketTypeSchema);

module.exports = { TicketType, ticketTypeSchema };
