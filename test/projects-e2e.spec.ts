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

describe('Projects (e2e)', () => {
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

  describe('Mutation: createProject', () => {
    test('return new project', async () => {
      const user = await usersService.create(usersMock[0])
      const friend = await usersService.create(usersMock[1])

      const projectInput: ProjectInput = { ...projectsMock[0], userIds: [friend.id.toString()] }
      const variables: MutationCreateProjectArgs = { input: projectInput }

      const token = authService.createToken(user.id)
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
  })

  describe('Mutation: updateProject', () => {
    test('return updated project', async () => {
      const user = await usersService.create(usersMock[0])
      const friend = await usersService.create(usersMock[1])

      const project = await projectsService.create({ ...projectsMock[0], userIds: [user.id] })

      const projectInput: ProjectInput = { ...projectsMock[1], userIds: [friend.id.toString()] }
      const variables: MutationUpdateProjectArgs = {
        id: project.id.toString(),
        input: projectInput,
      }

      const token = authService.createToken(user.id)
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

    test('return null if user not in the  project', async () => {
      const user = await usersService.create(usersMock[0])
      const project = await projectsService.create({ ...projectsMock[0], userIds: [user.id] })

      const projectInput: ProjectInput = { ...projectsMock[1] }
      const variables: MutationUpdateProjectArgs = {
        id: project.id.toString(),
        input: projectInput,
      }

      const notTeamUser = await usersService.create(usersMock[1])
      const token = authService.createToken(notTeamUser.id)
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
      expect(body.data.updateProject).toBeNull()
    })
  })

  describe('Query: project', () => {
    test('return project', async () => {
      const user = await usersService.create(usersMock[0])
      const project = await projectsService.create({
        ...projectsMock[0],
        userIds: [user.id],
      })

      const variables: QueryProjectArgs = { id: project.id.toString() }

      const token = authService.createToken(user.id)
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

    test('return null if user not in the project', async () => {
      const user = await usersService.create(usersMock[0])
      const project = await projectsService.create({
        ...projectsMock[0],
        userIds: [user.id],
      })

      const notTeamUser = await usersService.create(usersMock[1])

      const variables: QueryProjectArgs = { id: project.id.toString() }

      const token = authService.createToken(notTeamUser.id)
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
      expect(body.data.project).toBeNull()
    })
  })

  describe('Query: authUserProjects return projects by auth user ', () => {
    test('return projects', async () => {
      const authUser = await usersService.create(usersMock[0])
      const project = await projectsService.create({
        ...projectsMock[0],
        userIds: [authUser.id],
      })

      const user = await usersService.create(usersMock[1])
      await projectsService.create({
        ...projectsMock[1],
        userIds: [user.id],
      })

      const token = authService.createToken(authUser.id)
      const { body } = await request(app.getHttpServer())
        .post('/')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          query: `
          query AuthUserProjects {
            authUserProjects {
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
      expect(body.data.authUserProjects).toBeDefined()
      expect(body.data.authUserProjects).toEqual([
        {
          id: project.id.toString(),
          name: project.name,
          description: project.description,
          users: [{ id: authUser.id.toString(), email: authUser.email }],
        },
      ])
    })
  })

  describe('Mutation: deleteProject', () => {
    test('return deleted projects count', async () => {
      const user = await usersService.create(usersMock[0])
      const project = await projectsService.create({
        ...projectsMock[0],
        userIds: [user.id],
      })
      await projectsService.create({
        ...projectsMock[1],
        userIds: [user.id],
      })

      const variables: QueryProjectArgs = { id: project.id.toString() }

      const token = authService.createToken(user.id)
      const { body } = await request(app.getHttpServer())
        .post('/')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          variables,
          query: `
          mutation DeleteProject($id: ID!) {
            deleteProject(id: $id)
          }
        `,
        })

      expect(body.errors).toBeUndefined()
      expect(body.data.deleteProject).toEqual(1)
    })

    test('return null if user not in the team', async () => {
      const user = await usersService.create(usersMock[0])
      const project = await projectsService.create({
        ...projectsMock[0],
        userIds: [user.id],
      })
      await projectsService.create({
        ...projectsMock[1],
        userIds: [user.id],
      })

      const notTeamUser = await usersService.create(usersMock[1])

      const variables: QueryProjectArgs = { id: project.id.toString() }

      const token = authService.createToken(notTeamUser.id)
      const { body } = await request(app.getHttpServer())
        .post('/')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          variables,
          query: `
          mutation DeleteProject($id: ID!) {
            deleteProject(id: $id)
          }
        `,
        })

      expect(body.errors).toBeUndefined()
      expect(body.data.deleteProject).toBeNull()
    })
  })
})
