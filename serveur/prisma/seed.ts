import { PrismaClient, Role, StatutTache } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const motDePasse = await bcrypt.hash('Password123!', 10);

  const creerUtilisateur = (email: string, prenom: string, nom: string, role: Role) =>
    prisma.utilisateur.upsert({
      where: { email },
      update: {},
      create: { email, prenom, nom, role, motDePasse },
    });

  const admin = await creerUtilisateur('admin@demo.com', 'Awa', 'Diop', Role.ADMINISTRATEUR);
  const manager = await creerUtilisateur('manager@demo.com', 'Moussa', 'Fall', Role.MANAGER);
  const collab1 = await creerUtilisateur('collab1@demo.com', 'Fatou', 'Ndiaye', Role.COLLABORATEUR);
  const collab2 = await creerUtilisateur('collab2@demo.com', 'Ibrahima', 'Sow', Role.COLLABORATEUR);

  // Les tâches de démonstration ne sont créées qu'une seule fois
  if ((await prisma.tache.count()) === 0) {
    await prisma.tache.createMany({
      data: [
        { titre: 'Préparer le rapport mensuel', description: 'Compiler les indicateurs RH du mois.', statut: StatutTache.BROUILLON, createurId: collab1.id },
        { titre: 'Mettre à jour le guide d’accueil', description: 'Ajouter la procédure des nouveaux arrivants.', statut: StatutTache.SOUMISE, createurId: collab1.id },
        { titre: 'Organiser la formation sécurité', description: 'Réserver la salle et inviter les équipes.', statut: StatutTache.VALIDEE, createurId: collab2.id, validateurId: manager.id },
        { titre: 'Refonte du planning congés', description: 'Proposition de nouveau format.', statut: StatutTache.REJETEE, commentaireRejet: 'Précisez le périmètre et les délais.', createurId: collab2.id, validateurId: manager.id },
        { titre: 'Audit des accès applicatifs', description: 'Vérifier les droits des comptes.', statut: StatutTache.SOUMISE, createurId: collab2.id },
      ],
    });
  }

  console.log('Seed terminé. Comptes (mot de passe : Password123!) :');
  console.log([admin, manager, collab1, collab2].map((u) => `${u.role} : ${u.email}`).join('\n'));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());