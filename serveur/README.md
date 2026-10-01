# RH Taskflow

**RH Taskflow** est une application web de gestion de tâches avec un système simple de soumission et de validation.

L'idée est de reproduire un workflow proche d'un contexte professionnel : un collaborateur crée une tâche, la soumet lorsqu'elle est terminée, puis un manager peut la valider ou la rejeter. Un administrateur dispose quant à lui d'une vue globale sur les utilisateurs et les tâches.

Ce projet a été réalisé dans le cadre du **test technique Développeur Full Stack de RH Perspectives**.

J'ai utilisé la stack demandée :

* **Frontend :** Angular
* **Backend :** NestJS
* **Base de données :** PostgreSQL
* **ORM :** Prisma
* **Authentification :** JWT
* **Environnement :** Docker / Docker Compose

**Dépôt GitHub :** [DaoudaKA/rh-perspectives](https://github.com/DaoudaKA/rh-perspectives)

---

## Sommaire

1. [Démarrage rapide](#démarrage-rapide)
2. [Installation détaillée](#installation-détaillée)
3. [Comptes de démonstration](#comptes-de-démonstration)
4. [Fonctionnalités](#fonctionnalités)
5. [Workflow d'une tâche](#workflow-dune-tâche)
6. [Modèle de données](#modèle-de-données)
7. [API](#api)
8. [Sécurité et gestion des rôles](#sécurité-et-gestion-des-rôles)
9. [Organisation du projet](#organisation-du-projet)
10. [Quelques choix techniques](#quelques-choix-techniques)
11. [Gestion des erreurs](#gestion-des-erreurs)
12. [Accès à la base de données](#accès-à-la-base-de-données)
13. [Problèmes fréquents](#problèmes-fréquents)
14. [Améliorations possibles](#améliorations-possibles)

---

## Démarrage rapide

### Prérequis

Avant de commencer, il faut avoir installé :

* [Docker](https://www.docker.com/)
* Node.js **LTS**
* Git

### 1. Récupérer le projet

```bash
git clone https://github.com/DaoudaKA/rh-perspectives.git

cd rh-perspectives
```

### 2. Démarrer PostgreSQL

```bash
docker compose up -d
```

### 3. Démarrer l'API

Dans un premier terminal :

```bash
cd serveur

npm install

npx prisma migrate deploy

npx prisma db seed

npm run start:dev
```

L'API est accessible sur :

```text
http://localhost:3000
```

### 4. Démarrer Angular

Dans un deuxième terminal :

```bash
cd client

npm install

npm start
```

Puis ouvrir :

```text
http://localhost:4200
```

Une fois l'application ouverte, utiliser l'un des comptes de démonstration présentés ci-dessous.

---

# Installation détaillée

## Base de données

À la racine du projet :

```bash
docker compose up -d
```

Pour vérifier que le conteneur fonctionne :

```bash
docker compose ps
```

PostgreSQL est utilisé dans un conteneur Docker.

J'ai choisi d'exposer PostgreSQL sur le port **5433** de la machine hôte plutôt que 5432. Cela permet notamment d'éviter un conflit avec une éventuelle installation PostgreSQL déjà présente sur la machine.

Les paramètres par défaut sont :

| Variable            | Valeur     |
| ------------------- | ---------- |
| `POSTGRES_USER`     | `taskflow` |
| `POSTGRES_PASSWORD` | `taskflow` |
| `POSTGRES_DB`       | `taskflow` |

Les données sont conservées dans un volume Docker afin qu'un simple redémarrage du conteneur ne les supprime pas.

---

## Configuration de l'API

Après avoir installé les dépendances :

```bash
cd serveur
npm install
```

Créer un fichier :

```text
serveur/.env
```

avec par exemple :

```env
DATABASE_URL="postgresql://taskflow:taskflow@localhost:5433/taskflow?schema=public"

JWT_SECRET="une-longue-valeur-secrete"
JWT_EXPIRES_IN="1d"
```

Le fichier `.env` ne doit pas être versionné.

Ensuite :

```bash
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

En développement, lorsque le schéma Prisma évolue, `prisma migrate dev` peut être utilisé pour créer et appliquer une nouvelle migration.

---

## Configuration du client

Dans un autre terminal :

```bash
cd client
npm install
npm start
```

L'application Angular est alors disponible sur :

```text
http://localhost:4200
```

---

## Arrêter l'environnement

Pour arrêter les conteneurs sans supprimer les données :

```bash
docker compose down
```

Pour arrêter les conteneurs et supprimer également les volumes :

```bash
docker compose down -v
```

Après un `down -v`, il faudra recréer la base, appliquer les migrations et relancer le seed.

---

# Comptes de démonstration

Le projet contient un seed permettant de créer des comptes de démonstration.

| Rôle           | Nom          | Email              |
| -------------- | ------------ | ------------------ |
| Administrateur | Awa Diop     | `admin@demo.com`   |
| Manager        | Moussa Fall  | `manager@demo.com` |
| Collaborateur  | Fatou Ndiaye | `collab1@demo.com` |
| Collaborateur  | Ibrahima Sow | `collab2@demo.com` |

Les mots de passe utilisés par le seed sont définis directement dans le fichier de seed du projet.

Deux comptes collaborateurs permettent notamment de tester le fonctionnement du circuit de validation avec plusieurs utilisateurs.

### Exemple de scénario

1. Se connecter avec un compte **Collaborateur**.
2. Créer une tâche.
3. Modifier la tâche si nécessaire.
4. Soumettre la tâche.
5. Se déconnecter.
6. Se connecter avec un compte **Manager**.
7. Ouvrir la section **À valider**.
8. Valider ou rejeter la tâche.
9. Revenir sur le compte collaborateur pour consulter le résultat.

---

# Fonctionnalités

## Collaborateur

Un collaborateur peut :

* créer une tâche ;
* consulter ses tâches ;
* modifier une tâche en brouillon ;
* modifier une tâche rejetée ;
* supprimer une tâche en brouillon ou rejetée ;
* soumettre une tâche pour validation.

## Manager

Le manager dispose des mêmes fonctionnalités qu'un collaborateur et peut également :

* consulter les tâches soumises par les autres collaborateurs ;
* valider une tâche ;
* rejeter une tâche ;
* ajouter un commentaire lors d'un rejet.

Une tâche créée par le manager lui-même ne peut pas être validée par celui-ci.

## Administrateur

L'administrateur dispose d'une vue plus globale :

* consultation des utilisateurs ;
* consultation de toutes les tâches ;
* accès aux informations liées aux différents statuts.

---

# Authentification

L'application utilise une authentification basée sur **JWT**.

Lors de la connexion :

1. l'utilisateur fournit son email et son mot de passe ;
2. l'API vérifie les informations ;
3. le mot de passe est comparé à sa version hachée ;
4. un token JWT est généré ;
5. le client utilise ensuite ce token pour les requêtes protégées.

Le token est envoyé dans l'en-tête :

```http
Authorization: Bearer <token>
```

Les mots de passe ne sont jamais enregistrés en clair : ils sont hachés avec **bcrypt**.

---

# Workflow d'une tâche

Une tâche peut suivre le cycle suivant :

```mermaid
stateDiagram-v2
    [*] --> BROUILLON: Création
    BROUILLON --> SOUMISE: Soumission
    SOUMISE --> VALIDEE: Validation
    SOUMISE --> REJETEE: Rejet
    REJETEE --> SOUMISE: Correction et resoumission
    VALIDEE --> [*]
```

### Règles principales

* Une tâche peut être modifiée ou supprimée uniquement lorsqu'elle est en `BROUILLON` ou `REJETEE`.
* Seul son créateur peut la modifier ou la supprimer.
* Seule une tâche `SOUMISE` peut être traitée par un manager.
* Une tâche peut être validée ou rejetée par un manager différent de son créateur.
* Une tâche `VALIDEE` devient définitive.
* Lors d'un rejet, un commentaire peut être enregistré.
* L'identité du manager ayant traité la tâche est également conservée.

Cette dernière information permet notamment de garder une trace de la décision.

---

# Modèle de données

Le projet repose principalement sur deux modèles : **Utilisateur** et **Tâche**.

```mermaid
erDiagram
    UTILISATEUR ||--o{ TACHE : "crée"
    UTILISATEUR |o--o{ TACHE : "traite"

    UTILISATEUR {
        uuid id PK
        string nom
        string prenom
        string email UK
        string motDePasse
        Role role
        datetime creeLe
        datetime modifieLe
    }

    TACHE {
        uuid id PK
        uuid createurId FK
        uuid validateurId FK
        string titre
        string description
        StatutTache statut
        string commentaireRejet
        datetime creeLe
        datetime modifieLe
    }
```

J'ai ajouté deux informations à la tâche par rapport au modèle minimal :

* `validateurId` : permet de savoir quel manager a traité la tâche ;
* `commentaireRejet` : permet de conserver le motif d'un rejet.

Cela permet de rendre le workflow plus traçable.

## Utilisateur

| Champ        | Type  | Description                              |
| ------------ | ----- | ---------------------------------------- |
| `id`         | UUID  | Identifiant unique                       |
| `nom`        | Texte | Nom                                      |
| `prenom`     | Texte | Prénom                                   |
| `email`      | Texte | Email unique                             |
| `motDePasse` | Texte | Mot de passe haché                       |
| `role`       | Enum  | Collaborateur, Manager ou Administrateur |
| `creeLe`     | Date  | Date de création                         |
| `modifieLe`  | Date  | Date de modification                     |

## Tâche

| Champ              | Type  | Description                            |
| ------------------ | ----- | -------------------------------------- |
| `id`               | UUID  | Identifiant unique                     |
| `titre`            | Texte | Titre de la tâche                      |
| `description`      | Texte | Description                            |
| `statut`           | Enum  | Brouillon, soumise, validée ou rejetée |
| `commentaireRejet` | Texte | Commentaire facultatif                 |
| `createurId`       | UUID  | Utilisateur ayant créé la tâche        |
| `validateurId`     | UUID  | Manager ayant traité la tâche          |
| `creeLe`           | Date  | Date de création                       |
| `modifieLe`        | Date  | Date de modification                   |

Le schéma Prisma complet se trouve dans :

```text
serveur/prisma/schema.prisma
```

Les migrations sont disponibles dans :

```text
serveur/prisma/migrations/
```

---

# API

Les routes protégées nécessitent un JWT.

| Méthode  | Route                           | Accès          | Description                 |
| -------- | ------------------------------- | -------------- | --------------------------- |
| `POST`   | `/authentification/inscription` | Public         | Créer un compte             |
| `POST`   | `/authentification/connexion`   | Public         | Se connecter                |
| `GET`    | `/taches`                       | Connecté       | Consulter ses tâches        |
| `POST`   | `/taches`                       | Connecté       | Créer une tâche             |
| `PATCH`  | `/taches/:id`                   | Créateur       | Modifier une tâche          |
| `DELETE` | `/taches/:id`                   | Créateur       | Supprimer une tâche         |
| `POST`   | `/taches/:id/soumettre`         | Créateur       | Soumettre une tâche         |
| `GET`    | `/taches/a-valider`             | Manager        | Voir les tâches à traiter   |
| `POST`   | `/taches/:id/valider`           | Manager        | Valider une tâche           |
| `POST`   | `/taches/:id/rejeter`           | Manager        | Rejeter une tâche           |
| `GET`    | `/utilisateurs`                 | Administrateur | Consulter les utilisateurs  |
| `GET`    | `/taches/toutes`                | Administrateur | Consulter toutes les tâches |

---

# Sécurité et gestion des rôles

La gestion des droits est faite à deux niveaux.

### Côté Angular

Des guards permettent de contrôler l'accès aux différentes pages :

* `gardeConnecte` : réservé aux utilisateurs connectés ;
* `gardeInvite` : réservé aux utilisateurs non connectés ;
* `gardeRole` : vérifie le rôle nécessaire pour accéder à une fonctionnalité.

Ces guards améliorent surtout l'expérience utilisateur.

### Côté API

La véritable sécurité est appliquée côté serveur.

Pour chaque requête protégée, l'API :

1. vérifie le JWT ;
2. récupère l'utilisateur ;
3. vérifie son rôle lorsque nécessaire ;
4. vérifie également qu'il a le droit d'effectuer l'action sur la ressource concernée.

Les secrets et paramètres sensibles sont récupérés depuis les variables d'environnement.

---

# Organisation du projet

```text
rh-perspectives/
│
├── client/
│   └── src/
│       ├── styles.css
│       └── app/
│           ├── app.routes.ts
│           ├── coeur/
│           ├── partage/
│           └── fonctionnalites/
│               ├── authentification/
│               ├── taches/
│               ├── validation/
│               └── administration/
│
├── serveur/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   └── src/
│       ├── app.module.ts
│       ├── base-de-donnees/
│       └── ...
│
└── docker-compose.yml
```

## Angular

J'ai séparé l'application en trois grandes parties :

### `coeur/`

On y retrouve les éléments utilisés dans plusieurs fonctionnalités :

* services HTTP ;
* guards ;
* modèles TypeScript ;
* gestion des erreurs.

### `partage/`

Cette partie contient les composants réutilisables, notamment la mise en page et les éléments communs de l'interface.

### `fonctionnalites/`

Chaque fonctionnalité possède son propre espace :

* authentification ;
* tâches ;
* validation ;
* administration.

Les routes utilisent également le chargement à la demande afin de ne pas charger inutilement toutes les fonctionnalités au démarrage.

## NestJS

Le backend est organisé autour de modules.

Le service Prisma est centralisé dans un module de base de données afin d'éviter de créer plusieurs connexions ou de répéter la même configuration dans les différents modules.

---

# Quelques choix techniques

### Un menu basé sur les rôles

Plutôt que de mettre plusieurs conditions directement dans les templates Angular, les éléments du menu sont définis avec les rôles autorisés.

Cela permet de centraliser cette logique et de faciliter l'ajout d'une nouvelle fonctionnalité.

### Standalone Components et Signals

J'utilise les composants standalone d'Angular ainsi que les signals pour gérer l'état local des pages.

Cela permet de garder les composants relativement simples et d'éviter une structure basée sur de nombreux modules Angular.

### Lazy loading

Les différentes pages sont chargées avec `loadComponent`.

Par exemple, les fonctionnalités d'administration ne sont pas chargées inutilement pour un collaborateur.

### Services pour les appels API

Les composants ne communiquent pas directement avec l'API.

Les appels sont regroupés dans des services dédiés, ce qui permet de mieux séparer :

* l'affichage ;
* la logique métier côté client ;
* les appels HTTP.

### Prisma

J'ai conservé le vocabulaire du sujet dans le modèle Prisma avec `Utilisateur` et `Tache`.

Les noms des tables PostgreSQL sont ensuite adaptés grâce à `@@map`.

### PostgreSQL sur le port 5433

Le choix du port 5433 permet d'éviter les conflits avec une installation PostgreSQL locale utilisant déjà le port 5432.

### Traçabilité des validations

Les champs `validateurId` et `commentaireRejet` ne sont pas indispensables pour faire fonctionner le workflow minimal, mais ils apportent une information utile dans un contexte professionnel : savoir qui a pris la décision et, lorsqu'il y a rejet, pourquoi.

---

# Gestion des erreurs

L'application prend en compte les principaux cas d'erreur :

* données invalides ;
* utilisateur non authentifié ;
* droits insuffisants ;
* ressource inexistante ;
* erreur liée à l'état actuel d'une tâche.

Les messages retournés par l'API sont transformés en messages compréhensibles côté interface.

Lorsqu'une action est en cours, le bouton concerné est également désactivé afin d'éviter les doubles soumissions.

Quelques codes HTTP utilisés :

| Code  | Signification                               |
| ----- | ------------------------------------------- |
| `400` | Données ou état de la ressource invalide    |
| `401` | Authentification requise ou session expirée |
| `403` | Droits insuffisants                         |
| `404` | Ressource introuvable                       |

Lorsqu'une tâche est modifiée entre le moment où elle est affichée et celui où le manager tente de la traiter, l'application recharge la liste afin d'afficher l'état réel des données.

---

# Accès à la base de données

## Prisma Studio

Pour consulter rapidement les données :

```bash
cd serveur

npx prisma studio
```

Puis ouvrir :

```text
http://localhost:5555
```

## DBeaver ou pgAdmin

Les paramètres de connexion sont :

```text
Hôte : localhost
Port : 5433
Base : taskflow
Utilisateur : taskflow
Mot de passe : taskflow
```

## Ligne de commande

Il est également possible d'utiliser `psql` directement depuis le conteneur :

```bash
docker exec -it rhperspectives-db psql -U taskflow -d taskflow
```

Quelques commandes utiles :

```sql
\dt

SELECT * FROM utilisateurs;

SELECT * FROM taches;
```

Pour quitter :

```sql
\q
```

---

# Problèmes fréquents

| Problème                                 | Solution                                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Can't reach database server`            | Vérifier que PostgreSQL est démarré avec `docker compose ps` et que le port `5433` est utilisé |
| `DATABASE_URL` introuvable               | Vérifier que `serveur/.env` existe et contient `DATABASE_URL`                                  |
| `port is already allocated`              | Vérifier qu'un autre service n'utilise pas le port 5433                                        |
| Les tables n'existent pas                | Exécuter `npx prisma migrate deploy`                                                           |
| Aucun compte de démonstration            | Exécuter `npx prisma db seed`                                                                  |
| Les données ont disparu                  | Vérifier si `docker compose down -v` a été exécuté                                             |
| La rubrique « À valider » n'apparaît pas | Vérifier que le compte utilisé possède le rôle `MANAGER`                                       |
| Erreur `403`                             | Vérifier le rôle et les droits de l'utilisateur                                                |
| Erreur réseau                            | Vérifier que l'API NestJS est bien démarrée                                                    |
| Page Angular vide                        | Vérifier la console du navigateur et le terminal Angular                                       |

---

# Améliorations possibles

Le projet couvre le workflow principal demandé dans le test. Si je devais poursuivre son développement, voici les améliorations que je privilégierais :

### Conteneuriser toute l'application

Actuellement, Docker est utilisé pour PostgreSQL.

Une prochaine étape serait de dockeriser également :

* l'API NestJS ;
* l'application Angular.

L'ensemble pourrait alors être démarré avec une seule commande :

```bash
docker compose up
```

### Ajouter des tests automatisés

Je mettrais en place :

* des tests unitaires côté NestJS ;
* des tests des services Angular ;
* des tests d'intégration ;
* un test E2E couvrant le workflow complet d'une tâche.

### Ajouter pagination et filtres

Les listes pourraient être améliorées avec :

* pagination ;
* recherche ;
* filtrage par statut ;
* filtrage par utilisateur ;
* tri par date.

### Historiser les décisions

Pour une utilisation réelle, une tâche pourrait être rejetée plusieurs fois.

Un système d'historique permettrait alors de conserver toutes les décisions successives plutôt que uniquement le dernier validateur et le dernier commentaire.

### Notifications

Le créateur pourrait recevoir une notification lorsqu'une tâche est :

* validée ;
* rejetée.

### Gestion avancée des sessions

Un mécanisme de refresh token pourrait être ajouté afin de gérer plus proprement les sessions longues.

---


