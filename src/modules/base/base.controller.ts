/* tslint:disable:no-string-literal */
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
  Response,
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
import {
  UpdateResult,
  DeleteResult,
  FindManyOptions,
  FindConditions,
} from 'typeorm';
import { AuthGuard } from '@nestjs/passport';

import { ConditionalDecorator } from '@utils/conditional-decorator';
import { AUTH_GUARD_TYPE } from '@constants';
import { ApiException } from '@models/api-exception.model';
import { getOperationId } from '@utils/get-operation-id';
import { filterMetadata } from '@utils/filter-metadata-factory';
import { BaseService } from './base.service';
import { getAuthObj, defaultAuthObj, formatEntityName } from './base.utils';
import {
  IDefaultAuthObj,
  IBaseControllerFactoryOpts,
  IPaginationQuery,
  IFindAndCountResult,
} from './base.interface';

const metadataKey = 'swagger/apiModelPropertiesArray';
const excludedCreateMetadata = [':id', ':createdAt', ':updatedAt'];
const excludedUpdateMetadata = [':createdAt', ':updatedAt'];

export function baseControllerFactory<T>(
  options: IBaseControllerFactoryOpts<T>,
) {
  const Entity = options.entity;
  const EntityVM = options.entityVm;
  const createEntityName: string = options.entityCreateVm
    ? options.entityCreateVm.name
    : formatEntityName(EntityVM);
  const updateEntityName: string = options.entityUpdateVm
    ? options.entityUpdateVm.name
    : formatEntityName(EntityVM, false);
  const EntityCreateVM =
    options.entityCreateVm ||
    filterMetadata(
      EntityVM,
      metadataKey,
      excludedCreateMetadata,
      createEntityName,
    );
  const EntityUpdateVM =
    options.entityUpdateVm ||
    filterMetadata(
      EntityVM,
      metadataKey,
      excludedUpdateMetadata,
      updateEntityName,
    );
  const auth = getAuthObj(options.auth);

  class EntityCreateVMT extends EntityCreateVM {}
  class EntityUpdateVMT extends EntityUpdateVM {}

  Object.defineProperty(EntityCreateVMT, 'name', {
    value: EntityCreateVM.name,
  });
  Object.defineProperty(EntityUpdateVMT, 'name', {
    value: EntityUpdateVM.name,
  });

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
    public async root(@Query('filter') filter: string, @Response() response) {
      const parsedFilter = filter ? JSON.parse(filter) : {};

      if (this['beforeRoot']) {
        await this['beforeRoot'](parsedFilter);
      }

      try {
        const data = await this.service.find(parsedFilter);

        if (this.service.withMap) {
          const mappedData = await Promise.all(
            data.map(item => this.service.map(item)),
          );

          response.send(mappedData);

          if (this['afterRoot']) {
            this['afterRoot'](parsedFilter, data, mappedData);
          }
        } else {
          response.send(data);

          if (this['afterRoot']) {
            this['afterRoot'](parsedFilter, data);
          }
        }
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Get('count')
    @ConditionalDecorator(auth.count, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.count, ApiBearerAuth())
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(Entity.name, 'Count'))
    public async count(@Response() response) {
      try {
        if (this['beforeCount']) {
          await this['beforeCount']();
        }

        const count = await this.service.count();

        response.send({ count });

        if (this['afterCount']) {
          this['afterCount'](count);
        }
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Get('pagination')
    @ConditionalDecorator(
      auth.pagination,
      UseGuards(AuthGuard(AUTH_GUARD_TYPE)),
    )
    @ConditionalDecorator(auth.pagination, ApiBearerAuth())
    @ApiImplicitQuery({
      name: 'pageSize',
      description: 'Page size',
      required: false,
      isArray: false,
    })
    @ApiImplicitQuery({
      name: 'pageNumber',
      description: 'Page number',
      required: false,
      isArray: false,
    })
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
    public async pagination(
      @Query() query: IPaginationQuery,
      @Response() response,
    ) {
      try {
        const { pageSize, pageNumber, filter } = query;
        const parsedFilter = filter ? JSON.parse(filter) : {};
        const pasedQuery = {
          pageSize,
          pageNumber,
          filter: parsedFilter,
        };

        if (this['beforePagination']) {
          await this['beforePagination'](pasedQuery);
        }

        const data = await this.service.findAndCount(
          pageSize,
          pageNumber,
          parsedFilter,
        );

        if (this.service.withMap) {
          const mappedData = await Promise.all(
            data.data.map(item => this.service.map(item)),
          );

          response.send({
            data: mappedData,
            count: data.count,
            total: data.total,
          });

          if (this['afterPagination']) {
            this['afterPagination'](
              pasedQuery,
              { data: data.data, count: data.count, total: data.total },
              { data: mappedData, count: data.count, total: data.total },
            );
          }
        } else {
          response.send(data);

          if (this['afterPagination']) {
            this['afterPagination'](parsedFilter, data);
          }
        }
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
    public async getById(
      @Param('id') id: string | number,
      @Response() response,
    ) {
      try {
        if (this['beforeGetById']) {
          await this['beforeGetById'](id);
        }

        const data = await this.service.findById(id);

        if (this.service.withMap) {
          const mappedData = await this.service.map(data);

          response.send(mappedData);

          if (this['aftergetById']) {
            this['aftergetById'](id, data, mappedData);
          }
        } else {
          response.send(data);

          if (this['aftergetById']) {
            this['aftergetById'](id, data);
          }
        }
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Post()
    @ConditionalDecorator(auth.create, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.create, ApiBearerAuth())
    @ApiImplicitBody({
      name: EntityCreateVM.name,
      type: EntityCreateVMT,
      description: 'Data for entity creation',
      required: true,
      isArray: false,
    })
    @ApiCreatedResponse({ type: EntityVM })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(Entity.name, 'Create'))
    public async create(@Body() body: EntityCreateVMT, @Response() response) {
      try {
        if (this['beforeCreate']) {
          await this['beforeCreate'](body);
        }

        const data = await this.service.create(body);

        if (this.service.withMap) {
          const mappedData = await this.service.map(data);

          response.send(mappedData);

          if (this['afterCreate']) {
            this['afterCreate'](body, data, mappedData);
          }
        } else {
          response.send(data);

          if (this['afterCreate']) {
            this['afterCreate'](body, data);
          }
        }
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Put()
    @ConditionalDecorator(
      auth.updateOrCreate,
      UseGuards(AuthGuard(AUTH_GUARD_TYPE)),
    )
    @ConditionalDecorator(auth.updateOrCreate, ApiBearerAuth())
    @ApiImplicitBody({
      name: EntityUpdateVMT.name,
      type: EntityUpdateVMT,
      description: 'Data for entity update or create',
      required: true,
      isArray: false,
    })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(Entity.name, 'UpdateOrCreate'))
    public async updateOrCreate(
      @Body() body: EntityUpdateVMT,
      @Response() response,
    ) {
      const entity = await this.service.findById(body.id);

      if (!entity) {
        try {
          if (this['beforeUpdateOrCreate']) {
            await this['beforeUpdateOrCreate'](body);
          }

          const data = await this.service.create(body);

          if (this.service.withMap) {
            const mappedData = await this.service.map(data);

            response.send(mappedData);

            if (this['afterUpdateOrCreate']) {
              this['afterUpdateOrCreate'](body, data, mappedData);
            }
          } else {
            response.send(data);

            if (this['afterUpdateOrCreate']) {
              this['afterUpdateOrCreate'](body, data);
            }
          }
        } catch (e) {
          throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        try {
          if (this['beforeUpdateOrCreate']) {
            await this['beforeUpdateOrCreate'](body);
          }

          const data = await this.service.update(body.id, body);

          response.send(data);

          if (this['afterUpdateOrCreate']) {
            this['afterUpdateOrCreate'](body, data);
          }
        } catch (e) {
          throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }

    @Patch()
    @ConditionalDecorator(auth.update, UseGuards(AuthGuard(AUTH_GUARD_TYPE)))
    @ConditionalDecorator(auth.update, ApiBearerAuth())
    @ApiImplicitBody({
      name: EntityUpdateVMT.name,
      type: EntityUpdateVMT,
      description: 'Data for entity update',
      required: true,
      isArray: false,
    })
    @ApiOkResponse({ type: EntityVM })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(Entity.name, 'Update'))
    public async update(@Body() body: EntityUpdateVMT, @Response() response) {
      try {
        if (this['beforeUpdate']) {
          await this['beforeUpdate'](body);
        }

        const data = await this.service.update(body.id, body);

        response.send(data);

        if (this['afterUpdate']) {
          this['afterUpdate'](body, data);
        }
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
    public async delete(
      @Param('id') id: string | number,
      @Response() response,
    ) {
      try {
        if (this['beforeDelete']) {
          await this['beforeDelete'](id);
        }

        const data = await this.service.delete(id);

        response.send(data);

        if (this['afterDelete']) {
          this['afterDelete'](id, data);
        }
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    }
  }

  return BaseController;
}
