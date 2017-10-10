const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();

app.use(bodyParser.json());

/* POST /todos - Add a todo */
app.post('/todos', (req, res) => {
    const todo = new Todo({
      text: req.body.text,
    });

    todo.save()
      .then((todo) => res.send(todo))
      .catch((err) => res.status(400).send(err));
});

/* GET /todos */
app.get('/todos', (req, res) => {
  Todo.find()
    .then((todos) => res.send({todos}))
    .catch((err) => res.status(400).send(err));
});

/* GET /todos/:id */
app.get('/todos/:id', (req, res) => {
  const {id} = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id)
    .then((todo) => todo ? res.send({todo}) : res.status(404).send())
    .catch((err) => res.status(400).send(err));
});

/* DELETE /todos/:id */
app.delete('/todos/:id', (req, res) => {
  /* Get the id */
  const {id} = req.params;

  /* Validate the id -> not valid? return 404 */
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  /* Remove todo by id */
  Todo.findByIdAndRemove(id)
    .then((todo) => todo ? res.send({todo}) : res.status(404).send())
    .catch((err) => res.status(400).send(err));
});

/* PATCH /todos/:id */
app.patch('/todos/:id', (req, res) => {
  /* Get the id */
  const {id} = req.params;

  const body = _.pick(req.body, ['text', 'completed']);

  /* Validate the id -> not valid? return 404 */
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }
  else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
    .then((todo) => todo ? res.send({todo}) : res.status(404).send())
    .catch((err) => res.status(400).send(err));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Started on port: ${PORT}`);
});

module.exports = {app};
