import { Injectable } from '@nestjs/common';
import 'automapper-ts/dist/automapper';

@Injectable()
export class MapperService {
  mapper: AutoMapperJs.AutoMapper;

  constructor() {
    this.mapper = automapper;
    this.initializeMapper();
  }

  public async map<T>(
    object: Partial<T> | Partial<T>[],
    sourceKey: string,
    destinationKey: string,
  ): Promise<T> {
    return this.mapper.map(sourceKey, destinationKey, object);
  }

  private initializeMapper(): void {
    this.mapper.initialize(MapperService.configure);
  }

  private static configure(config: AutoMapperJs.IConfiguration): void {}
}