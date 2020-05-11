import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { getConnection } from 'typeorm'
import { AppModule } from '../src/app'
import { AuthService } from '../src/auth'
import { usersMock } from '../src/users/test/users.mock'
import { UsersService } from '../src/users'

describe('Auth Module (e2e)', () => {
  let app: INestApplication

  let usersService: UsersService
  let authService: AuthService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    usersService = moduleRef.get(UsersService)
    authService = moduleRef.get(AuthService)
  })

  beforeEach(async () => {
    await getConnection().synchronize(true)
  })

  afterEach(async () => {
    await getConnection().dropDatabase()
  })

  afterAll(async () => {
    await getConnection().dropDatabase()
    await getConnection().close()
  })

  test('register: return new user with token', async () => {
    const [userData] = usersMock
    const { body } = await request(app.getHttpServer())
      .post('/')
      .send({
        variables: { input: userData },
        query: `
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              user {
                id
                email
              }
              token
            }
          }
        `,
      })

    expect(body.errors).toBeUndefined()
    expect(body.data.register).toBeDefined()
    expect(body.data.register).toEqual({
      user: {
        id: expect.any(String),
        email: userData.email,
      },
      token: expect.any(String),
    })
  })

  test('login: return user with token', async () => {
    const [userData] = usersMock
    const user = await usersService.create(userData)

    const { body } = await request(app.getHttpServer())
      .post('/')
      .send({
        variables: { input: userData },
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              user {
                id
                email
              }
              token
            }
          }
        `,
      })

    expect(body.errors).toBeUndefined()
    expect(body.data.login).toBeDefined()
    expect(body.data.login).toEqual({
      user: {
        id: user.id.toString(),
        email: userData.email,
      },
      token: expect.any(String),
    })
  })

  test('me: return auth user by token', async () => {
    const [userData] = usersMock
    const user = await usersService.create(userData)
    const token = authService.createToken(user.id)

    const { body } = await request(app.getHttpServer())
      .post('/')
      .set({ Authorization: `Bearer ${token}` })
      .send({
        query: `
          query Me {
            me {
              id
              email
            }
          }
        `,
      })

    expect(body.errors).toBeUndefined()
    expect(body.data.me).toBeDefined()
    expect(body.data.me).toEqual({
      id: user.id.toString(),
      email: userData.email,
    })
  })
})
