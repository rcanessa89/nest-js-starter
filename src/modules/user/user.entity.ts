import { Base } from "@modules/base/base.entity";
import { Column, Entity } from "typeorm";
import { ApiModelProperty } from "@nestjs/swagger";

@Entity()
export class User extends Base {
  @Column({
    unique: true
  })
  @ApiModelProperty()
  username: string;

  @Column()
  @ApiModelProperty()
  password: string;
}
