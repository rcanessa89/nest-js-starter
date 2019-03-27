import { Module, Global } from '@nestjs/common';

import { MapperService } from './mapper/mapper.service';

@Global()
@Module({
  providers: [
    MapperService
  ],
  exports: [
    MapperService
  ],
})
export class ServicesModule {}
