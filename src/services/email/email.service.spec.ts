import { Test, TestingModule } from '@nestjs/testing';
import { SentMessageInfo, SendMailOptions } from 'nodemailer';

import { AppModule } from '../../app.module';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ AppModule ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should return a promise', async () => {
      const result = new Promise(resolve => resolve());
      const to = 'rcanessa89@hotmail.com';
      const subject = 'test';
      const expected = service.send(to, subject);

      jest.spyOn(service, 'send').mockImplementation(() => result);

      expect(expected).toBeInstanceOf(Promise);
    });
  });
});
