# Chat IRC

## Introduction
Réalisation d'un serveur IRC en Node.js.

## Features 

- Système de connexion
- Gestion du profil
- Le membre qui a créé son channel peut le supprimer et le modifier.
- Chaque action (création, suppression, ou nouvelle connexion) sur les channels et changement de pseudo envoient un message global visible sur tous les channels
- Les membres connectés à un channel peuvent envoyer un message à tous les utilisateurs de ce channel
- Le serveur maintenit à jour la liste des utilisateurs connectés (les sockets) ainsi que des channels(avec la listes des personnes connectées)
- Commandes d'un IRC de base
```bash
      - /nick nickname : définit le surnom de l’utilisateur au sein du serveur.
      - /list [string] : liste les channels disponibles sur le serveur. N’affiche que les channels contenant la chaîne “string” si celle-ci est spécifiée.
      - /create channel : créer un channel sur le serveur.
      - /delete channel : suppression du channel sur le serveur
      - /join channel : rejoint un channel sur le serveur.
      - /part channel : quitte le channel.
      - /users : liste les utilisateurs connectés au channel.
      - /msg nickname message : envoie un message à un utilisateur spécifique.
```
- Emojis dans les messages
- Autocompletion des commandes, channels, users
- Autolink des #channels et des @usernames

## Demo
> Bientôt disponible..

## Technologies
React.js, Node.js, Socket.io
