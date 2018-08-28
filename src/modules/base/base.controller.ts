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
  UseGuards,
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
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { ApiException } from '@models/api-exception.model';
import { getOperationId } from '@utils/get-operation-id';
import { BaseService } from './base.service';
import { Base } from './base.entity';
import { AuthGuard } from '@nestjs/passport';
import { ConditionalDecorator } from '@utils/conditional-decorator';
import { IAuthGuards } from '@modules/base/base.interface';

const defaultAuthObj = {
  root: false,
  getById: false,
  create: false,
  update: false,
  delete: false
};

export function getBaseController<T>(
  TypeClass: { new(): T },
  TypeCreateVM: { new(): any },
  TypeUpdateVM: { new(): any },
  TypeFindVM: { new(): any },
  authObj: IAuthGuards = defaultAuthObj
) {
  const auth = {
    ...defaultAuthObj,
    ...authObj
  };
  
  @ApiUseTags(TypeClass.name)
  abstract class BaseController {
    protected readonly service: BaseService<T>;

    constructor(service: BaseService<T>) {
      this.service = service;
    }
  
    @Get()
    @ConditionalDecorator(auth.root, UseGuards(AuthGuard('jwt')))
    @ConditionalDecorator(auth.root, ApiBearerAuth())
    @ApiImplicitQuery({
      name: 'filter',
      description: 'TypeORM find query',
      required: false,
      isArray: false
    })
    @ApiOkResponse({
      type: TypeFindVM,
      isArray: true
    })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Find'))  
    public async root(@Query('filter') filter = {}): Promise<T[] | Partial<T[]>> {
      try {
        const data = await this.service.find(filter);
        const mapped = [];

        data.forEach(async (v: T) => {
          mapped.push(await this.service.map(v));
        });
        
        return mapped;

      } catch(e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Get(':id')
    @ConditionalDecorator(auth.getById, UseGuards(AuthGuard('jwt')))
    @ConditionalDecorator(auth.getById, ApiBearerAuth())
    @ApiImplicitParam({
      name: 'id',
      description: 'The ID of the entity to find',
      required: true
    })
    @ApiOkResponse({ type: TypeFindVM })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'FindById'))  
    public async getById(@Param('id') id: string | number): Promise<T | Partial<T>> {
      try {
        return this.service.map(await this.service.findById(id));
      } catch(e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Post()
    @ConditionalDecorator(auth.create, UseGuards(AuthGuard('jwt')))
    @ConditionalDecorator(auth.create, ApiBearerAuth())
    @ApiImplicitBody({
      name: TypeCreateVM.name,
      type: TypeCreateVM,
      description: 'Data for entity creation',
      required: true,
      isArray: false
    })
    @ApiCreatedResponse({ type: TypeClass })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Create'))
    public async create(@Body() body): Promise<T | Partial<T>> {
      try {
        return this.service.map(await this.service.create(body));
      } catch(e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Put()
    @ConditionalDecorator(auth.update, UseGuards(AuthGuard('jwt')))
    @ConditionalDecorator(auth.update, ApiBearerAuth())
    @ApiImplicitBody({
      name: TypeUpdateVM.name,
      type: TypeUpdateVM,
      description: 'Data for entity update',
      required: true,
      isArray: false
    })
    @ApiOkResponse({ type: TypeClass })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Update'))
    public update(@Body() body: { id: string | number } & T): Promise<UpdateResult> {
      return this.service.update(body.id, body);
    }
  
    @Delete(':id')
    @ConditionalDecorator(auth.delete, UseGuards(AuthGuard('jwt')))
    @ConditionalDecorator(auth.delete, ApiBearerAuth())
    @ApiImplicitParam({
      name: 'id',
      description: 'The ID of the entity to delete',
      required: true
    })
    @ApiOkResponse({ type: TypeClass })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Delete'))  
    public delete(@Param('id') id: string | number) {
      try {
        return this.service.delete(id);
      } catch(e) {
        throw new InternalServerErrorException(e);
      }
    }
  }

  return BaseController;
}
