# 🤖 Configurer votre Bot Telegram

Voici les étapes simples pour activer le contrôle à distance de votre site.

## 1. Créer le Bot (Récupérer le Token)
1. Ouvrez Telegram et cherchez **@BotFather**.
2. Envoyez la commande `/newbot`.
3. Donnez un nom au bot (ex: `MonPortfolioBot`).
4. Donnez un nom d'utilisateur (doit finir par `bot`, ex: `PierreLouisPortfolioBot`).
5. **BotFather** va vous donner un **TOKEN** (une suite de chiffres et lettres comme `7009384:AA...`).
   👉 **Copiez ce Token.**

## 2. Récupérer votre ID (Pour la sécurité)
Vous voulez être le seul à contrôler votre site !
1. Cherchez **@userinfobot** sur Telegram.
2. Cliquez sur "Démarrer" ou envoyez n'importe quel message.
3. Il vous répondra avec votre `Id`. (C'est un numéro, ex: `123456789`).
   👉 **Copiez cet ID.**

## 3. Configurer le script
1. Ouvrez le fichier `bot.py` qui est à la racine de votre projet.
2. Remplacez `'VOTRE_TOKEN_TELEGRAM_ICI'` par le Token copié en étape 1.
3. Remplacez `123456789` par votre ID copié en étape 2.
4. Sauvegardez.

## 4. Installer et Lancer
Ouvrez votre terminal (dans ce dossier) et lancez ces commandes :

```bash
# 1. Installer la librairie nécessaire
pip install python-telegram-bot

# 2. Lancer le bot
python3 bot.py
```

## 5. C'est fini !
Envoyez `/start` à votre bot sur Telegram. Il vous répondra.
- `/open` : Force le site en mode "Disponible".
- `/close` : Force le site en mode "Indisponible".
- `/auto` : Revient aux horaires automatiques (9h-21h).
