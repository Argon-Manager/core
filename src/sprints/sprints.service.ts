import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindConditions, Repository } from 'typeorm'
import { SprintInput } from '../app/generated'
import { UsersService } from '../users'
import SprintToUserEntity from './sprint-to-user.entity'
import SprintEntity from './sprint.entity'

@Injectable()
export default class SprintsService {
  constructor(
    @InjectRepository(SprintEntity) private sprintRepository: Repository<SprintEntity>,
    @InjectRepository(SprintToUserEntity)
    private sprintToUserRepository: Repository<SprintToUserEntity>,
    private usersService: UsersService
  ) {}

  async create({
    userIds,
    ...restData
  }: Omit<SprintInput, 'projectId' | 'workspaceId' | 'userIds'> & {
    projectId: number
    workspaceId?: number
    userIds: number[]
  }) {
    const sprint = await this.sprintRepository.save(restData)

    await this.addUsers({ userIds, sprintId: sprint.id })

    return sprint
  }

  findMany({ projectId }: { projectId?: number }) {
    const where: FindConditions<SprintEntity> = {}

    if (projectId) {
      where.projectId = projectId
    }

    return this.sprintRepository.find({ where })
  }

  findById(id: number) {
    return this.sprintRepository.findOne({ id })
  }

  async addUsers({ userIds, sprintId }: { userIds: number[]; sprintId: number }) {
    return this.sprintToUserRepository.save(
      userIds.map((userId) => ({
        userId,
        sprintId,
      }))
    )
  }

  async getUsersBySprintId(id: number) {
    const sprintsToUser = await this.sprintToUserRepository.find({ sprintId: id })
    const userIds = sprintsToUser.map(({ userId }) => userId)
    return this.usersService.find({ userIds })
  }
}
