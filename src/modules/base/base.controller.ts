import {
  Body,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiImplicitQuery,
  ApiImplicitParam,
  ApiImplicitBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { BaseService } from './base.service';
import { ApiException } from '@models/api-exception.model';
import { getOperationId } from '@utils/get-operation-id';

export abstract class BaseController<T> {
  protected readonly service: BaseService<T>;
  protected readonly typeClass: { new(): T };

  constructor(
    service: BaseService<T>,
    typeClass: { new(): T }
  ) {
    this.service = service;
    this.typeClass = typeClass;
  }

  @Get()
  @ApiImplicitQuery({
    name: 'filter',
    description: 'TypeORM find query',
    required: false,
    isArray: false
  })
  @ApiOkResponse({
    type: this.typeClass,
    isArray: true
  })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiOperation(getOperationId(this.service.modelName(), 'Find'))
  root(@Query('filter') filter = {}): Promise<T[]> {
    try {
      return this.service.find(filter);
    } catch(e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiImplicitParam({
    name: 'id',
    description: 'The ID of the entity to find',
    required: true
  })
  @ApiOkResponse({ type: this.typeClass })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiOperation(getOperationId(this.service.modelName(), 'Find'))
  @ApiOperation(getOperationId(this.service.modelName(), 'FindById'))
  getById(@Param('id') id: string | number): Promise<T> {
    try {
      return this.service.findById(id);
    } catch(e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @ApiImplicitBody({
    name: 'body',
    type: this.typeClass,
    description: 'Data for entity creation',
    required: true,
    isArray: false
  })
  @ApiCreatedResponse({ type: this.typeClass })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiOperation(getOperationId(this.service.modelName(), 'Create'))
  create(@Body() body: T): Promise<T> {
    try {
      return this.service.create(body);
    } catch(e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put()
  @ApiImplicitBody({
    name: 'body',
    type: this.typeClass,
    description: 'Data for entity update',
    required: true,
    isArray: false
  })
  @ApiOkResponse({ type: this.typeClass })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiOperation(getOperationId(this.service.modelName(), 'Update'))
  update(@Body() body: { id: string | number } & T): Promise<UpdateResult> {
    return this.service.update(body.id, body);
  }

  @Delete(':id')
  @ApiImplicitParam({
    name: 'id',
    description: 'The ID of the entity to delete',
    required: true
  })
  @ApiOkResponse({ type: this.typeClass })
  @ApiBadRequestResponse({ type: ApiException })
  @ApiOperation(getOperationId(this.service.modelName(), 'Delete'))
  delete(@Param('id') id: string | number) {
    try {
      return this.service.delete(id);
    } catch(e) {
      throw new InternalServerErrorException(e);
    }
  }
}