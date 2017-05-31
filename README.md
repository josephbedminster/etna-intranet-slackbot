# Intranet ETNA : Slackbot
Pour recevoir ses actualités (messages du mur) sur Slack.
![prep etna alternance](http://www.etna.io/images/etna-prep.jpg "Logo ETNA alternance prep")
   
### Exemple de message
`v1`
![prep etna alternance](https://img4.hostingpics.net/pics/791117Capturedcran20170523112838.png "Logo ETNA alternance prep")
   
`v2`
![prep etna alternance](https://img4.hostingpics.net/pics/928416Capturedcran20170530193131.png "Logo ETNA alternance prep")

## Installation
#### Créez votre bot slack
> https://my.slack.com/services/new/bot
> Récupérer le token sur : Browse Apps > Custom Integrations > Bots > Edit configuration
> Exemple de token : *xoxb-1234567890123456789012345678901234567*
### Créez une instance nodeJS
Clonez le projet, editez le fichier `server.js` :
```js
/*CONFIGURATION : VOS INFORMATIONS*/
var `LOGIN` = ""; //Login ETNA (user_u)
var `PASSWORD` = ""; //Password ETNA
var `CHANNEL` = ""; //Channel slack dans lequel le bot va poster les messages
var `USER` = ""; //User slack qui va recevoir les résultats des quests
var `SLACKBOT_TOKEN = "xoxb-xxxx"; //https://my.slack.com/services/new/bot
```
### Lancez le serveur
```js
nodejs server.js
```

# Patchnote
### v2.1
- Prise en charge des quests : seul l'utilisateur `USER` est averti.

#### v2
- Passage de `slackbots` à `smarslack`
- Prise en charge des réponses aux messages
- `Attachments` slack plutot que `textmessage` pour une mise en forme plus user-friendly
- Stockage des posts/réponses rencontrées dans save.json.
