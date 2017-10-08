const mongoose = require('mongoose');
const {Schema} = mongoose

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};
