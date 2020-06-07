import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { getConnection } from 'typeorm'
import { AppModule } from '../src/app'
import { MutationCreateTaskArgs, TaskInput } from '../src/app/generated'
import AuthService from '../src/auth/auth.service'
import ProjectsService from '../src/projects/projects.service'
import { UsersService } from '../src/users'
import { usersMock } from '../src/users/test'

describe('Tasks (e2e)', () => {
  let app: INestApplication

  let usersService: UsersService
  let authService: AuthService
  let projectsService: ProjectsService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    usersService = moduleRef.get(UsersService)
    authService = moduleRef.get(AuthService)
    projectsService = moduleRef.get(ProjectsService)
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

  describe('Mutation: createTask', () => {
    test('return new task', async () => {
      const user = await usersService.create(usersMock[0])

      const project = await projectsService.create({
        name: 'Project',
        userIds: [user.id],
      })

      const taskInput: TaskInput = { name: 'Create App Layout', projectId: project.id.toString() }
      const variables: MutationCreateTaskArgs = { input: taskInput }

      const token = authService.createToken(user.id)
      const { body } = await request(app.getHttpServer())
        .post('/')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          variables,
          query: `
          mutation CreateTask($input: TaskInput!) {
            createTask(input: $input) {
              id
              name
              description
              assignedId
              assigned {
                id
                email
              }
            }
          }
        `,
        })

      expect(body.errors).toBeUndefined()
      expect(body.data.createTask).toBeDefined()
      expect(body.data.createTask).toEqual({
        id: expect.any(String),
        name: taskInput.name,
        description: taskInput.description ?? null,
        assigned: taskInput.assignedId ?? null,
        assignedId: taskInput.assignedId ?? null,
      })
    })
  })
})
