import 'reflect-metadata';

import { IDefaultAuthObj } from './base.interface';

export const defaultAuthObj: IDefaultAuthObj = {
  root: true,
  getById: true,
  create: true,
  update: true,
  updateOrCreate: true,
  delete: true,
  count: true,
  pagination: true,
};

export const getAuthObj = (
  authObj: IDefaultAuthObj | boolean,
): IDefaultAuthObj => {
  let auth = null;

  if (authObj === true) {
    auth = defaultAuthObj;
  } else if (!authObj) {
    auth = {
      root: false,
      getById: false,
      create: false,
      update: false,
      updateOrCreate: false,
      delete: false,
      count: false,
      pagination: false,
    };
  } else {
    auth = {
      ...defaultAuthObj,
      ...authObj,
    };
  }

  return auth;
};

export const formatEntityName = (entity: { new (): any }, create = true) => {
  if (create) {
    return entity.name.replace('VM', 'CreateVM');
  }

  return entity.name.replace('VM', 'UpdateVM');
};
