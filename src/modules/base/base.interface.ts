import {
  FindConditions,
  FindManyOptions,
  UpdateResult,
  DeleteResult,
} from 'typeorm';

export interface IBaseService<T> {
  find: (f: FindManyOptions<T> & FindConditions<T>) => Promise<T[]>;
  findById: (i: string | number) => Promise<T>;
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
}

export interface IBaseControllerFactoryOpts<T> {
  entity: { new(): T };
  entityVm: { new(): any };
  entityCreateVm?: { new(): any };
  entityUpdateVm?: { new(): any };
  auth: IDefaultAuthObj | boolean;
}
