import { InMemoryUsersRepository } from '@modules/users/repositories/in-memory/InMemoryUsersRepository'
import { ShowUserProfileUseCase } from '@modules/users/useCases/showUserProfile/ShowUserProfileUseCase'
import { CreateUserUseCase } from '@modules/users/useCases/createUser/CreateUserUseCase'
import { AppError } from '@shared/errors/AppError'

let inMemoryUsersRepository: InMemoryUsersRepository
let showUserProfileUseCase: ShowUserProfileUseCase
let createUserUseCase: CreateUserUseCase

describe('Show user profile', () => {
  beforeAll(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
  })

  it('should be able to return user profile', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john.doe@email.com',
      password: 'P@ssw0rd'
    }

    const user = await createUserUseCase.execute(newUser)

    const response = await showUserProfileUseCase.execute(user.id)

    expect(response).toHaveProperty('id')
    expect(response.id).toEqual(user.id)
    expect(response).toHaveProperty('name')
    expect(response.name).toEqual(user.name)
    expect(response).toHaveProperty('email')
    expect(response.email).toEqual(user.email)
  })

  it('should not be able to return the profile if the user does not exist', async () => {
    expect(async () => {
      const id = '8896789b-7613-414f-89ef-9e5e61f95451'

      await showUserProfileUseCase.execute(id)
    }).rejects.toBeInstanceOf(AppError)
  })
})
