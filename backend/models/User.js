
const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String },
  country: { type: String },
});

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  address: addressSchema,
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  phoneNumber: { type: String },
  profileImage: { type: String },
  lastSeen: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  // OAuth provider information
  oauthProvider: { type: String, enum: ['local', 'google', 'apple'], default: 'local' },
  oauthId: { type: String },
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
  },
}, {
  timestamps: true,
});

// Ensure _id is sent as id to frontend (without password)
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
