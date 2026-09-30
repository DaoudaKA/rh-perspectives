import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { BaseDeDonneesModule } from './base-de-donnees/base-de-donnees.module';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module';
import { AuthentificationModule } from './authentification/authentification.module';
import { JwtAuthGarde } from './commun/gardes/jwt-auth.garde';
import { RolesGarde } from './commun/gardes/roles.garde';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BaseDeDonneesModule,
    UtilisateursModule,
    AuthentificationModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGarde }, // 1) authentification
    { provide: APP_GUARD, useClass: RolesGarde },   // 2) rôles
  ],
})
export class AppModule {}