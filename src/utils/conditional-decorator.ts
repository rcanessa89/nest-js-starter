export const ConditionalDecorator = (test: boolean, decorator: Function): Function => {
  return (target: Object, key: string | symbol, value: any): any => {
    if (test) {
      decorator(target, key, value);
    }
  }
};
