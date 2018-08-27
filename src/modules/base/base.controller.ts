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
  ApiUseTags,
  ApiResponse
} from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { ApiException } from '@models/api-exception.model';
import { getOperationId } from '@utils/get-operation-id';
import { BaseService } from './base.service';
import { Base } from './base.entity';

export function getBaseController<T>(
  TypeClass: { new(): T },
  TypeCreateVM: { new(): any },
  TypeUpdateVM: { new(): any }
) {
  @ApiUseTags(TypeClass.name)
  abstract class BaseController {
    protected readonly service: BaseService<T>;

    constructor(service: BaseService<T>) {
      this.service = service;
    }
  
    @Get()
    @ApiImplicitQuery({
      name: 'filter',
      description: 'TypeORM find query',
      required: false,
      isArray: false
    })
    @ApiOkResponse({
      type: TypeClass,
      isArray: true
    })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Find'))  
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
    @ApiOkResponse({ type: TypeClass })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'FindById'))  
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
      type: TypeCreateVM,
      description: 'Data for entity creation',
      required: true,
      isArray: false
    })
    @ApiCreatedResponse({ type: TypeClass })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Create'))
    create(@Body() body): Promise<T> {
      try {
        return this.service.create(body);
      } catch(e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Put()
    @ApiImplicitBody({
      name: 'body',
      type: TypeUpdateVM,
      description: 'Data for entity update',
      required: true,
      isArray: false
    })
    @ApiOkResponse({ type: TypeClass })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Update'))
    update(@Body() body: { id: string | number } & T): Promise<UpdateResult> {
      return this.service.update(body.id, body);
    }
  
    @Delete(':id')
    @ApiImplicitParam({
      name: 'id',
      description: 'The ID of the entity to delete',
      required: true
    })
    @ApiOkResponse({ type: TypeClass })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Delete'))  
    delete(@Param('id') id: string | number) {
      try {
        return this.service.delete(id);
      } catch(e) {
        throw new InternalServerErrorException(e);
      }
    }
  }

  return BaseController;
}
