import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindConditions, In, Repository } from 'typeorm'
import { TaskInput } from '../app/generated'
import TaskEntity from './task.entity'

@Injectable()
export default class TasksService {
  constructor(@InjectRepository(TaskEntity) private taskRepository: Repository<TaskEntity>) {}

  async create(
    data: Omit<TaskInput, 'assignedId' | 'projectId'> & { assignedId?: number; projectId: number }
  ) {
    return this.taskRepository.save(this.taskRepository.create(data))
  }

  async findMany({ projectIds }: { projectIds?: number[] } = {}) {
    const where: FindConditions<TaskEntity> = {}

    if (projectIds) {
      where.projectId = In(projectIds)
    }

    return this.taskRepository.find({ where })
  }
}
