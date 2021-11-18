import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from './CreateUserError';
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create a new user', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository
    )
  })

  it('should be able to create a new user', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'jonh.doe@email.com',
      password: 'p@ssw0rd'
    }

    const response = await createUserUseCase.execute({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password
    })

    expect(response).toHaveProperty('id')
    expect(response).toHaveProperty('name')
    expect(response).toHaveProperty('email')
    expect(response).toHaveProperty('password')
  })

  it('should not be able to create a user with already existing email', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'jonh.doe@email.com',
        password: 'p@ssw0rd'
      })

      await createUserUseCase.execute({
        name: 'Jane Doe',
        email: 'jonh.doe@email.com',
        password: 'p@ssw0rd'
      })
    }).rejects.toBeInstanceOf(CreateUserError)

  })
})
