import { app } from '../../../../app'
import request from 'supertest'
import  createConnection  from '@database/index'
import { Connection } from 'typeorm'

let connection: Connection

describe('Create user controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to create a new user', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'jonh.doe@email.com',
      password: 'p@ssw0rd'
    }

    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password
      })

    expect(response.status).toBe(201)
  })
})
