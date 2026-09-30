import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UtilisateursService } from '../utilisateurs/utilisateurs.service';

@Injectable()
export class JwtStrategie extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private utilisateurs: UtilisateursService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Recharge l'utilisateur en base : un changement de rôle est effectif immédiatement
  async validate(charge: { sub: string }) {
    const utilisateur = await this.utilisateurs.trouverParId(charge.sub);
    if (!utilisateur) throw new UnauthorizedException('Utilisateur introuvable');
    const { motDePasse, ...utilisateurSur } = utilisateur;
    return utilisateurSur;
  }
}