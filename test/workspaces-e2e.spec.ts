import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { getConnection } from 'typeorm'
import { AppModule } from '../src/app'
import { MutationCreateWorkspaceArgs, WorkspaceInput } from '../src/app/generated'
import { AuthService } from '../src/auth'
import { ProjectsService } from '../src/projects'
import { projectsMock } from '../src/projects/test'
import { UsersService } from '../src/users'
import { usersMock } from '../src/users/test'
import { workspacesMock } from '../src/workspaces/test'
import WorkspacesService from '../src/workspaces/workspaces.service'

describe('Workspaces (e2e)', () => {
  let app: INestApplication

  let usersService: UsersService
  let authService: AuthService
  let projectsService: ProjectsService
  let workspacesService: WorkspacesService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    usersService = moduleRef.get(UsersService)
    authService = moduleRef.get(AuthService)
    projectsService = moduleRef.get(ProjectsService)
    workspacesService = moduleRef.get(WorkspacesService)
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

  describe('Mutation: createWorkspace', () => {
    test('return new workspace', async () => {
      const user = await usersService.create(usersMock[0])

      const project = await projectsService.create({
        ...projectsMock[0],
        userIds: [user.id],
      })

      const input: WorkspaceInput = {
        ...workspacesMock[0],
        projectId: project.id.toString(),
      }
      const variables: MutationCreateWorkspaceArgs = { input }

      const token = authService.createToken(user.id)
      const { body } = await request(app.getHttpServer())
        .post('/')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          variables,
          query: `
          mutation CreateWorkspace($input: WorkspaceInput!) {
            createWorkspace(input: $input) {
              id
              name
              description
              projectId
              project {
                id
                name  
              }
              users {
                id
                email
              }
            }
          }
        `,
        })

      expect(body.errors).toBeUndefined()
      expect(body.data.createWorkspace).toBeDefined()
      expect(body.data.createWorkspace).toEqual({
        id: expect.any(String),
        name: input.name,
        description: input.description,
        project: {
          id: project.id.toString(),
          name: project.name,
        },
        projectId: input.projectId,
        users: [{ id: user.id.toString(), email: user.email }],
      })
    })
  })

  describe('Query: authUserWorkspaces', () => {
    test('return workspaces by auth user', async () => {
      const authUser = await usersService.create(usersMock[0])
      const authUserProject = await projectsService.create({
        ...projectsMock[0],
        userIds: [authUser.id],
      })
      const authUserProjectWorkspace = await workspacesService.create({
        ...workspacesMock[0],
        userIds: [authUser.id],
        projectId: authUserProject.id,
      })

      const secondUser = await usersService.create(usersMock[1])
      const secondUserProject = await projectsService.create({
        ...projectsMock[1],
        userIds: [secondUser.id],
      })
      const secondUserProjectWorkspace = await workspacesService.create({
        ...workspacesMock[1],
        userIds: [secondUser.id],
        projectId: secondUserProject.id,
      })

      const token = authService.createToken(authUser.id)
      const { body } = await request(app.getHttpServer())
        .post('/')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          query: `
          query AuthUserWorkspaces {
            authUserWorkspaces {
              id
              name
              description
              projectId
              project {
                id
                name  
              }
              users {
                id
                email
              }
            }
          }
        `,
        })

      expect(body.errors).toBeUndefined()
      expect(body.data.authUserWorkspaces).toBeDefined()
      expect(body.data.authUserWorkspaces).toHaveLength(1)
      expect(body.data.authUserWorkspaces).toEqual(
        expect.arrayContaining([
          {
            id: authUserProjectWorkspace.id.toString(),
            name: authUserProjectWorkspace.name,
            description: authUserProjectWorkspace.description,
            project: {
              id: authUserProject.id.toString(),
              name: authUserProject.name,
            },
            projectId: authUserProject.id.toString(),
            users: [{ id: authUser.id.toString(), email: authUser.email }],
          },
        ])
      )
    })
  })
})
