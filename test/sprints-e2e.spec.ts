import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { getConnection } from 'typeorm'
import { AppModule } from '../src/app'
import { MutationCreateSprintArgs, SprintInput } from '../src/app/generated'
import { AuthService } from '../src/auth'
import { ProjectsService } from '../src/projects'
import { projectsMock } from '../src/projects/test'
import { sprintsMock } from '../src/sprints/test'
import { UsersService } from '../src/users'
import { usersMock } from '../src/users/test'

describe('Sprints (e2e)', () => {
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

  describe('Mutation: createSprint', () => {
    test('return new sprint', async () => {
      const user = await usersService.create(usersMock[0])

      const project = await projectsService.create({
        ...projectsMock[0],
        userIds: [user.id],
      })

      const input: SprintInput = {
        ...sprintsMock[0],
        projectId: project.id.toString(),
      }
      const variables: MutationCreateSprintArgs = { input }

      const token = authService.createToken(user.id)
      const { body } = await request(app.getHttpServer())
        .post('/')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          variables,
          query: `
          mutation CreateSprint($input: SprintInput!) {
            createSprint(input: $input) {
              id
              name
              active
              description
              projectId
              workspaceId
              project {
                id
                name  
              }
              users {
                id
                email
              }
              workspace {
                id
                name
              }
            }
          }
        `,
        })

      expect(body.errors).toBeUndefined()
      expect(body.data.createSprint).toBeDefined()
      expect(body.data.createSprint).toEqual({
        id: expect.any(String),
        name: input.name,
        description: input.description,
        active: input.active,
        project: {
          id: project.id.toString(),
          name: project.name,
        },
        workspaceId: null,
        workspace: null,
        projectId: input.projectId,
        users: [{ id: user.id.toString(), email: user.email }],
      })
    })
  })
})
