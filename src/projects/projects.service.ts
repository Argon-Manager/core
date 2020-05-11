import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProjectInput } from '../app/generated'
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

  async create({ userIds, ...data }: Omit<ProjectInput, 'userIds'> & { userIds?: number[] }) {
    const project = await this.projectRepository.save(this.projectRepository.create(data))

    await this.addUsersToProject({ projectId: project.id, userIds: userIds })
    // TODO: investigate how work 1)relation; 2)join

    return project
  }

  async addUsersToProject({ userIds, projectId }: { userIds: number[]; projectId: number }) {
    // TODO: replace by batch insert
    return this.projectToUserRepository.save(
      userIds.map((userId) =>
        this.projectToUserRepository.create({
          userId,
          projectId,
        })
      )
    )
  }

  async getProjectUsers({ projectId }: { projectId: number }) {
    const projectsToUsers = await this.projectToUserRepository.find({ where: { projectId } })
    const userIds = projectsToUsers.map(({ userId }) => userId)
    return this.usersService.find({ userIds })
  }
}
