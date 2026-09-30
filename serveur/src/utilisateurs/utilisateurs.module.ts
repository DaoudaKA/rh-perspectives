import { Module } from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service';

@Module({
  providers: [UtilisateursService],
  exports: [UtilisateursService],
})
export class UtilisateursModule {}