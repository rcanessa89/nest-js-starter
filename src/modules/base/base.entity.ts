import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';

export abstract class Base {
  @PrimaryGeneratedColumn()
  @ApiModelProperty()
  id?: number;

  @CreateDateColumn()
  @ApiModelProperty({ type: String, format: 'date-time' })
  createdAt?: string;

  @UpdateDateColumn()
  @ApiModelProperty({ type: String, format: 'date-time' })
  updatedAt?: string;
}
