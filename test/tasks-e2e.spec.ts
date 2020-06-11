import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { getConnection } from 'typeorm'
import { AppModule } from '../src/app'
import { MutationCreateTaskArgs, QueryTasksArgs, TaskInput } from '../src/app/generated'
import { AuthService } from '../src/auth'
import { ProjectsService } from '../src/projects'
import { projectsMock } from '../src/projects/test'
import { TasksService } from '../src/tasks'
import { tasksMock } from '../src/tasks/test'
import { UsersService } from '../src/users'
import { usersMock } from '../src/users/test'

describe('Tasks (e2e)', () => {
  let app: INestApplication

  let usersService: UsersService
  let authService: AuthService
  let projectsService: ProjectsService
  let tasksService: TasksService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    usersService = moduleRef.get(UsersService)
    authService = moduleRef.get(AuthService)
    projectsService = moduleRef.get(ProjectsService)
    tasksService = moduleRef.get(TasksService)
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
      const assigned = await usersService.create(usersMock[1])

      const project = await projectsService.create({
        ...projectsMock[0],
        userIds: [user.id, assigned.id],
      })

      const taskInput: TaskInput = {
        ...tasksMock[0],
        projectId: project.id.toString(),
        assignedId: assigned.id.toString(),
      }
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
        description: taskInput.description,
        assigned: {
          id: assigned.id.toString(),
          email: assigned.email,
        },
        assignedId: taskInput.assignedId,
      })
    })
  })

  describe('Query: tasks', () => {
    test('return tasks by projectId', async () => {
      const user = await usersService.create(usersMock[0])

      const project = await projectsService.create({
        ...projectsMock[0],
        userIds: [user.id],
      })
      const secondProject = await projectsService.create({
        ...projectsMock[1],
        userIds: [user.id],
      })

      const tasks = [tasksMock[0], tasksMock[1]]
      await Promise.all(
        tasks.map((item) =>
          tasksService.create({
            ...item,
            projectId: project.id,
          })
        )
      )
      await Promise.all(
        [tasksMock[2], tasksMock[3]].map((item) =>
          tasksService.create({
            ...item,
            projectId: secondProject.id,
          })
        )
      )

      const variables: QueryTasksArgs = { projectId: project.id.toString() }

      const token = authService.createToken(user.id)
      const { body } = await request(app.getHttpServer())
        .post('/')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          variables,
          query: `
          query Tasks($projectId: ID!) {
            tasks (projectId: $projectId) {
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
      expect(body.data.tasks).toBeDefined()
      expect(body.data.tasks).toHaveLength(2)
      expect(body.data.tasks).toEqual(
        expect.arrayContaining(tasks.map((item) => expect.objectContaining(item)))
      )
    })
  })
})
