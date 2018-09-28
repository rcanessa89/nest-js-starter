import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';

import { BaseEntity } from '@base/base.entity';

@Entity()
export class Todo extends BaseEntity {
  @Column()
  @ApiModelProperty()
  description: string;

  @Column({
    type: Boolean,
    default: false,
  })
  @ApiModelProperty()
  isComplete: boolean;
}
