import { toTitleCase } from './to-title-case';

export interface IOperationID {
  title: string;
  operationId: string;
}

export const getOperationId = (model: string, operation: string, title: string = ''): IOperationID => {
  const modelFormated = toTitleCase(model).replace(/\s/g, '');
  const operationFormated = toTitleCase(operation).replace(/\s/g, '');

  return {
    title,
    operationId: `${modelFormated}_${operationFormated}`,
  };
};
