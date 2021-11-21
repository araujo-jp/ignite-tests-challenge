import { OperationType } from '@modules/statements/entities/Statement'
import { InMemoryStatementsRepository } from '@modules/statements/repositories/in-memory/InMemoryStatementsRepository'
import { InMemoryUsersRepository } from '@modules/users/repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '@modules/users/useCases/createUser/CreateUserUseCase'
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase'
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase'

let createUserCase: CreateUserUseCase
let inMemoryUserRepository: InMemoryUsersRepository

let createStatementUseCase: CreateStatementUseCase
let inMemoryStatementRepository: InMemoryStatementsRepository

let getStatementOperationUseCase: GetStatementOperationUseCase


const user = {
  name: 'John Doe',
  email: 'jonh.doe@email.com',
  password: 'p@ssw0rd'
}

describe('Get statement operation', () => {
  beforeEach(async () => {inMemoryUserRepository = new InMemoryUsersRepository()
    createUserCase = new CreateUserUseCase(inMemoryUserRepository)

    inMemoryStatementRepository =  new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUserRepository,
      inMemoryStatementRepository
    )

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUserRepository,
      inMemoryStatementRepository
    )
  })

  it('should be able to get statement type', async () => {
    const userTest = await createUserCase.execute(user)

    const statement = await createStatementUseCase.execute({
      user_id: userTest.id,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: 'test deposit'
    })

    const getStatement = await getStatementOperationUseCase.execute({
      user_id: userTest.id,
      statement_id: statement.id
    })

    expect(getStatement.id).toEqual(statement.id)
    expect(getStatement.user_id).toEqual(userTest.id)
    expect(getStatement.amount).toEqual(statement.amount)
    expect(getStatement.type).toEqual(statement.type)
    expect(getStatement.description).toEqual(statement.description)
  })
})
