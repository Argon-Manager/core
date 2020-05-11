import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { getConnection } from 'typeorm'
import { AppModule } from '../src/app'
import { AuthService } from '../src/auth'
import { projectsMock } from '../src/projects/test'
import { UsersService } from '../src/users'
import { usersMock } from '../src/users/test'

describe('Project (e2e)', () => {
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

  test('createProject: return new project', async () => {
    const user = await usersService.create(usersMock[0])
    const token = authService.createToken(user.id)

    const [projectData] = projectsMock

    const { body } = await request(app.getHttpServer())
      .post('/')
      .set({ Authorization: `Bearer ${token}` })
      .send({
        variables: { input: projectData },
        query: `
          mutation CreateProject($input: ProjectInput!) {
            createProject(input: $input) {
              id
              name
              description
              users {
                id
                email
              }
            }
          }
        `,
      })

    expect(body.errors).toBeUndefined()
    expect(body.data.createProject).toBeDefined()
    expect(body.data.createProject).toEqual({
      id: expect.any(String),
      name: projectData.name,
      description: projectData.description,
      users: [{ id: user.id.toString(), email: user.email }],
    })
  })
})
