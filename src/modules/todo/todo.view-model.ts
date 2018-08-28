import { ApiModelProperty } from '@nestjs/swagger';

export class TodoFindVM {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  isComplete: boolean;

  @ApiModelProperty({ type: String, format: 'date-time' })
  createdAt: string;

  @ApiModelProperty({ type: String, format: 'date-time' })
  updatedAt: string;
}

export class TodoCreateVM {
  @ApiModelProperty()
  description: string;
}

export class TodoUpdateVM {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  description?: string;

  @ApiModelProperty()
  isComplete?: boolean;
}
