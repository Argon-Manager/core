import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { getConnection } from 'typeorm'
import { AppModule } from '../src/app'
import {
  MutationCreateSprintArgs,
  QuerySprintArgs,
  QuerySprintsArgs,
  QueryWorkspacesArgs,
  SprintInput,
} from '../src/app/generated'
import { AuthService } from '../src/auth'
import { ProjectsService } from '../src/projects'
import { projectsMock } from '../src/projects/test'
import SprintsService from '../src/sprints/sprints.service'
import { sprintsMock } from '../src/sprints/test'
import { UsersService } from '../src/users'
import { usersMock } from '../src/users/test'
import { workspacesMock } from '../src/workspaces/test'
import WorkspacesService from '../src/workspaces/workspaces.service'

describe('Sprints (e2e)', () => {
  let app: INestApplication

  let usersService: UsersService
  let authService: AuthService
  let projectsService: ProjectsService
  let sprintsService: SprintsService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    usersService = moduleRef.get(UsersService)
    authService = moduleRef.get(AuthService)
    projectsService = moduleRef.get(ProjectsService)
    sprintsService = moduleRef.get(SprintsService)
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

  describe('Query: sprints', () => {
    test('return sprints by projectId', async () => {
      const authUser = await usersService.create(usersMock[0])
      const authUserProject = await projectsService.create({
        ...projectsMock[0],
        userIds: [authUser.id],
      })
      const authUserProjectSprint = await sprintsService.create({
        ...sprintsMock[0],
        projectId: authUserProject.id,
        userIds: [authUser.id],
      })

      const secondUser = await usersService.create(usersMock[1])
      const secondUserProject = await projectsService.create({
        ...projectsMock[1],
        userIds: [secondUser.id],
      })
      const secondUserProjectSprint = await sprintsService.create({
        ...sprintsMock[1],
        projectId: secondUserProject.id,
        userIds: [secondUser.id],
      })

      const variables: QuerySprintsArgs = { projectId: authUserProject.id.toString() }

      const token = authService.createToken(authUser.id)
      const { body } = await request(app.getHttpServer())
        .post('/')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          variables,
          query: `
          query Sprints($projectId: ID!) {
            sprints(projectId: $projectId) {
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
      expect(body.data.sprints).toBeDefined()
      expect(body.data.sprints).toHaveLength(1)
      expect(body.data.sprints).toEqual(
        expect.arrayContaining([
          {
            id: authUserProjectSprint.id.toString(),
            name: authUserProjectSprint.name,
            description: authUserProjectSprint.description,
            active: authUserProjectSprint.active,
            project: {
              id: authUserProject.id.toString(),
              name: authUserProject.name,
            },
            workspaceId: null,
            workspace: null,
            projectId: authUserProjectSprint.projectId.toString(),
            users: [{ id: authUser.id.toString(), email: authUser.email }],
          },
        ])
      )
    })
  })

  describe('Query: sprint', () => {
    test('return sprints by id', async () => {
      const user = await usersService.create(usersMock[0])
      const project = await projectsService.create({
        ...projectsMock[0],
        userIds: [user.id],
      })
      const sprint = await sprintsService.create({
        ...sprintsMock[0],
        projectId: project.id,
        userIds: [user.id],
      })

      const variables: QuerySprintArgs = { id: sprint.id.toString() }

      const token = authService.createToken(user.id)
      const { body } = await request(app.getHttpServer())
        .post('/')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          variables,
          query: `
          query Sprint($id: ID!) {
            sprint(id: $id) {
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
      expect(body.data.sprint).toBeDefined()
      expect(body.data.sprint).toEqual({
        id: sprint.id.toString(),
        name: sprint.name,
        description: sprint.description,
        active: sprint.active,
        project: {
          id: project.id.toString(),
          name: project.name,
        },
        workspaceId: null,
        workspace: null,
        projectId: sprint.projectId.toString(),
        users: [{ id: user.id.toString(), email: user.email }],
      })
    })
  })
})
