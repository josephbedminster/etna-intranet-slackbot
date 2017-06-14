/*CONFIGURATION : VOS INFORMATIONS*/
const
    LOGIN = "",
    PASSWORD = "",
    CHANNEL = "",
    USER = "",
    SLACKBOT_TOKEN = "";

/* MODULES */
const
    http = require('http'),
    https = require('https'),
    path = require('path'),
    async = require('async'),
    socketio = require('socket.io'),
    express = require('express'),
    request = require('request'),
    Cookie = require('request-cookies').Cookie,
    fs = require('fs'),
    app = express();

/* SLACK */
const SmartSlack = require('smartslack');
var options = {
    token: SLACKBOT_TOKEN,
    as_user:   false,
    username: 'etna',
    icon_url:'https://img4.hostingpics.net/pics/921067logoetna.jpg',
    attachments: []
};
const slackClient = new SmartSlack(options);

/* INIT GLOBALE COOKIE */
var apiCookie;

/*INIT SERVER*/
app.timeout = 0;
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
    slackClient.start();
    loopRequest();
    app.on('error', function(err) { console.log('Erreur :', err) });
}).on('error', function(err) { console.log('Erreur :', err) });


function loopRequest() {
    console.log("Initialisation de la boucle.");
    var interval = setInterval(function() {
        apiReload();
    }, 5 * 60000); //5 * 60000
}

function apiReload() {
    console.log('Reloading...');
    /* Authentification API ETNA */
    var options = { method: 'POST',
    url: 'https://auth.etna-alternance.net/login',
    headers: 
        {'cache-control': 'no-cache',
        'content-type': 'multipart/form-data;' },
    formData: { login: LOGIN, password: PASSWORD } };
    request(options, function (error, response, body) {
        if (error) {
            return;
        }
        var rawcookies = response.headers['set-cookie'];
        for (var i in rawcookies) {
            var cookie = new Cookie(rawcookies[i]);
            var apiKey = cookie.key;
            apiCookie = cookie.key + "=" + cookie.value;
        }
        var idStudent = JSON.parse(response.body).id;

        /* Get wall promotion */
        request({url: "https://prepintra-api.etna-alternance.net/users/" + idStudent + "/conversations?from=0&size=1", headers: {Cookie: apiCookie}}, function(error, response, body) {
            console.log('Requesting wall...');
            if (error) {
                console.log('INTRA LOADING ERROR :', error);
            }
            var result = JSON.parse(body);
            var data = new Array();
            if (result.hits[0].metas['activity-type'] === "quest") {
                data['type'] = "quest";
            } else {
                data['type'] = "post";
            }
            data['taille'] = result.hits[0].messages.length;
            data['idMessage'] = result.hits[0].id;
            data['title'] = result.hits[0].title;
            data['message'] = result.hits[0].last_message.content;
            data['idUser'] = result.hits[0].last_message.user;
            console.log('Nouvel id :', data['idMessage'], 'Taille :',  data['taille']);
            compareIdsWithSave(data);
        }).on('error', function(e){
            console.log('REQUEST 1 :', e)
        }).end();
    });
}


function postOnSlack(data) {
    //Récupère les informations de l'utilisateur avant l'envoi
    request({url: "https://auth.etna-alternance.net/api/users/" + data['idUser'], headers: {Cookie: apiCookie}}, function(error, response, body) {
        var result = JSON.parse(body);
        var login = result.login;
        var name = result.firstname + " " + result.lastname;
        if (data['type'] === 'quest') {
            var color = 'warning';
            var pretext = 'Demande relative au quest : ' + data['title'];
        }
        else {
            if (data['taille'] !== 1) {
                var color = '#439FE0';
                var pretext = 'Une réponse a été apportée au post : ' + data['title'];
            } else {
                var color = 'good';
                var pretext = 'Un nouveau post est arrivé sur le PrepIntra !';
            }
        }
        
        //Remplacer les caractères inutiles
        var text = data['message'].replace(/`/g, '');
        
        //Paramètre de l'attachment slack a envoyer
        var attachment = slackClient.createAttachment(data['title']);
        attachment.text = text;
        attachment.pretext = pretext;
        attachment.color = color;
        attachment.author_name = '@' + name + ' (' + login + ')';
        attachment.author_link = 'https://prepintra.etna-alternance.net/';
        attachment.author_icon = 'https://img4.hostingpics.net/pics/921067logoetna.jpg';
        attachment.title = data['title'];
        attachment.title_link = 'https://prepintra.etna-alternance.net/';
        attachment.footer = '';
        attachment.ts = Math.floor(Date.now() / 1000);
        options.attachments.push(attachment);
        
        //Envoie le message sur le chan
        data['type'] === 'quest' ? slackClient.postDirectMessage(USER, '', options) : slackClient.postMessage(CHANNEL, '', options);
    }).on('error', function(e){
        console.log('REQUEST 3 :', e)
    }).end();
}

function insertId(data) {
    fs.readFile('save.json',function(err,content) {
        if (err) {
            throw err;
        }
        var json = JSON.parse(content);
        var obj = {
            id: data['idMessage'],
            messages: data['taille']
        };
        json.list.push(obj);
        var json = JSON.stringify(json);
        fs.writeFile('save.json', json, 'utf8');
    });
}

function updateId(data) {
    fs.readFile('save.json',function(err,content) {
        if (err) {
            throw err;
        }
        var boolDejaVu = false;
        var json = JSON.parse(content);
        for (var i = 0; i < json['list'].length; i++) {
            if (json['list'][i].id === data['idMessage']) {
                json['list'][i].messages = data['taille'];
            }
        }
        var json = JSON.stringify(json);
        fs.writeFile('save.json', json, 'utf8');
    });
}

function compareIdsWithSave(data) {
    fs.readFile('save.json',function(err,content) {
        if (err) {
            throw err;
        }
        var boolDejaVu = false;
        var json = JSON.parse(content);
        for (var i = 0; i < json['list'].length; i++) {
            if (json['list'][i].id === data['idMessage']) {
                boolDejaVu = true;
                if (json['list'][i].messages === data['taille']) {
                    console.log('Message déja vu, pas de nouvelle réponse.');
                }
                else if (json['list'][i].messages < data['taille']) {
                    console.log('Nouvelle réponse : publier et stocker');
                    updateId(data);
                    postOnSlack(data);
                }
            }
        }
        if (boolDejaVu === false) {
            console.log('Nouveau message : publier et stocker.');
            insertId(data);
            postOnSlack(data);
        }
    });
}