import 'reflect-metadata';

export const filterMetadata = (
  TypeClass: { new(): any },
  metadataKey: string,
  excludedValues: string[],
) => {
  class CloneTypeClass extends TypeClass {}

  const metadata: string[] = Reflect.getMetadata(metadataKey, CloneTypeClass.prototype) || [];
  const metadataFiltered = metadata.filter(item => excludedValues.indexOf(item) === -1);

  Reflect.defineMetadata(metadataKey, metadataFiltered, CloneTypeClass.prototype);

  return CloneTypeClass;
};
