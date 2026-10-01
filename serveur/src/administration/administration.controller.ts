import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role, Utilisateur } from '@prisma/client';
import { Roles } from '../commun/decorateurs/roles.decorateur';
import { UtilisateurCourant } from '../commun/decorateurs/utilisateur-courant.decorateur';
import { FiltrerTachesDto } from '../taches/dto/filtrer-taches.dto';
import { AdministrationService } from './administration.service';
import { ModifierRoleDto } from './dto/modifier-role.dto';

@ApiTags('administration')
@ApiBearerAuth()
@Roles(Role.ADMINISTRATEUR)
@Controller('administration')
export class AdministrationController {
  constructor(private administration: AdministrationService) {}

  @Get('utilisateurs')
  utilisateurs() {
    return this.administration.utilisateurs();
  }

  @Patch('utilisateurs/:id/role')
  modifierRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ModifierRoleDto,
    @UtilisateurCourant() moi: Omit<Utilisateur, 'motDePasse'>,
  ) {
    return this.administration.modifierRole(id, dto.role, moi.id);
  }

  @Get('taches')
  taches(@Query() filtre: FiltrerTachesDto) {
    return this.administration.taches(filtre.statut);
  }
}