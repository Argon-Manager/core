import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindConditions, In, Repository } from 'typeorm'
import { WorkspaceInput } from '../app/generated'
import { UsersService } from '../users'
import WorkspaceToUserEntity from './workspace-to-user.entity'
import WorkspaceEntity from './workspace.entity'

@Injectable()
export default class WorkspacesService {
  constructor(
    @InjectRepository(WorkspaceEntity) private workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(WorkspaceToUserEntity)
    private workspaceToUserRepository: Repository<WorkspaceToUserEntity>,
    private usersService: UsersService
  ) {}

  async create({
    userIds,
    ...data
  }: Omit<WorkspaceInput, 'userIds' | 'projectId'> & { userIds: number[]; projectId: number }) {
    const workspace = await this.workspaceRepository.save(this.workspaceRepository.create(data))

    await this.addUsersToWorkspace({ userIds, workspaceId: workspace.id })

    return workspace
  }

  async findMany({ userIds, projectId }: { userIds?: number[]; projectId?: number }) {
    const where: FindConditions<WorkspaceEntity> = {}

    if (userIds) {
      const workspacesToUsers = await this.workspaceToUserRepository.find({
        where: { userId: In(userIds) },
      })
      const workspaceIds = workspacesToUsers.map(({ workspaceId }) => workspaceId)

      if (workspaceIds.length) {
        where.id = In(workspaceIds)
      }
    }

    if (projectId) {
      where.projectId = projectId
    }

    return this.workspaceRepository.find({ where })
  }

  async findById(id: number) {
    return this.workspaceRepository.findOne({ id })
  }

  async addUsersToWorkspace({ userIds, workspaceId }: { userIds: number[]; workspaceId: number }) {
    return this.workspaceToUserRepository.save(
      userIds.map((userId) =>
        this.workspaceToUserRepository.create({
          userId,
          workspaceId,
        })
      )
    )
  }

  async getUsersByWorkspaceId(id: number) {
    const workspacesToUsers = await this.workspaceToUserRepository.find({
      where: { workspaceId: id },
    })
    const userIds = workspacesToUsers.map(({ userId }) => userId)

    return this.usersService.find({ userIds })
  }
}
