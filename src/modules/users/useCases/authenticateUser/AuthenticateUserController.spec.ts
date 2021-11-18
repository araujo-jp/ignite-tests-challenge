import { Connection } from 'typeorm'
import createConnection from '@database/index'
import request from 'supertest'
import { app } from '../../../../app'

let connection: Connection
describe('Authenticate user controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to authenticate user', async () => {
    const user = {
      name: 'John Doe',
      email: 'jonh.doe@email.com',
      password: 'p@ssw0rd'
    }

    await request(app)
      .post('/api/v1/users')
      .send(user)

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(response.body.user).toHaveProperty('id')
    expect(response.body.user.name).toEqual(user.name)
    expect(response.body.user.email).toEqual(user.email)
  })

  it('should not be to authenticate a user with an incorrect email', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'doe.jonh@email.com',
        password: 'p@ssw0rd'
      })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('message')
    expect(response.body.message).toEqual('Incorrect email or password')
  })

  it('should not be to authenticate a user with an incorrect password', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'jonh.doe@email.com',
        password: 'password'
      })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('message')
    expect(response.body.message).toEqual('Incorrect email or password')
  })
})
