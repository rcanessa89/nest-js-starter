import 'automapper-ts/dist/automapper';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindConditions,
  DeleteResult,
  UpdateResult,
  FindManyOptions,
  FindOneOptions
} from 'typeorm';

import {
  IBaseService,
  IFindAndCountResult,
  IBaseServiceCache,
  IBaseServiceOptions
} from './base.interface';
import { MapperService } from '@services/mapper/mapper.service';

export abstract class BaseService<T> implements IBaseService<T> {
  public withMap: boolean;
  private readonly mapping: (config: AutoMapperJs.ICreateMapFluentFunctions) => void;
  private cache: IBaseServiceCache;
  protected readonly repository: Repository<T>;
  protected readonly mapper: AutoMapperJs.AutoMapper;

  constructor(
    repository: Repository<T>,
    options: IBaseServiceOptions = {}
  ) {
    this.repository = repository;
    this.withMap = !!options.mapping;
    this.mapping = options.mapping;
    this.mapper = automapper;

    this.cacheConfig(options.cache);

    if (this.withMap) {
      this.initializeMapper();
    }
  }

  public async find(filter: FindManyOptions<T> = {}): Promise<T[]> {
    return this.repository.find({ ...filter, cache: this.cache.find  });
  }

  public async findById(id: string | number): Promise<T> {
    const parsedId = Number(id);

    if (isNaN(parsedId)) {
      throw new HttpException('ID invalid', HttpStatus.BAD_REQUEST);
    }

    return this.repository.findOne(parsedId,{ cache: this.cache.findById });
  }

  public async findOne(conditions: FindConditions<T>, options: FindOneOptions<T> = {}): Promise<T> {
    return this.repository.findOne(conditions, { ...options, cache: this.cache.findOne });
  }

  public async findAndCount(pageSize: number = 30, pageNumber: number = 1, filter: FindManyOptions<T>): Promise<IFindAndCountResult<T>> {
    const skip = pageSize * (pageNumber - 1);

    const [ result, total ] = await this.repository.findAndCount({
      ...filter,
      cache: this.cache.findAndCount,
      take: pageSize,
      skip
    });

    return {
      data: result,
      count: result.length,
      total
    };
  }

  // item param type should be type T but there is an issue with third party library.
  public async create(item: any): Promise<T> {
    return this.repository.save(item);
  }

  // item param type should be type T but there is an issue with third party library.
  public async update(id: string | number, item: any): Promise<UpdateResult> {
    return this.repository.update(id, item);
  }

  public async delete(id: string | number): Promise<DeleteResult> {
    return this.repository.delete(id);
  }

  public async count(): Promise<number> {
    return this.repository.count();
  }

  public async map(object: T | Partial<T>): Promise<Partial<T>> {
    return this.mapper.map(this.modelName, this.viewModelName, object);
  }

  private get modelName(): string {
    const target: any = this.repository.target;

    return target.name;
  }

  private get viewModelName(): string {
    const modelName = this.modelName;

    return `${modelName}VM`;
  }

  private initializeMapper(): void {
    const createMapConfig = this.mapper
      .createMap(this.modelName, this.viewModelName);

    this.mapping(createMapConfig);
  }

  private cacheConfig(cache: IBaseServiceCache | boolean): void {
    if (!cache) {
      this.cache = {
        find: false,
        findById: false,
        findOne: false,
        findAndCount: false
      };
    }

    if (cache === true) {
      this.cache = {
        find: true,
        findById: true,
        findOne: true,
        findAndCount: true
      };
    }

    if (typeof cache === 'object') {
      this.cache = cache;
    }
  }
}
