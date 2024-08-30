const mongoose = require('mongoose');
const { TicketType } = require('./models/TicketType');
const { FieldType } = require('./models/FieldType');
const User = require('./models/User');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.DB);

  const jonathan = await User.findOne({ username: 'jonathan' });

  console.log(jonathan);

  await mongoose.disconnect();
}
main().catch((err) => console.log(err));
