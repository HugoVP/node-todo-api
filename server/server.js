const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    const todo = new Todo({
      text: req.body.text,
    });

    todo.save()
      .then((doc) => {
        res.send(doc);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
});

app.get('/todos', (req, res) => {
  Todo.find()
    .then((todos) => {
      res.send({todos});
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.get('/todos/:id', (req, res) => {
  const {id} = req.params;

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
    return;
  }

  Todo.findById(id)
    .then((todo) => {
      if (!todo) {
        res.status(404).send();
      }
      else {
        res.send({todo});
      }
    })
    .catch((err) => res.status(400).send(err));
});

app.delete('/todos/:id', (req, res) => {
  /* Get the id */
  const {id} = req.params;

  /* Validate the id -> not valid? return 404 */
  if (!ObjectID.isValid(id)) {
    res.status(404).send();
    return;
  }

  /* Remove todo by id */
  Todo.findByIdAndRemove(id)
    .then((todo) => {
      /* If no doc, send 404 */
      if (!todo) {
        res.status(404).send();
      }
      /* Id doc, send doc back with 200 */
      else {
        res.send(todo);
      }
    })    
    .catch((err) => res.status(400).send(err));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Started on port: ${PORT}`);
});

module.exports = {app};
