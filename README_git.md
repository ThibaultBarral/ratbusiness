# 📘 Git Workflow - Projet Ratbusiness

## 🔁 Structure des branches

| Branche     | Description                                      |
| ----------- | ------------------------------------------------ |
| `main`      | Version stable / production                      |
| `dev`       | Intégration des features validées                |
| `feature/*` | Nouvelles fonctionnalités                        |
| `fix/*`     | Corrections de bugs                              |
| `hotfix/*`  | Corrections urgentes à faire directement en prod |

## 💡 Convention de nommage

- `feature/dashboard-stats`
- `feature/add-sale-flow`
- `fix/articles-display`
- `hotfix/fix-login-error`

## 🧪 Workflow quotidien

```bash
# 1. Je pars toujours de la branche dev
$ git checkout dev
$ git pull origin dev

# 2. Je crée ma branche de feature
$ git checkout -b feature/ma-feature

# 3. Je code, puis je commit
$ git add .
$ git commit -m "✨ Ajout de ma super feature"

# 4. Je push ma branche
$ git push origin feature/ma-feature
```

---

## 🔀 Une fois la feature terminée

- Aller sur GitHub
- Créer une **Pull Request** vers `dev`
- Une fois testée et validée → merger dans `dev`
- Ensuite, si tout est ok sur `dev`, merger dans `main`

---

## ✍️ Exemples de messages de commit utiles

| Emoji | Usage                        | Exemple de message                         |
| ----- | ---------------------------- | ------------------------------------------ |
| ✨     | Nouvelle fonctionnalité      | `✨ Ajout interface ventes`                 |
| 🐛    | Correction de bug            | `🐛 Fix erreur affichage articles`         |
| ♻️    | Refacto ou nettoyage de code | `♻️ Refactor composant Card`               |
| 🔥    | Suppression de code          | `🔥 Suppression du module obsolète`        |
| ✅     | Test ou vérification ajoutée | `✅ Ajout de tests unitaires sur dashboard` |

---

## 📌 Bonus

- Utilise toujours `git pull origin dev` avant de créer une nouvelle branche !
- Fais des commits clairs, lisibles et logiques (évite les "wip" ou "test")
- Merge dans `main` uniquement quand le projet est prêt à être publié

