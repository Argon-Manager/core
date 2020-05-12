import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { getConnection } from 'typeorm'
import { AppModule } from '../src/app'
import {
  MutationCreateProjectArgs,
  MutationUpdateProjectArgs,
  ProjectInput,
  QueryProjectArgs,
} from '../src/app/generated'
import { AuthService } from '../src/auth'
import ProjectsService from '../src/projects/projects.service'
import { projectsMock } from '../src/projects/test'
import { UsersService } from '../src/users'
import { usersMock } from '../src/users/test'

describe('Project (e2e)', () => {
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

  test('createProject: return new project', async () => {
    const user = await usersService.create(usersMock[0])
    const friend = await usersService.create(usersMock[1])
    const token = authService.createToken(user.id)

    const projectInput: ProjectInput = { ...projectsMock[0], userIds: [friend.id.toString()] }
    const variables: MutationCreateProjectArgs = { input: projectInput }

    const { body } = await request(app.getHttpServer())
      .post('/')
      .set({ Authorization: `Bearer ${token}` })
      .send({
        variables,
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
      name: projectInput.name,
      description: projectInput.description,
      users: [
        { id: user.id.toString(), email: user.email },
        { id: friend.id.toString(), email: friend.email },
      ],
    })
  })

  test('updateProject: return updated project', async () => {
    const user = await usersService.create(usersMock[0])
    const friend = await usersService.create(usersMock[1])
    const token = authService.createToken(user.id)

    const project = await projectsService.create({ ...projectsMock[0], userIds: [user.id] })

    const projectInput: ProjectInput = { ...projectsMock[1], userIds: [friend.id.toString()] }
    const variables: MutationUpdateProjectArgs = { id: project.id.toString(), input: projectInput }

    const { body } = await request(app.getHttpServer())
      .post('/')
      .set({ Authorization: `Bearer ${token}` })
      .send({
        variables,
        query: `
          mutation UpdateProject($id: ID!, $input: ProjectInput!) {
            updateProject(id: $id, input: $input) {
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
    expect(body.data.updateProject).toBeDefined()
    expect(body.data.updateProject).toEqual({
      id: project.id.toString(),
      name: projectInput.name,
      description: projectInput.description,
      users: [
        { id: user.id.toString(), email: user.email },
        { id: friend.id.toString(), email: friend.email },
      ],
    })
  })

  test('project: return project', async () => {
    const user = await usersService.create(usersMock[0])
    const token = authService.createToken(user.id)
    const project = await projectsService.create({
      ...projectsMock[0],
      userIds: [user.id],
    })

    const variables: QueryProjectArgs = { id: project.id.toString() }

    const { body } = await request(app.getHttpServer())
      .post('/')
      .set({ Authorization: `Bearer ${token}` })
      .send({
        variables,
        query: `
          query Project($id: ID!) {
            project(id: $id) {
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
    expect(body.data.project).toBeDefined()
    expect(body.data.project).toEqual({
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      users: [{ id: user.id.toString(), email: user.email }],
    })
  })

  test('project: return null if user not in the team', async () => {
    const user = await usersService.create(usersMock[0])
    const project = await projectsService.create({
      ...projectsMock[0],
      userIds: [user.id],
    })

    const notTeamUser = await usersService.create(usersMock[1])
    const token = authService.createToken(notTeamUser.id)

    const variables: QueryProjectArgs = { id: project.id.toString() }

    const { body } = await request(app.getHttpServer())
      .post('/')
      .set({ Authorization: `Bearer ${token}` })
      .send({
        variables,
        query: `
          query Project($id: ID!) {
            project(id: $id) {
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
    expect(body.data.project).toEqual(null)
  })
})
