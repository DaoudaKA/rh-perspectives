import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UtilisateursModule } from '../utilisateurs/utilisateurs.module';
import { AuthentificationController } from './authentification.controller';
import { AuthentificationService } from './authentification.service';
import { JwtStrategie } from './jwt.strategie';

@Module({
  imports: [
    UtilisateursModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '1d') as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthentificationController],
  providers: [AuthentificationService, JwtStrategie],
})
export class AuthentificationModule {}