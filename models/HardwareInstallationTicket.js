const { default: mongoose } = require('mongoose');
const Ticket = require('./Ticket');

const HardwareInstallationTicket = Ticket.discriminator('HardwareInstallation',
  new mongoose.Schema({
    oldLocation: { type: String, required: true },
    newLocation: { type: String, required: true },
    hardware: { type: String, required: true }
  })
);

module.exports = HardwareInstallationTicket;