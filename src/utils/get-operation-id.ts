import { ToTitleCase } from './to-title-case';

export interface IOperationID {
  title: string;
  operationId: string;
};

export const getOperationId = (model: string, operation: string): IOperationID => {
  const modelFormated = ToTitleCase(model).replace(/\s/g, '');
  const operationFormated = ToTitleCase(operation).replace(/\s/g, '');

  return {
    title: '',
    operationId: `${modelFormated}_${operationFormated}`,
  };
};
