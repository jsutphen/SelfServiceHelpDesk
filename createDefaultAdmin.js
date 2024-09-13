const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.DB);

  const alreadyExistsCheck = await User.findOne({ username: 'admin' });
  if (alreadyExistsCheck) {
    console.log('Admin already exists. Password will be overridden to "admin"');
  }

  const defaultAdmin = new User({
    username: 'admin',
    password: '',
    isAdmin: true,
  });

  try {
    const hashedPassword = await bcrypt.hash('admin', 10);
    defaultAdmin.password = hashedPassword;

    if (!alreadyExistsCheck) {
      await defaultAdmin.save();
    } else {
      await User.findByIdAndUpdate(alreadyExistsCheck.id, { password: defaultAdmin.password });
    }
  } catch (err) {
    console.log(err);
  }

  await mongoose.disconnect();
}
main().catch((err) => console.log(err));
