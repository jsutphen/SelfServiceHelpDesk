const mongoose = require('mongoose');
const { TicketType } = require('./models/TicketType');
const { FieldType } = require('./models/FieldType');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.DB);

  const hardwareInstallationTicketType = new TicketType({
    shortName: 'hardwareInstallation',
    typeName: 'Hardware-Installation',
    additionalFieldTypes: [],
  });

  const oldRoomField = await FieldType.findOne({ name: 'Alter Raum' });
  hardwareInstallationTicketType.additionalFieldTypes.push(oldRoomField.id);

  const newRoomField = await FieldType.findOne({ name: 'Neuer Raum' });
  hardwareInstallationTicketType.additionalFieldTypes.push(newRoomField.id);

  const date = await FieldType.findOne({ name: 'Datum' });
  hardwareInstallationTicketType.additionalFieldTypes.push(date.id);

  await hardwareInstallationTicketType.save();

  // await hardwareInstallation.save();
  await mongoose.disconnect();
}
main().catch((err) => console.log(err));
