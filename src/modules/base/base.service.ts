import 'automapper-ts/dist/automapper';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindConditions, DeleteResult, UpdateResult } from 'typeorm';
import { IBaseService } from './base.interface';

export abstract class BaseService<T> implements IBaseService<T> {
  protected readonly repository: Repository<T>;
  protected readonly mapper: AutoMapperJs.AutoMapper;

  constructor(repository: Repository<T>) {
    this.repository = repository;
    // this.mapper = mapper;
  }

  public async find(filter: FindManyOptions<T> & FindConditions<T>  = {}): Promise<T[]> {
    return this.repository.find(filter);
  }

  public async findById(id: string | number): Promise<T> {
    return this.repository.findOne(id);
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

  protected async map<K>(
    object: Partial<T> | Partial<T>[],
    sourceKey: string = this.modelName,
    destinationKey: string = this.viewModelName,
  ): Promise<K> {
    return this.mapper.map(sourceKey, destinationKey, object);
  }

  private get modelName(): string {
    if (typeof this.repository.target === 'string') {
      return this.repository.target;
    } else {
      return this.repository.target();
    }
  }

  private get viewModelName(): string {
    const modelName = this.modelName;

    return `${modelName}Vm`;
  }
}
