import {
  Body,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  NotFoundException,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateResult, DeleteResult } from 'typeorm';
import { ApiException } from '@models/api-exception.model';
import { getOperationId } from '@utils/get-operation-id';
import { BaseService } from './base.service';
import { Base } from './base.entity';
import { AuthGuard } from '@nestjs/passport';
import { ConditionalDecorator } from '@utils/conditional-decorator';
import { DefaultAuthObj } from '@modules/base/base.interface';
import { AUTH_GUARD_TYPE } from '@constants';

const defaultAuthObj: DefaultAuthObj = {
  root: true,
  getById: true,
  create: true,
  update: true,
  updateOrCreate: true,
  delete: true,
  count: true,
};

export function baseControllerFactory<T>(
  TypeClass: { new(): T },
  TypeCreateVM: { new(): any } = TypeClass,
  TypeUpdateVM: { new(): any } = TypeClass,
  TypeFindVM: { new(): any } = TypeClass,
  authObj: DefaultAuthObj | boolean = defaultAuthObj,
) {
  let auth = null;

  if (authObj === true) {
    auth = defaultAuthObj;
  } else if (authObj === false) {
    auth = {
      root: false,
      getById: false,
      create: false,
      update: false,
      updateOrCreate: false,
      delete: false,
      count: false,
    };
  } else {
    auth = {
      ...defaultAuthObj,
      ...authObj as DefaultAuthObj,
    };
  }

  @ApiUseTags(TypeClass.name)
  abstract class BaseController {
    protected readonly service: BaseService<T>;

    constructor(service: BaseService<T>) {
      this.service = service;
    }

    @Get()
    @ConditionalDecorator(auth.root, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.root, ApiBearerAuth())
    @ApiImplicitQuery({
      name: 'filter',
      description: 'TypeORM find query',
      required: false,
      isArray: false,
    })
    @ApiOkResponse({
      type: TypeFindVM,
      isArray: true,
    })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Find'))
    public async root(@Query('filter') filter): Promise<T[] | Partial<T[]>> {
      const parsedFilter = filter ? JSON.parse(filter) : {};

      try {
        this.beforeRoot(parsedFilter);

        const data = await this.service.find(parsedFilter);
        const mapped = [];

        data.forEach(async (v: T) => {
          mapped.push(await this.service.map(v));
        });

        this.afterRoot(mapped);

        return mapped;
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Get('count')
    @ConditionalDecorator(auth.count, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.count, ApiBearerAuth())
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Count'))
    public count(): Promise<number> {
      try {
        this.beforeCount();

        const count = this.service.count();

        this.afterCount(count);

        return count;
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Get(':id')
    @ConditionalDecorator(auth.getById, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.getById, ApiBearerAuth())
    @ApiImplicitParam({
      name: 'id',
      description: 'The ID of the entity to find',
      required: true,
    })
    @ApiOkResponse({ type: TypeFindVM })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'FindById'))
    public async getById(@Param('id') id: string | number): Promise<T | Partial<T>> {
      try {
        this.beforeGetById(id);

        const data = this.service.map(await this.service.findById(id));

        this.aftergetById(data);

        return data;
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Post()
    @ConditionalDecorator(auth.create, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.create, ApiBearerAuth())
    @ApiImplicitBody({
      name: TypeCreateVM.name,
      type: TypeCreateVM,
      description: 'Data for entity creation',
      required: true,
      isArray: false,
    })
    @ApiCreatedResponse({ type: TypeClass })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Create'))
    public async create(@Body() body: any): Promise<T | Partial<T>> {
      try {
        await this.beforeCreate(body);

        const data = this.service.map(await this.service.create(body));

        this.afterCreate(data);

        return data;
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Put()
    @ConditionalDecorator(auth.updateOrCreate, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.updateOrCreate, ApiBearerAuth())
    @ApiImplicitBody({
      name: TypeUpdateVM.name,
      type: TypeUpdateVM,
      description: 'Data for entity update or create',
      required: true,
      isArray: false,
    })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'UpdateOrCreate'))
    public async updateOrCreate(@Body() body: { id: string | number } & T): Promise<UpdateResult | T | Partial<T>> {
      const entity = await this.service.findById(body.id);

      if (!entity) {
        try {
          this.beforeUpdateOrCreate(body);

          const data = this.service.map<T>(await this.service.create(body));

          this.afterUpdateOrCreate(data);

          return data;
        } catch (e) {
          throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }

      try {
        return this.service.update(body.id, body);
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Patch()
    @ConditionalDecorator(auth.update, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.update, ApiBearerAuth())
    @ApiImplicitBody({
      name: TypeUpdateVM.name,
      type: TypeUpdateVM,
      description: 'Data for entity update',
      required: true,
      isArray: false,
    })
    @ApiOkResponse({ type: TypeClass })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Update'))
    public update(@Body() body: { id: string | number } & T): Promise<UpdateResult> {
      try {
        this.beforeUpdate(body);

        const data = this.service.update(body.id, body);

        this.afterUpdate(data);

        return data;
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Delete(':id')
    @ConditionalDecorator(auth.delete, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.delete, ApiBearerAuth())
    @ApiImplicitParam({
      name: 'id',
      description: 'The ID of the entity to delete',
      required: true,
    })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Delete'))
    public delete(@Param('id') id: string | number): Promise<DeleteResult> {
      try {
        this.beforeDelete(id);

        const data = this.service.delete(id);

        this.afterDelete(data);

        return data;
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    }

    // Hooks
    protected beforeRoot(f: any): void {}
    protected afterRoot(d: T[] | Partial<T[]>): void {}
    protected beforeCount(): void {}
    protected afterCount(c: Promise<number>): void {}
    protected beforeGetById(i: string | number): void {}
    protected aftergetById(d: Promise<T | Partial<T>>): void {}
    protected beforeCreate(b: any): void {}
    protected afterCreate(d: Promise<T | Partial<T>>): void {}
    protected beforeUpdateOrCreate(b: { id: string | number } & T): void {}
    protected afterUpdateOrCreate(d: Promise<UpdateResult | T | Partial<T>>): void {}
    protected beforeUpdate(b: { id: string | number } & T): void {}
    protected afterUpdate(d: Promise<UpdateResult>): void {}
    protected beforeDelete(i: string | number): void {}
    protected afterDelete(d: Promise<DeleteResult>): void {}
  }

  return BaseController;
}
