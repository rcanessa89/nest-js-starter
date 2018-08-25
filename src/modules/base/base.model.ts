import { FindConditions, FindManyOptions, UpdateResult, DeleteResult } from "typeorm";

export interface IBaseService<T> {
  find: (f: FindManyOptions<T> & FindConditions<T>) => Promise<T[]>;
  findById: (i: string | number) => Promise<T>;
  create: (i: any) => Promise<T>;
  update: (id: string | number, i: any) => Promise<UpdateResult>;
  delete: (i: string | number) => Promise<DeleteResult>;
};