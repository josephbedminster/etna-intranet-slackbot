/*CONFIGURATION : VOS INFORMATIONS*/
var LOGIN = "";
var PASSWORD = "";
var CHANNEL = "";
var SLACKBOT_TOKEN = "xoxb-xxxx"; //https://my.slack.com/services/new/bot

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
	fs = require('fs');
	var app = express();

/* SLACK */
var SlackBot = require('slackbots');
var slackbot = new SlackBot({
  	token: SLACKBOT_TOKEN, // Add a bot https://my.slack.com/services/new/bot and put the token  
  	name: 'etna'
  });
var params = {
	icon_url: 'https://img4.hostingpics.net/pics/921067logoetna.jpg'
};

/*INIT LAST ID VU*/
var lastID;
getLastIdStored();

/*INIT SERVER*/
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
	loopRequest();
	slackbot.on('message', function(data) {
		console.log(data);
		if (data.type == 'desktop_notification') {
			slackbot.postMessageToUser(data.subtitle, "Je ne suis pas interessée, mais on peut être amis si tu veux ?", params); 
		}
	});
});

function loopRequest() {
	var interval = setInterval(function() {
		apiReload()
	}, 60000);
}

function apiReload() {
	/* Authentification API ETNA */
	var options = { method: 'POST',
	url: 'https://auth.etna-alternance.net/login',
	headers: 
	{ 'postman-token': 'f82263a3-0642-8dea-c7b0-b5a59c80fc5a',
	'cache-control': 'no-cache',
	'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
	formData: { login: LOGIN, password: PASSWORD } };
	request(options, function (error, response, body) {
		if (error) throw new Error(error);
		var rawcookies = response.headers['set-cookie'];
		for (var i in rawcookies) {
			var cookie = new Cookie(rawcookies[i]);
			var apiKey = cookie.key;
			var apiCookie = cookie.key + "=" + cookie.value;
		}
		
		/* Get wall promotion */
		request({url: "https://prepintra-api.etna-alternance.net/users/7934/conversations?from=0&size=1", headers: {Cookie: apiCookie}}, function(error, response, body) {
			var result = JSON.parse(body);
			console.log('nouvel id : '+ result.hits[0].id + ' ancien id : ' + lastID);
		if (lastID != result.hits[0].id) { //Si c'est un nouvel ID
			lastID = result.hits[0].id; //On stocke le dernier ID vu
			storeId(lastID); //On l'envoie dans le JSON
			console.log(result.hits[0].metas['activity-type']);
			if (result.hits[0].metas['activity-type'] != "quest") { //Si c'est un quest, ne pas afficher
				var title = result.hits[0].title;
			var message =  result.hits[0].messages[0].content;
			var id_poster = result.hits[0].messages[0].user;
			/* Get user : */
			request({url: "https://auth.etna-alternance.net/api/users/"+id_poster, headers: {Cookie: apiCookie}}, function(error, response, body) {
				var result = JSON.parse(body);
				var login = result.login;
				var name = result.firstname + " " + result.lastname;
				slackbot.postMessageToChannel(CHANNEL, '*' + name + ' (' + login + '*)\n' + title + '\n' + message, params);
			});
		}
	}
});
	});
}

function storeId(i) {
	var obj = {
		etna: []
	};

	obj.etna.push({id: i});
	var json = JSON.stringify(obj);
	fs.writeFile('save.json', json, 'utf8');
}

function getLastIdStored() {
	fs.readFile('save.json',function(err,content) {
		if(err) throw err;
		var json = JSON.parse(content);
		lastID = json.etna[0].id;
	});
}