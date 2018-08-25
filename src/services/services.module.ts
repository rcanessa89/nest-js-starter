import { Module, Global } from '@nestjs/common';
import { ConfigurationService } from './configuration/configuration.service';
import { MapperService } from './mapper/mapper.service';
import { BaseService } from './base/base.service';

@Global()
@Module({
  providers: [ConfigurationService, MapperService, BaseService],
  exports: [ConfigurationService, MapperService],
})
export class ServicesModule {}
