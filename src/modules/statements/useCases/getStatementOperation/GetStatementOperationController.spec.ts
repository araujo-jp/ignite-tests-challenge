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
describe('Get statement operation controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  });

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  });

  it('should be able to get a statement operation', async () => {
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

    const statement = await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'deposit test'
      })
      .set({ authorization: `Bearer ${session.body.token}`, })

    const response = await request(app)
      .get(`/api/v1/statements/${statement.body.id}`)
      .set({ authorization: `Bearer ${session.body.token}`, })

    expect(response.status).toEqual(200)
    expect(response.body.user_id).toEqual(session.body.user.id)
    expect(response.body.statement_id).toEqual(statement.body.statement_id)
  })
})
