import { OperationType } from '@modules/statements/entities/Statement'

import { InMemoryStatementsRepository } from '@modules/statements/repositories/in-memory/InMemoryStatementsRepository'
import { InMemoryUsersRepository } from '@modules/users/repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from '@modules/users/useCases/createUser/CreateUserUseCase'
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase'
import { GetBalanceUseCase } from './GetBalanceUseCase'


let createUserCase: CreateUserUseCase
let inMemoryUserRepository: InMemoryUsersRepository

let createStatementUseCase: CreateStatementUseCase
let inMemoryStatementRepository: InMemoryStatementsRepository

let getBalanceUseCase: GetBalanceUseCase


const user = {
  name: 'John Doe',
  email: 'jonh.doe@email.com',
  password: 'p@ssw0rd'
}

describe('Get balance', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository()
    createUserCase = new CreateUserUseCase(inMemoryUserRepository)

    inMemoryStatementRepository =  new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUserRepository,
      inMemoryStatementRepository
    )

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementRepository,
      inMemoryUserRepository
    )
  })

  it('should be able list all deposits withdrawals and balance', async () => {
    const userTest = await createUserCase.execute(user)

    await createStatementUseCase.execute({
      user_id: userTest.id,
      description: 'Deposit test',
      type: OperationType.DEPOSIT,
      amount: 100
    })

    await createStatementUseCase.execute({
      user_id: userTest.id,
      description: 'Deposit test',
      type: OperationType.WITHDRAW,
      amount: 50
    })

    const balance = await getBalanceUseCase.execute({
      user_id: userTest.id
    })

    expect(balance).toHaveProperty('statement')
    expect(balance.statement[1]).toHaveProperty('id')
    expect(balance.statement[1].user_id).toEqual(userTest.id)
    expect(balance.balance).toEqual(50)
  })
})
