import { ApiModelProperty } from '@nestjs/swagger';

export class TodoCreateVM {
  @ApiModelProperty()
  description: string;
}

export class TodoUpdateVM {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  isComplete: boolean;
}
