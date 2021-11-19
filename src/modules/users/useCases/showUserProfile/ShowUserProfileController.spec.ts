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

  it('should not be able to return the profile if the user does not exist', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODg5Njc4OWItNzYxMy00MTRmLTg5ZWYtOWU1ZTYxZjk1NDUxIiwibmFtZSI6IkpvaG5Eb2UiLCJlbWFpbCI6ImpvbmguZG9lQGVtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJhJDA4JGpXSzJURmttVmd3a0E0d054TUVXUk84Ui90cWk1dEtKSVVudkVXSFZEZ3YzRVd4emhLTkZXIiwiY3JlYXRlZF9hdCI6IjIwMjEtMTEtMTlUMDU6MDU6MDUuNTEwWiIsInVwZGF0ZWRfYXQiOiIyMDIxLTExLTE5VDA1OjA1OjA1LjUxMFoifSwiaWF0IjoxNjM3MjgzOTQ0LCJleHAiOjE2MzczNzAzNDQsInN1YiI6Ijg4OTY3ODliLTc2MTMtNDE0Zi04OWVmLTllNWU2MWY5NTQ1MSJ9.PSjX5CXSC1wpq9_cEZXWVcS29Ky94J_iTzlyuQRX-C8'

      const response = await request(app)
      .get('/api/v1/profile')
      .set({
        authorization: `Bearer ${token}`,
      })

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toEqual('User not found')
  })
})
