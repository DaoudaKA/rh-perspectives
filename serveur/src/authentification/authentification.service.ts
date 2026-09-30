import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UtilisateursService } from '../utilisateurs/utilisateurs.service';
import { ConnexionDto } from './dto/connexion.dto';
import { InscriptionDto } from './dto/inscription.dto';

@Injectable()
export class AuthentificationService {
  constructor(private utilisateurs: UtilisateursService, private jwt: JwtService) {}

  async inscrire(dto: InscriptionDto) {
    const existant = await this.utilisateurs.trouverParEmail(dto.email);
    if (existant) throw new ConflictException('Cet email est déjà utilisé');

    const utilisateur = await this.utilisateurs.creer({
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      motDePasse: await bcrypt.hash(dto.motDePasse, 10),
      // rôle COLLABORATEUR par défaut : jamais choisi par le client
    });
    return this.construireReponse(utilisateur);
  }

  async connecter(dto: ConnexionDto) {
    const utilisateur = await this.utilisateurs.trouverParEmail(dto.email);
    const valide = utilisateur && (await bcrypt.compare(dto.motDePasse, utilisateur.motDePasse));
    if (!utilisateur || !valide) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    return this.construireReponse(utilisateur);
  }

  private construireReponse(u: { id: string; email: string; role: string; nom: string; prenom: string }) {
    const jeton = this.jwt.sign({ sub: u.id, email: u.email, role: u.role });
    return {
      jeton,
      utilisateur: { id: u.id, email: u.email, nom: u.nom, prenom: u.prenom, role: u.role },
    };
  }
}