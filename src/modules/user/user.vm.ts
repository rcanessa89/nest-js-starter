import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '@constants';

abstract class UserVMBase {
  @ApiModelProperty()
  @IsEmail()
  @IsNotEmpty()
  username: string;
}

export class UserFindVM extends UserVMBase {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  confirmed: boolean;

  @ApiModelProperty({ type: String, format: 'date-time' })
  createdAt: string;

  @ApiModelProperty({ type: String, format: 'date-time' })
  updatedAt: string;
}

export class UserCreateVM extends UserVMBase {
  @ApiModelProperty()
  @IsNotEmpty()
  @Matches(new RegExp(PASSWORD_REGEX), {
    message: 'Minimum 6 characters, at least one uppercase letter, one lowercase letter and one number',
  })
  password: string;
}

export class UserUpdateVM extends UserVMBase {
  @ApiModelProperty()
  @IsNotEmpty()
  id: number;

  @ApiModelProperty()
  @IsEmail()
  username: string;

  @ApiModelProperty()
  confirmed: boolean;
}

export class UserCredentialsVM {
  @ApiModelProperty()
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @Matches(new RegExp(PASSWORD_REGEX), {
    message: 'Minimum 6 characters, at least one uppercase letter, one lowercase letter and one number',
  })
  password: string;
}

export class UserLogedVM {
  @ApiModelProperty()
  token: string;

  @ApiModelProperty()
  user: UserFindVM;
}
