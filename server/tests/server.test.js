const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {
  users,
  todos,
  populateUsers,
  populateTodos,
} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        const text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }

                Todo.find({text})
                    .then((todos) => {
                        expect(todos.length).toBe(1);
                        expect(todos[0].text).toBe(text);
                        done();
                    })
                    .catch((err) => done(err));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .end((err, res) => {
                if (err) {
                    done(err);
                    return;
                }

                Todo.find()
                    .then((todos) => {
                        expect(todos.length).toBe(3);
                        done()
                    })
                    .catch((err) => done(err));
            });
    });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    const id = todos[0]._id.toHexString();

    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return todo doc created by other user', (done) => {
    const id = todos[2]._id.toHexString();

    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 err if todo not found', (done) => {
    const id = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/todos/123}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    const id = todos[2]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => expect(res.body.todo._id).toBe(id))
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findByIdAndRemove(id)
          .then((todo) => {
            expect(todo).toNotExist();
            done();
          })
          .catch((err) => done(err));
      });
  });

  it('should not remove a todo created by other user', (done) => {
    const id = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findByIdAndRemove(id)
          .then((todo) => {
            expect(todo).toExist();
            done();
          })
          .catch((err) => done(err));
      });
  });

  it('should return 404 if todo not found', (done) => {
    const id = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete(`/todos/123abc`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    const id = todos[0]._id.toHexString();
    const text = "Updated text";

    request(app)
      .patch(`/todos/${id}`)
      .send({
        completed: true,
        text
      })
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA("number");
      })
      .end(done);
  });

  it('should not update a todo created by other user', (done) => {
    const id = todos[2]._id.toHexString();
    const text = "Updated text";

    request(app)
      .patch(`/todos/${id}`)
      .send({
        completed: true,
        text
      })
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    const id = todos[1]._id.toHexString();
    const text = "Updated text'";

    request(app)
      .patch(`/todos/${id}`)
      .send({
        completed: false,
        text
      })
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('GET users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => expect(res.body).toEqual({}))
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'test@test.com';
    const password = '123abc';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email})
          .then((user) => {
            expect(user).toExist();
            expect(user.password).toNotBe(password);
            done();
          })
          .catch((err) => done(err));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123',
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if email is in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: '123abc',
      })
      .expect(400)
      .end(done);
  });
});


describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password,
      })
      .expect(200)
      .expect((res) => expect(res.headers['x-auth']).toExist())
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens[1]).toInclude({
              access: 'auth',
              token: res.headers['x-auth'],
            });

            done();
          })
          .catch((err) => done(err));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1',
      })
      .expect(400)
      .expect((res) => expect(res.headers['x-auth']).toNotExist())
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(1);
            done();
          })
          .catch((err) => done(err));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => expect(res.headers['x-auth']).toNotExist())
      .end((err, res) => {
        User.findById(users[0]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch((err) => done(err));
      })
  });
});
