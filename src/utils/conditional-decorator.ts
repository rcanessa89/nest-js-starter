type decoratorFunc = (target: object, key: string | symbol, value: any) => any;

export const ConditionalDecorator = (test: boolean, decorator: decoratorFunc): decoratorFunc => {
  return (target: object, key: string | symbol, value: any): any => {
    if (test) {
      decorator(target, key, value);
    }
  };
};
