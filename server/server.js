const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/Todo');
const {User} = require('./models/User');

const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    const todo = new Todo({
      text: req.body.text,
    });

    todo.save().then((doc) => {
      res.send(doc);
    }).catch((err) => {
      res.status(400).send(err);
    });
});

app.listen(3000, () => {
  console.log(`Started on port: 3000`);
});

// /* Create a todo */
// var todo = Todo({
//   text: `Walk the dog`,
// });
//
// todo.save().then((doc) => {
//   console.log(JSON.stringify(doc, undefined, 2));
// }).catch((err) => {
//   console.log(`Unable to save: ${err}`);
// });
//
// /* Create a user */
// var user = new User({
//   email: 'one@example.com',
// });
//
// user.save().then((doc) => {
//   console.log(`User saved: ${JSON.stringify(doc, undefined, 2)}`);
// }).catch((err) => {
//   console.log(`Unable to save: ${err}`);
// });
