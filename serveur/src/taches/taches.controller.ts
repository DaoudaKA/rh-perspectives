import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role, Utilisateur } from '@prisma/client';
import { Roles } from '../commun/decorateurs/roles.decorateur';
import { UtilisateurCourant } from '../commun/decorateurs/utilisateur-courant.decorateur';
import { CreerTacheDto } from './dto/creer-tache.dto';
import { FiltrerTachesDto } from './dto/filtrer-taches.dto';
import { ModifierTacheDto } from './dto/modifier-tache.dto';
import { RejeterTacheDto } from './dto/rejeter-tache.dto';
import { TachesService } from './taches.service';

type UtilisateurAuth = Omit<Utilisateur, 'motDePasse'>;

@ApiTags('taches')
@ApiBearerAuth()
@Controller('taches')
export class TachesController {
  constructor(private taches: TachesService) {}

  @Post()
  creer(@Body() dto: CreerTacheDto, @UtilisateurCourant() u: UtilisateurAuth) {
    return this.taches.creer(dto, u);
  }

  @Get()
  mesTaches(@Query() filtre: FiltrerTachesDto, @UtilisateurCourant() u: UtilisateurAuth) {
    return this.taches.mesTaches(u, filtre.statut);
  }

  // Déclarée avant ':id' pour ne pas être capturée par la route paramétrée
  @Get('a-valider')
  @Roles(Role.MANAGER)
  aValider(@UtilisateurCourant() u: UtilisateurAuth) {
    return this.taches.aValider(u);
  }

  @Get(':id')
  trouverUne(@Param('id', ParseUUIDPipe) id: string, @UtilisateurCourant() u: UtilisateurAuth) {
    return this.taches.trouverUne(id, u);
  }

  @Patch(':id')
  modifier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ModifierTacheDto,
    @UtilisateurCourant() u: UtilisateurAuth,
  ) {
    return this.taches.modifier(id, dto, u);
  }

  @Delete(':id')
  supprimer(@Param('id', ParseUUIDPipe) id: string, @UtilisateurCourant() u: UtilisateurAuth) {
    return this.taches.supprimer(id, u);
  }

  @Post(':id/soumettre')
  soumettre(@Param('id', ParseUUIDPipe) id: string, @UtilisateurCourant() u: UtilisateurAuth) {
    return this.taches.soumettre(id, u);
  }

  @Post(':id/valider')
  @Roles(Role.MANAGER)
  valider(@Param('id', ParseUUIDPipe) id: string, @UtilisateurCourant() u: UtilisateurAuth) {
    return this.taches.valider(id, u);
  }

  @Post(':id/rejeter')
  @Roles(Role.MANAGER)
  rejeter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejeterTacheDto,
    @UtilisateurCourant() u: UtilisateurAuth,
  ) {
    return this.taches.rejeter(id, u, dto.commentaire);
  }
}