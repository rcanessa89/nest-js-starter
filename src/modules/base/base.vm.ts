import { ApiModelProperty } from '@nestjs/swagger';

export abstract class BaseVM {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty({ type: String, format: 'date-time' })
  createdAt: string;

  @ApiModelProperty({ type: String, format: 'date-time' })
  updatedAt: string;  
}