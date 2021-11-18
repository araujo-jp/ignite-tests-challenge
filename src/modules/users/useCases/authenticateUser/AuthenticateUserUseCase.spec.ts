import { InMemoryUsersRepository } from '@modules/users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe('User authentication', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it('should be able to authenticate user', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'jonh.doe@email.com',
      password: 'p@ssw0rd'
    }

    await createUserUseCase.execute({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password
    })

    const session = await authenticateUserUseCase.execute({
      email: newUser.email,
      password: newUser.password
    })

    expect(session).toHaveProperty('token')
  })

  it('should not be to authenticate a user with an incorrect email', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'jonh.doe@email.com',
      password: 'p@ssw0rd'
    }

    await createUserUseCase.execute({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password
    })

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'doe.jonh@email.com',
        password: newUser.password
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it('should not be to authenticate a user with an incorrect password', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'jonh.doe@email.com',
      password: 'p@ssw0rd'
    }

    await createUserUseCase.execute({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password
    })

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'doe.jonh@email.com',
        password: newUser.password
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
