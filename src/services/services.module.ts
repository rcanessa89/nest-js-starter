import { Module, Global } from '@nestjs/common';
import { MapperService } from './mapper/mapper.service';
import { EmailService } from './email/email.service';

@Global()
@Module({
  providers: [
    MapperService,
    EmailService,
  ],
  exports: [
    MapperService,
    EmailService,
  ],
})
export class ServicesModule {}
