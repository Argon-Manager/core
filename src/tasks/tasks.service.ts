import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TaskInput } from '../app/generated'
import TaskEntity from './task.entity'

@Injectable()
export default class TasksService {
  constructor(@InjectRepository(TaskEntity) private taskRepository: Repository<TaskEntity>) {}

  async create(data: Omit<TaskInput, 'assignedId'> & { assignedId?: number }) {
    return this.taskRepository.save(this.taskRepository.create(data))
  }
}
