import { app } from '../../../../app';
import request from 'supertest';
import createConnection from '../../../../database';
import { Connection } from 'typeorm';

let connection: Connection;

const user = {
  name: 'John Doe',
  email: 'jonh.doe@email.com',
  password: 'p@ssw0rd'
}

describe('Create statement controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a deposit', async () => {
    await request(app)
      .post('/api/v1/users')
      .send({
        name: user.name,
        email: user.email,
        password: user.password
      });

    const session = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      });

    const deposit = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'test deposit'
      })
      .set({
        authorization: `Bearer ${session.body.token}`
      })

    expect(deposit.status).toEqual(201);
    expect(deposit.body.description).toEqual('test deposit');
    expect(deposit.body.type).toEqual('deposit');
    expect(deposit.body.amount).toEqual(100);
    expect(deposit.body).toHaveProperty('created_at')
    expect(deposit.body).toHaveProperty('updated_at')
  });

  it('should be able to create a withdraw', async () => {
    const session = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      });

    const withdraw = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 50,
        description: 'test withdraw'
      })
      .set({
        authorization: `Bearer ${session.body.token}`
      })

    expect(withdraw.status).toEqual(201);
    expect(withdraw.body.description).toEqual('test withdraw');
    expect(withdraw.body.type).toEqual('withdraw');
    expect(withdraw.body.amount).toEqual(50);
    expect(withdraw.body).toHaveProperty('created_at')
    expect(withdraw.body).toHaveProperty('updated_at')
  });

  it('should not be possible to make a withdrawal if there are no funds enough', async () => {
    const session = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      });

    const withdraw = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 1000,
        description: 'test withdraw'
      })
      .set({
        authorization: `Bearer ${session.body.token}`
      })

    expect(withdraw.status).toEqual(400);
    expect(withdraw.body).toHaveProperty('message')
    expect(withdraw.body.message).toEqual('Insufficient funds')
  })
});
