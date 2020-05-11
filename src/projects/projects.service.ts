import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import UsersService from '../users/users.service'
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

  async create({ userIds, ...data }: { [key: string]: any }) {
    const project = await this.projectRepository.save(this.projectRepository.create(data))

    await this.addUsersToProject({ projectId: project.id, userIds })

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

  async getProjectUsers({ projectId }) {
    const projectsToUsers = await this.projectToUserRepository.find({ where: { projectId } })
    const userIds = projectsToUsers.map(({ userId }) => userId)
    return this.usersService.find({ userIds })
  }
}
