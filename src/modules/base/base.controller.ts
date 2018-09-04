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
import { UpdateResult } from 'typeorm';
import { ApiException } from '@models/api-exception.model';
import { getOperationId } from '@utils/get-operation-id';
import { BaseService } from './base.service';
import { Base } from './base.entity';
import { AuthGuard } from '@nestjs/passport';
import { ConditionalDecorator } from '@utils/conditional-decorator';
import { IAuthGuards } from '@modules/base/base.interface';

const defaultAuthObj = {
  root: true,
  getById: true,
  create: true,
  update: true,
  updateOrCreate: true,
  delete: true,
  count: true,
};

const authGuardType = 'jwt';

export function baseControllerFactory<T>(
  TypeClass: { new(): T },
  TypeCreateVM: { new(): any },
  TypeUpdateVM: { new(): any },
  TypeFindVM: { new(): any },
  authObj: IAuthGuards = defaultAuthObj,
) {
  const auth = {
    ...defaultAuthObj,
    ...authObj,
  };

  @ApiUseTags(TypeClass.name)
  abstract class BaseController {
    protected readonly service: BaseService<T>;

    constructor(service: BaseService<T>) {
      this.service = service;
    }

    @Get()
    @ConditionalDecorator(auth.root, UseGuards(AuthGuard(authGuardType)))
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
    public async root(@Query('filter') filter = {}): Promise<T[] | Partial<T[]>> {
      try {
        const data = await this.service.find(filter);
        const mapped = [];

        data.forEach(async (v: T) => {
          mapped.push(await this.service.map(v));
        });

        return mapped;
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Get('count')
    @ConditionalDecorator(auth.count, UseGuards(AuthGuard(authGuardType)))
    @ConditionalDecorator(auth.count, ApiBearerAuth())
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Count'))
    public count() {
      try {
        return this.service.count();
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Get(':id')
    @ConditionalDecorator(auth.getById, UseGuards(AuthGuard(authGuardType)))
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
        return this.service.map(await this.service.findById(id));
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Post()
    @ConditionalDecorator(auth.create, UseGuards(AuthGuard(authGuardType)))
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
    public async create(@Body() body): Promise<T | Partial<T>> {
      try {
        return this.service.map(await this.service.create(body));
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Put()
    @ConditionalDecorator(auth.updateOrCreate, UseGuards(AuthGuard(authGuardType)))
    @ConditionalDecorator(auth.updateOrCreate, ApiBearerAuth())
    @ApiImplicitBody({
      name: TypeUpdateVM.name,
      type: TypeUpdateVM,
      description: 'Data for entity update or create',
      required: true,
      isArray: false,
    })
    @ApiOkResponse({ type: TypeClass })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'UpdateOrCreate'))
    public async updateOrCreate(@Body() body: { id: string | number } & T): Promise<UpdateResult | T | Partial<T>> {
      const entity = await this.service.findById(body.id);

      if (!entity) {
        try {
          return this.service.map<T>(await this.service.create(body));
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
    @ConditionalDecorator(auth.update, UseGuards(AuthGuard(authGuardType)))
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
        return this.service.update(body.id, body);
      } catch (e) {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Delete(':id')
    @ConditionalDecorator(auth.delete, UseGuards(AuthGuard(authGuardType)))
    @ConditionalDecorator(auth.delete, ApiBearerAuth())
    @ApiImplicitParam({
      name: 'id',
      description: 'The ID of the entity to delete',
      required: true,
    })
    @ApiOkResponse({ type: TypeClass })
    @ApiBadRequestResponse({ type: ApiException })
    @ApiOperation(getOperationId(TypeClass.name, 'Delete'))
    public delete(@Param('id') id: string | number) {
      try {
        return this.service.delete(id);
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    }
  }

  return BaseController;
}
