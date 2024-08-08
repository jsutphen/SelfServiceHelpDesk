const mongoose = require('mongoose');
require('./FieldType');

const ticketTypeSchema = new mongoose.Schema(
  {
    // shortName appears in the URL of the ticket
    shortName: { type: String, required: true },
    // typeName is the full display name of the ticket type
    typeName: { type: String, required: true },
    additionalFieldTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FieldType' }],
  },
);

const TicketType = mongoose.model('TicketType', ticketTypeSchema);

module.exports = { TicketType, ticketTypeSchema };
