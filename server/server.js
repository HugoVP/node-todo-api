require('./db/mongoose');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();

app.use(bodyParser.json());

/* GET / - Home */
app.get('/', (_, res) => {
  res.send('Home');
});

/* POST /todos - Add a todo */
app.post('/todos', authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id,
  });

  todo
    .save()
    .then(todo => res.send(todo))
    .catch(err => res.status(400).send(err));
});

/* GET /todos */
app.get('/todos', authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id })
    .then(todos => res.send({ todos }))
    .catch(err => res.status(400).send(err));
});

/* GET /todos/:id */
app.get('/todos/:id', authenticate, (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id,
  })
    .then(todo => (todo ? res.send({ todo }) : res.status(404).send()))
    .catch(err => res.status(400).send(err));
});

/* DELETE /todos/:id */
app.delete('/todos/:id', authenticate, (req, res) => {
  /* Get the id */
  const { id } = req.params;

  /* Validate the id -> not valid? return 404 */
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  /* Remove todo by id */
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id,
  })
    .then(todo => (todo ? res.send({ todo }) : res.status(404).send()))
    .catch(err => res.status(400).send(err));
});

/* PATCH /todos/:id */
app.patch('/todos/:id', authenticate, (req, res) => {
  /* Get the id */
  const { id } = req.params;

  const body = _.pick(req.body, ['text', 'completed']);

  /* Validate the id -> not valid? return 404 */
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate(
    {
      _id: id,
      _creator: req.user._id,
    },
    {
      $set: body,
    },
    {
      new: true,
    }
  )
    .then(todo => (todo ? res.send({ todo }) : res.status(404).send()))
    .catch(err => res.status(400).send(err));
});

/* POST /users - Create a new user */
app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  const user = new User(body);

  user
    .save()
    .then(() => user.generateAuthToken())
    .then(token => res.header('x-auth', token).send(user))
    .catch(err => res.status(400).send(err));
});

/* GET /users/me */
app.get('/users/me', authenticate, (req, res) => res.send(req.user));

/* POST /users/login {email, password} */
app.post('/users/login', (req, res) => {
  const { email, password } = req.body;

  User.findByCredentials(email, password)
    .then(user => {
      console.log('ok');

      return user
        .generateAuthToken()
        .then(token => res.header('x-auth', token).send(user));
    })
    .catch(err => res.status(400).send(err));
});

/* DELETE /users/me/token */
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => res.send())
    .catch(() => res.status(400).send());
});

app.listen(process.env.PORT, () => {
  console.log(`Started on port: ${process.env.PORT}`);
});

module.exports = { app };
