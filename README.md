# Intranet ETNA : Slackbot
Pour recevoir ses actualités (messages du mur) sur Slack.
## Installation
#### Créez votre bot slack
> https://my.slack.com/services/new/bot
> Récupérer le token sur : Browse Apps > Custom Integrations > Bots > Edit configuration
> Exemple de token : *xoxb-1234567890123456789012345678901234567*
### Créez une instance nodeJS
Clonez le projet, editez le fichier `server.js` :
```js
/*CONFIGURATION : VOS INFORMATIONS*/
var LOGIN = ""; //Login ETNA (user_u)
var PASSWORD = ""; //Password ETNA
var CHANNEL = ""; //Channel dans lequel le bot va poster les messages
var SLACKBOT_TOKEN = "xoxb-xxxx"; //https://my.slack.com/services/new/bot
```
### Lancez le serveur
```js
nodejs server.js
```