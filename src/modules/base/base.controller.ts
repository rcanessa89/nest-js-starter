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
import { UpdateResult, DeleteResult, FindManyOptions, FindConditions } from 'typeorm';
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

const getAuthObj = (authObj: DefaultAuthObj | boolean): DefaultAuthObj => {
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
      ...authObj,
    };
  }

  return auth;
};

export function baseControllerFactory<T, C = T, U = T, F = T>(
  TypeClass: { new(): T },
  TypeFindVM: { new(): any } = TypeClass,
  TypeCreateVM: { new(): any } = TypeClass,
  TypeUpdateVM: { new(): any } = TypeClass,
  authObj: DefaultAuthObj | boolean = defaultAuthObj,
) {
  let auth = getAuthObj(authObj);

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
    public async root(@Query('filter') filter): Promise<T[] | Partial<T>[]> {
      const parsedFilter = filter ? JSON.parse(filter) : {};

      try {
        this.beforeRoot(parsedFilter);

        const data = await this.service.find(parsedFilter);
        const dataPromise = Promise.all(data.map(item => this.service.map(item)));
        const mapped = await dataPromise;

        this.afterRoot(parsedFilter, mapped);

        return dataPromise;
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

        const data = await this.service.findById(id);
        const mappedPromise = this.service.map(data);
        const mapped = await mappedPromise;

        this.aftergetById(id, mapped);

        return mappedPromise;
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
    public async create(@Body() body: C): Promise<T | Partial<T>> {
      try {
        this.beforeCreate(body);

        const created = await this.service.create(body);
        const data = await this.service.map(created);

        this.afterCreate(body, created);

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
    public async updateOrCreate(@Body() body: { id: string | number } & U): Promise<UpdateResult | T | Partial<T>> {
      const entity = await this.service.findById(body.id);

      if (!entity) {
        try {
          this.beforeUpdateOrCreate(body);

          const created = await this.service.create(body);
          const data = this.service.map(created);

          this.afterUpdateOrCreate(body, created);

          return data;
        } catch (e) {
          throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }

      try {
        this.beforeUpdateOrCreate(body);

        const updatedPromise = this.service.update(body.id, body);
        const updated = await updatedPromise;

        this.afterUpdateOrCreate(body, updated);

        return updated;
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
    public async update(@Body() body: { id: string | number } & U): Promise<UpdateResult> {
      try {
        this.beforeUpdate(body);
        
        const updatedPromise = this.service.update(body.id, body);
        const updated = await updatedPromise;

        this.afterUpdate(body, updated);

        return updatedPromise;
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
    public async delete(@Param('id') id: string | number): Promise<DeleteResult> {
      try {
        this.beforeDelete(id);

        const deletedPromise = this.service.delete(id);
        const deleted = await deletedPromise;

        this.afterDelete(id, deleted);

        return deletedPromise;
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    }

    // Hooks
    protected beforeRoot(f: FindManyOptions<T> & FindConditions<T> = {}): void {}
    protected afterRoot(f: FindManyOptions<T> & FindConditions<T> = {}, d: T[] | Partial<T>[]): void {}

    protected beforeCount(): void {}
    protected afterCount(c: Promise<number>): void {}

    protected beforeGetById(i: string | number): void {}
    protected aftergetById(i: string | number, d: T | Partial<T>): void {}

    protected beforeCreate(b: C): void {}
    protected afterCreate(b: C, d: T): void {}

    protected beforeUpdateOrCreate(b: { id: string | number } & U): void {}
    protected afterUpdateOrCreate(b: { id: string | number } & U, d: T | UpdateResult): void {}

    protected beforeUpdate(b: { id: string | number } & U): void {}
    protected afterUpdate(b: { id: string | number } & U, d: UpdateResult): void {}

    protected beforeDelete(i: string | number): void {}
    protected afterDelete(i: string | number, d: DeleteResult): void {}
  }

  return BaseController;
}
