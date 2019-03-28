import 'reflect-metadata';

export const filterMetadata = (
  TypeClass: { new (): any },
  metadataKey: string,
  excludedValues: string[],
  name?: string,
) => {
  class CloneTypeClass extends TypeClass {}

  const metadata: string[] =
    Reflect.getMetadata(metadataKey, CloneTypeClass.prototype) || [];
  const metadataFiltered = metadata.filter(
    item => excludedValues.indexOf(item) === -1,
  );
  const className: string = name ? name : TypeClass.name;

  Reflect.defineMetadata(
    metadataKey,
    metadataFiltered,
    CloneTypeClass.prototype,
  );

  Object.defineProperty(CloneTypeClass, 'name', {
    value: className,
  });

  return CloneTypeClass;
};
