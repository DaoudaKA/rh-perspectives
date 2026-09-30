import { Global, Module } from '@nestjs/common';
import { BaseDeDonneesService } from './base-de-donnees.service';

@Global()
@Module({
  providers: [BaseDeDonneesService],
  exports: [BaseDeDonneesService],
})
export class BaseDeDonneesModule {}