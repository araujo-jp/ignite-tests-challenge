import request from 'supertest'
import { Connection } from 'typeorm'
import { app } from '../../../../app'
import  createConnection  from '@database/index'

let connection: Connection

describe('Show user profile controller', () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to return user profile', async () => {
    const user = {
      name: 'John Doe',
      email: 'jonh.doe@email.com',
      password: 'p@ssw0rd'
    }

    await request(app)
      .post('/api/v1/users')
      .send(user);

    const userSession = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      })

    const { token } = userSession.body
    const { id, name, email } = userSession.body.user

    const profile = await request(app)
      .get('/api/v1/profile')
      .set({
        authorization: `Bearer ${token}`,
      })

    expect(profile.status).toBe(200)
    expect(profile.body).toHaveProperty('id')
    expect(profile.body.id).toEqual(id)
    expect(profile.body).toHaveProperty('name')
    expect(profile.body.name).toEqual(name)
    expect(profile.body).toHaveProperty('email')
    expect(profile.body.email).toEqual(email)
    expect(profile.body).toHaveProperty('created_at')
    expect(profile.body).toHaveProperty('updated_at')
  })
})
