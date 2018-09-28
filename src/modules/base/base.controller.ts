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
  ApiModelProperty
} from '@nestjs/swagger';
import {
  UpdateResult,
  DeleteResult,
  FindManyOptions,
  FindConditions,
} from 'typeorm';
import { AuthGuard } from '@nestjs/passport';

import { ConditionalDecorator } from '@utils/conditional-decorator';;
import { AUTH_GUARD_TYPE } from '@constants';
import { ApiException } from '@models/api-exception.model';
import { getOperationId } from '@utils/get-operation-id';
import { filterMetadata } from '@utils/filter-metadata-factory';
import { BaseService } from './base.service';
import { BaseEntity } from './base.entity';
import { getAuthObj, defaultAuthObj } from './base.utils';
import { IDefaultAuthObj, IBaseControllerFactoryOpts } from './base.interface';

const metadataKey = 'swagger/apiModelPropertiesArray';
const excludedMetadata = [':id', ':createdAt', ':updatedAt'];

export function baseControllerFactory<T, C = Partial<T>, U = Partial<T>, F = Partial<T>> (
  options: IBaseControllerFactoryOpts<T>
) {
  const Entity = options.entity;
  const EntityVM = options.entityVm;
  const EntityCreateVM = options.entityCreateVm || filterMetadata(EntityVM, metadataKey, excludedMetadata);
  const EntityUpdateVM = options.entityUpdateVm || filterMetadata(EntityVM, metadataKey, excludedMetadata);
  const auth = getAuthObj(options.auth);

  @ApiUseTags(Entity.name)
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
      type: EntityVM,
      isArray: true,
    })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(Entity.name, 'Find'))
    public async root(@Query('filter') filter: string): Promise<T[] | Partial<T>[]> {
      try {
        const parsedFilter = filter ? JSON.parse(filter) : {};
        const dataPromise = this.service.find(parsedFilter);
        const data = await dataPromise;

        if (this.service.withMap) {
          const mappedDataPromise = Promise.all(data.map(item => this.service.map(item)));
          const mappedData = await mappedDataPromise;

          this.afterRoot(parsedFilter, data, mappedData);

          return mappedDataPromise;
        }

        this.afterRoot(parsedFilter, data);

        return dataPromise;
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Get('count')
    @ConditionalDecorator(auth.count, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.count, ApiBearerAuth())
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(Entity.name, 'Count'))
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
    @ApiOkResponse({ type: EntityVM })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(Entity.name, 'FindById'))
    public async getById(@Param('id') id: string | number): Promise<T | Partial<T>> {
      try {
        this.beforeGetById(id);

        const dataPromise = this.service.findById(id);
        const data = await dataPromise;

        if (this.service.withMap) {
          const mappedDataPromise = this.service.map(data);
          const mappedData = await mappedDataPromise;

          this.aftergetById(id, data, mappedData);

          return mappedDataPromise;
        }

        this.aftergetById(id, data);

        return dataPromise;
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Post()
    @ConditionalDecorator(auth.create, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.create, ApiBearerAuth())
    @ApiImplicitBody({
      name: EntityCreateVM.name,
      type: EntityCreateVM,
      description: 'Data for entity creation',
      required: true,
      isArray: false,
    })
    @ApiCreatedResponse({ type: EntityVM })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(Entity.name, 'Create'))
    public async create(@Body() body: C): Promise<T | Partial<T>> {
      try {
        this.beforeCreate(body);
        
        const dataPromise = this.service.create(body);
        const data = await dataPromise;

        if (this.service.withMap) {
          const mappedDataPromise = this.service.map(data);
          const mappedData = await mappedDataPromise;

          this.afterCreate(body, data, mappedData);

          return mappedDataPromise;
        }

        this.afterCreate(body, data);

        return dataPromise;
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Put()
    @ConditionalDecorator(auth.updateOrCreate, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.updateOrCreate, ApiBearerAuth())
    @ApiImplicitBody({
      name: EntityUpdateVM.name,
      type: EntityUpdateVM,
      description: 'Data for entity update or create',
      required: true,
      isArray: false,
    })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(Entity.name, 'UpdateOrCreate'))
    public async updateOrCreate(@Body() body: { id: string | number } & U): Promise<UpdateResult | T | Partial<T>> {
      const entity = await this.service.findById(body.id);

      if (!entity) {
        try {
          this.beforeUpdateOrCreate(body);
        
          const dataPromise = this.service.create(body);
          const data = await dataPromise;

          if (this.service.withMap) {
            const mappedDataPromise = this.service.map(data);
            const mappedData = await mappedDataPromise;

            this.afterUpdateOrCreate(body, data, mappedData);

            return mappedDataPromise;
          }

          this.afterUpdateOrCreate(body, data);

          return dataPromise;
        } catch (e) {
          throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }

      try {
        this.beforeUpdateOrCreate(body);

        const dataPromise = this.service.update(body.id, body);
        const data = await dataPromise;

        this.afterUpdateOrCreate(body, data);

        return dataPromise;
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Patch()
    @ConditionalDecorator(auth.update, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.update, ApiBearerAuth())
    @ApiImplicitBody({
      name: EntityUpdateVM.name,
      type: EntityUpdateVM,
      description: 'Data for entity update',
      required: true,
      isArray: false,
    })
    @ApiOkResponse({ type: Entity })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(Entity.name, 'Update'))
    public async update(@Body() body: { id: string | number } & U): Promise<UpdateResult> {
      try {
        this.beforeUpdate(body);
        
        const dataPromise = this.service.update(body.id, body);
        const data = await dataPromise;

        this.afterUpdate(body, data);

        return dataPromise;
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
    @ApiOperation(getOperationId(Entity.name, 'Delete'))
    public async delete(@Param('id') id: string | number): Promise<DeleteResult> {
      try {
        this.beforeDelete(id);

        const dataPromise = this.service.delete(id);
        const data = await dataPromise;

        this.afterDelete(id, data);

        return dataPromise;
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    }

    // Hooks
    protected beforeRoot(f: FindManyOptions<T> & FindConditions<T> = {}): void {}
    protected afterRoot(f: FindManyOptions<T> & FindConditions<T> = {}, d: T[], m?: Partial<T>[]): void {}

    protected beforeCount(): void {}
    protected afterCount(c: Promise<number>): void {}

    protected beforeGetById(i: string | number): void {}
    protected aftergetById(i: string | number, d: T, m?: Partial<T>): void {}

    protected beforeCreate(b: C): void {}
    protected afterCreate(b: C, d: T, m?: Partial<T>): void {}

    protected beforeUpdateOrCreate(b: { id: string | number } & U): void {}
    protected afterUpdateOrCreate(b: { id: string | number } & U, d: T | UpdateResult, m?: Partial<T> | UpdateResult): void {}

    protected beforeUpdate(b: { id: string | number } & U): void {}
    protected afterUpdate(b: { id: string | number } & U, d: UpdateResult): void {}

    protected beforeDelete(i: string | number): void {}
    protected afterDelete(i: string | number, d: DeleteResult): void {}
  }

  return BaseController;
}
