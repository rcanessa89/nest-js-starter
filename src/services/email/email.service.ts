import { Injectable, Inject } from '@nestjs/common';
import { MailerProvider } from '@nest-modules/mailer/dist/mailer.provider';
import { getEnvConfig } from '@utils/get-env-config';
import { Configuration } from '@enums/configuration';

const htmlDefault = '<div>Email text</div>';

@Injectable()
export class EmailService {
  constructor(
    @Inject('MailerProvider') private readonly mailerProvider: MailerProvider,
  ) {}

  private fromEmail: string = getEnvConfig(Configuration.FROM_EMAIL);

  public send(to: string, subject: string, html: string = htmlDefault, context: any = {}): Promise<any> {
    return this.mailerProvider.sendMail({
      to,
      from: this.fromEmail,
      html,
      context,
    });
  }
}
