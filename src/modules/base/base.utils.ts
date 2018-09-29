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
};

export const getAuthObj = (authObj: IDefaultAuthObj | boolean): IDefaultAuthObj => {
  let auth = null;

  if (authObj === true) {
    auth = defaultAuthObj;
  } else if (authObj === false) {
    auth = {
      root: false,
      getById: false,
      create: false,
      update: false,
      updateOrCreate: false,
      delete: false,
      count: false,
    };
  } else {
    auth = {
      ...defaultAuthObj,
      ...authObj,
    };
  }

  return auth;
};
