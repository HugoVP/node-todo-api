const mongoose = require('mongoose');
const {Schema} = mongoose

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

/* Todo model */
const Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Number,
    default: null
  },
});

// var todo = new Todo({
//   text: 'Cook dinner',
// });

// var todo = Todo({
//   text: `Feed the cat`,
//   completed: true,
//   completedAt: 1234567890,
// });

var todo = Todo({
  text: `Walk the dog`,
});

todo.save().then((doc) => {
  console.log(JSON.stringify(doc, undefined, 2));
}).catch((err) => {
  console.log(`Unable to save: ${err}`);
});

/* User model */
const User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
});

var user = new User({
  email: 'one@example.com',
});

user.save().then((doc) => {
  console.log(`User saved: ${JSON.stringify(doc, undefined, 2)}`);
}).catch((err) => {
  console.log(`Unable to save: ${err}`);
});
