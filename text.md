#### Question 1:

### Améliorations possibles

- Ajouter de la pagination pour les listes
- Vérifier les doublons avec la db avant de faire une insert
- Ajouter une authentification (JWT ou session)
- Ajouter un cache pour éviter les appels à la db pour les données souvent demandées comme le top 100.
- Ajouter des try/catch sur toutes les opérations critiques
- Ajouter des logs
- Ajouter des rate limiters pour l'API
- Mettre en place CI/CD

#### Question 2:

Un script pour lire les fichiers de S3
Ajouter un cron job qui déclenche le script chaque jour
Le script lit les nouveaux fichiers de S3
Les données sont envoyées à l'API
L'API les insère dans la base de données.
