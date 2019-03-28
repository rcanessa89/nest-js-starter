import { ApiModelProperty } from '@nestjs/swagger';
import { BaseVM } from '@modules/base/base.vm';

export class TodoVM extends BaseVM {
  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  isComplete: boolean;
}
