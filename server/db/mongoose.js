const mongoose = require('mongoose');

mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    promiseLibrary: global.Promise,
  }
);

module.exports = { mongoose };
