const mongoose = require('mongoose');
const TicketType = require('./models/TicketType');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.DB);
  const hardwareInstallation = new TicketType.TicketType({
    typeName: 'Hardware-Installation',
    shortName: 'hardwareInstallation',
    additionalFieldNames: [
      'Alter Standort',
      'Neuer Standort',
      'Datum',
    ],
  });
  await hardwareInstallation.save();
  
  // await hardwareInstallation.save();
  await mongoose.disconnect();
}
main().catch((err) => console.log(err));
