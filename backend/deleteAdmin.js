const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.js');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.deleteOne({ email: 'admin@ezooze.com' });
    console.log('Deleted existing admin user');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
