import { Column, Entity } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';

import { BaseEntity } from '@modules/base/base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({
    unique: true,
  })
  username: string;

  @Column()
  password: string;

  @Column()
  confirmed: boolean = false;
}
