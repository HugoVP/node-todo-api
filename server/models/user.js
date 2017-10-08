const mongoose = require('mongoose');

/* User model */
const User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
});

module.exports = {User};
