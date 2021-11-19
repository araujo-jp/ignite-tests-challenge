import { InMemoryStatementsRepository } from '@modules/statements/repositories/in-memory/InMemoryStatementsRepository'
import { InMemoryUsersRepository } from '@modules/users/repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '@modules/users/useCases/createUser/CreateUserUseCase'
import { OperationType } from "@modules/statements/entities/Statement"
import { CreateStatementUseCase } from './CreateStatementUseCase'
import { AppError } from '@shared/errors/AppError'

let inMemoryStatementsRepository: InMemoryStatementsRepository
let createStatementUseCase: CreateStatementUseCase
let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository

const user = {
  name: 'John Doe',
  email: 'jonh.doe@email.com',
  password: 'p@ssw0rd'
}

describe('Create statements', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it('should be able to create a deposit', async () => {
    const createUser = await createUserUseCase.execute(user)

    const { id } = createUser

    const statement = await createStatementUseCase.execute({
      user_id: id,
      amount: 100,
      description: 'statement test',
      type: OperationType.DEPOSIT
    })

    expect(statement).toHaveProperty('id')
    expect(statement).toHaveProperty('user_id')
    expect(statement.user_id).toEqual(id)
    expect(statement).toHaveProperty('amount')
    expect(statement.amount).toEqual(100)
    expect(statement).toHaveProperty('description')
    expect(statement.description).toEqual('statement test')
    expect(statement).toHaveProperty('type')
    expect(statement.type).toEqual('deposit')
  })

  it('should be able to create a withdraw', async () => {
    const createUser = await createUserUseCase.execute(user)

    const { id } = createUser

    await createStatementUseCase.execute({
      user_id: id,
      amount: 100,
      description: 'statement test',
      type: OperationType.DEPOSIT
    })

    const withdraw = await createStatementUseCase.execute({
      user_id: id,
      amount: 100,
      description: 'statement test',
      type: OperationType.WITHDRAW
    })

    expect(withdraw.type).toEqual('withdraw')
    expect(withdraw.amount).toEqual(100)
  })

  it('should not be possible to make a withdrawal if there are no funds enough', async () => {
    expect(async () => {
      const createUser = await createUserUseCase.execute(user)

      const { id } = createUser

      await createStatementUseCase.execute({
        user_id: id,
        amount: 50,
        description: 'statement test',
        type: OperationType.DEPOSIT
      })

      await createStatementUseCase.execute({
        user_id: id,
        amount: 100,
        description: 'statement test',
        type: OperationType.WITHDRAW
      })
    }).rejects.toBeInstanceOf(AppError)
  })
})
