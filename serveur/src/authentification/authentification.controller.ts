import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Publique } from '../commun/decorateurs/publique.decorateur';
import { UtilisateurCourant } from '../commun/decorateurs/utilisateur-courant.decorateur';
import { AuthentificationService } from './authentification.service';
import { ConnexionDto } from './dto/connexion.dto';
import { InscriptionDto } from './dto/inscription.dto';

@ApiTags('authentification')
@Controller('auth')
export class AuthentificationController {
  constructor(private authentification: AuthentificationService) {}

  @Publique()
  @Post('inscription')
  inscription(@Body() dto: InscriptionDto) {
    return this.authentification.inscrire(dto);
  }

  @Publique()
  @HttpCode(HttpStatus.OK)
  @Post('connexion')
  connexion(@Body() dto: ConnexionDto) {
    return this.authentification.connecter(dto);
  }

  @ApiBearerAuth()
  @Get('moi')
  moi(@UtilisateurCourant() utilisateur: unknown) {
    return utilisateur;
  }
}