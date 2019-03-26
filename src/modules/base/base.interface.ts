import {
  FindConditions,
  FindManyOptions,
  UpdateResult,
  DeleteResult,
} from 'typeorm';

export interface IBaseService<T> {
  find: (f: FindManyOptions<T> & FindConditions<T>) => Promise<T[]>;
  findById: (i: string | number) => Promise<T>;
  findAndCount: (ps: number, pn: number, filter: FindManyOptions<T>) => Promise<IFindAndCountResult<T>>;
  create: (i: any) => Promise<T>;
  update: (id: string | number, i: any) => Promise<UpdateResult>;
  delete: (i: string | number) => Promise<DeleteResult>;
  count: () => Promise<number>;
  map<K = any>(o: Partial<T> | Partial<T>[], s: string, d: string): Promise<any>;
}

export interface IDefaultAuthObj {
  root?: boolean;
  getById?: boolean;
  create?: boolean;
  updateOrCreate?: boolean;
  update?: boolean;
  delete?: boolean;
  count?: boolean;
  pagination?: boolean;
}

export interface IBaseControllerFactoryOpts<T> {
  entity: { new(): T };
  entityVm: { new(): any };
  entityCreateVm?: { new(): any };
  entityUpdateVm?: { new(): any };
  auth?: IDefaultAuthObj | boolean;
}

export interface IFindAndCountResult<T> {
  data: Partial<T>[];
  count: number;
  total: number;
}
export interface IPaginationQuery {
  pageSize: number;
  pageNumber: number;
  filter: string;
}

export interface IBaseServiceCache {
  find: boolean;
  findById: boolean;
  findOne: boolean;
  findAndCount: boolean;
}

export interface IBaseServiceOptions {
  cache?: IBaseServiceCache | boolean;
  mapping?: (config: AutoMapperJs.ICreateMapFluentFunctions) => void;
}
