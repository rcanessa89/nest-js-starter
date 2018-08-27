import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { Base } from '@base/base.entity';

@Entity()
export class Todo extends Base {
  @Column()
  @ApiModelProperty()
  description: string;

  @Column({
    type: Boolean,
    default: false
  })
  @ApiModelProperty()
  isComplete: boolean;
}
