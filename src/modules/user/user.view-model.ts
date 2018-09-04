import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

export class UserFindVM {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty({ type: String, format: 'date-time' })
  createdAt: string;

  @ApiModelProperty({ type: String, format: 'date-time' })
  updatedAt: string;
}

export class UserCreateVM {
  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  password: string;
}

export class UserUpdateVM {
  @ApiModelProperty()
  id: number;

  @ApiModelPropertyOptional()
  username?: string;

  @ApiModelProperty({ type: String, format: 'date-time' })
  createdAt: string;

  @ApiModelProperty({ type: String, format: 'date-time' })
  updatedAt: string;
}

export class UserCredentialsVM {
  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  password: string;
}

export class UserLogedVM {
  @ApiModelProperty()
  token: string;

  @ApiModelProperty()
  user: UserFindVM;
}
