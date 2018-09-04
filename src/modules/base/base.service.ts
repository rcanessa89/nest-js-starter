import 'automapper-ts/dist/automapper';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindConditions, DeleteResult, UpdateResult } from 'typeorm';
import { IBaseService } from './base.interface';
import { MapperService } from '@services/mapper/mapper.service';
import 'automapper-ts/dist/automapper';

export abstract class BaseService<T> implements IBaseService<T> {
  protected readonly repository: Repository<T>;
  protected readonly mapper: AutoMapperJs.AutoMapper;

  constructor(repository: Repository<T>) {
    this.repository = repository;
    this.mapper = automapper;
    this.initializeMapper();
  }

  public async find(filter: FindManyOptions<T> & FindConditions<T> = {}): Promise<T[]> {
    return this.repository.find(filter);
  }

  public async findById(id: string | number): Promise<T> {
    const parsedId = Number(id);

    if (isNaN(parsedId)) {
      throw new HttpException('ID invalid', HttpStatus.BAD_REQUEST);
    }

    return this.repository.findOne(parsedId);
  }

  public async findOne(filter: FindConditions<T>): Promise<T> {
    return this.repository.findOne(filter);
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

  public async map<K>(
    object: Partial<T> | Partial<T>[],
    sourceKey: string = this.modelName,
    destinationKey: string = this.viewModelName,
  ): Promise<K> {
    return this.mapper.map(sourceKey, destinationKey, object);
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
    this.mapper.initialize(this.configureMapper);
  }

  protected abstract configureMapper(config: AutoMapperJs.IConfiguration): void;
}
