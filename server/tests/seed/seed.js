const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
  {
    _id: userOneId,
    email: 'one@example.com',
    password: 'userOnePass',
    tokens: [
      {
        access: 'auth',
        token: jwt
          .sign(
            {
              _id: userOneId,
              access: 'auth',
            },
            process.env.JWT_SECRET
          )
          .toString(),
      },
    ],
  },
  {
    _id: userTwoId,
    email: 'two@example.com',
    password: 'userTwoPass',
    tokens: [
      {
        access: 'auth',
        token: jwt
          .sign(
            {
              _id: userTwoId,
              access: 'auth',
            },
            process.env.JWT_SECRET
          )
          .toString(),
      },
    ],
  },
];

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneId,
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: new Date().getTime(),
    _creator: userOneId,
  },
  {
    _id: new ObjectID(),
    text: 'Third test todo',
    _creator: userTwoId,
  },
];

function populateUsers(done) {
  User.deleteMany({})
    .then(() => {
      const userOne = new User(users[0]).save();
      const userTwo = new User(users[1]).save();

      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
}

function populateTodos(done) {
  Todo.deleteMany({})
    .then(() => Todo.insertMany(todos))
    .then(() => done());
}

module.exports = {
  users,
  todos,
  populateUsers,
  populateTodos,
};
