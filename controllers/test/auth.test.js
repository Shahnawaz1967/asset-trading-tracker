import request from 'supertest';
import app from '../../server.js';
import User from '../../models/userModels.js';

let server;

server = app.listen(5001, () => {
  console.log('Test server running on port 5001');
});

afterAll((done) => {
  server.close(() => {
    console.log('Test server closed');
    done();
  });
});

describe('Auth Controller', () => {

    afterEach(async() => {
      await User.deleteMany({});
    })

    beforeEach(async () => {
      await User.deleteMany({})
    })

  
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ username: 'testuser', password: 'password123', email: 'testuser@example.com' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.message).toBe('User created successfully');

    const user = await User.findOne({ username: 'testuser' });
    expect(user).toBeTruthy();
  });

  it('should not register a user with existing username', async () => {
    await User.create({ username: 'testuser', password: 'password123', email: 'testuser@example.com' });

    const res = await request(app)
      .post('/auth/signup')
      .send({ username: 'testuser', password: 'password123', email: 'newuser@example.com' });

    expect(res.statusCode).toBe(409); //Conflict error
    expect(res.body.message).toBe('User already exists');
  });

  it('should login an existing user', async () => {
    await User.create({ username: 'testuser', password: 'password123', email: 'testuser@example.com' });

    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.message).toBe('Login successful');
  });

  it('should not login with incorrect password', async () => {
    await User.create({ username: 'testuser', password: 'password123', email: 'testuser@example.com' });

    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid username or password');
  });
});
