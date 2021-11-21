import { app } from '../../../../app'
import request from 'supertest'
import createConnection from '../../../../database'
import { Connection } from 'typeorm'

let connection: Connection

const user = {
  name: 'John Doe',
  email: 'jonh.doe@email.com',
  password: 'p@ssw0rd'
}

describe('Get balance controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to get all balances', async () => {
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

    const getBalance = await request(app)
      .get('/api/v1/statements/balance')
      .set({ authorization: `Bearer ${session.body.token}`, })

    expect(getBalance.body.balance).toEqual(100)
    expect(getBalance.body.statement.length).toEqual(1)
    expect(getBalance.body.statement[0]).toHaveProperty('id')
  })
})
