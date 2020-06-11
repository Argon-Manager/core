import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindConditions, In, Repository } from 'typeorm'
import { ProjectInput } from '../app/generated'
import { UsersService } from '../users'
import ProjectToUserEntity from './project-to-user.entity'
import ProjectEntity from './project.entity'

@Injectable()
export default class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity) private projectRepository: Repository<ProjectEntity>,
    @InjectRepository(ProjectToUserEntity)
    private projectToUserRepository: Repository<ProjectToUserEntity>,
    private usersService: UsersService
  ) {}

  async create({ userIds, ...data }: Omit<ProjectInput, 'userIds'> & { userIds: number[] }) {
    const project = await this.projectRepository.save(this.projectRepository.create(data))

    await this.addUsersToProject({ projectId: project.id, userIds: userIds })

    return project
  }

  async findById(id: number) {
    return this.projectRepository.findOne({ id })
  }

  async findMany({ userIds }: { userIds?: number[] } = {}) {
    const where: FindConditions<ProjectEntity> = {}

    if (userIds) {
      const projectsToUsers = await this.projectToUserRepository.find({
        where: { userId: In(userIds) },
      })
      const projectIds = projectsToUsers.map(({ projectId }) => projectId)

      if (projectIds.length) {
        where.id = In(projectIds)
      }
    }

    return this.projectRepository.find({ where })
  }

  async updateById(
    id: number,
    { userIds, ...data }: Omit<ProjectInput, 'userIds'> & { userIds: number[] }
  ) {
    const project = await this.projectRepository.save(
      this.projectRepository.create({ id, ...data })
    )

    await this.projectToUserRepository.delete({ projectId: id })
    await this.addUsersToProject({ userIds, projectId: id })

    return project
  }

  async addUsersToProject({ userIds, projectId }: { userIds: number[]; projectId: number }) {
    return this.projectToUserRepository.save(
      userIds.map((userId) =>
        this.projectToUserRepository.create({
          userId,
          projectId,
        })
      )
    )
  }

  async getUsersByProjectId(id: number) {
    const projectsToUsers = await this.projectToUserRepository.find({ where: { projectId: id } })
    const userIds = projectsToUsers.map(({ userId }) => userId)

    return this.usersService.find({ userIds })
  }

  async deleteById(id: number) {
    const { affected } = await this.projectRepository.softDelete({ id })
    return affected
  }

  async includesUser({ projectId, userId }: { projectId: number; userId: number }) {
    const project = await this.findById(projectId)
    const users = await this.getUsersByProjectId(projectId)

    return project && users.find(({ id }) => id === userId)
  }
}
