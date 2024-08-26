const mongoose = require('mongoose');
const { TicketType } = require('./models/TicketType');
const { FieldType } = require('./models/FieldType');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.DB);

  const textarea = await FieldType.findOneAndDelete({ name: 'Text (mehrere Zeilen)' });

  

  await mongoose.disconnect();
}
main().catch((err) => console.log(err));
