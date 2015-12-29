var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require("socket.io").listen(server),
    uuid = require('node-uuid'),
    _ = require('underscore')._,
    mongo = require('mongodb').MongoClient,
    cookie = require('cookie'),
    store = new express.session.MemoryStore;

app.use(express.cookieParser('chat'));
var parseCookie = app.use(express.session({
    secret: 'chat',
    store: store
}));

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('ipaddr', process.env.IP ||"127.0.0.1");
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use('/components', express.static(__dirname + '/components'));
    app.use('/js', express.static(__dirname + '/js'));
    app.use('/icons', express.static(__dirname + '/icons'));
    app.set('views', __dirname + '/views');
    app.engine('html', require('ejs').renderFile);
});

server.listen(app.get('port'), app.get('ipaddr'), function () {
    console.log('Express server listening on  IP: ' + app.get('ipaddr') + ' and port ' + app.get('port'));
});

io.set("log level", 1);
var people = {};
var chattable ={};
var rooms = {};
var sockets = [];
var chatHistory = {};


function peopleFn(name, datetime, onlydate, device, country, browser, s_id) {
    this.name = name;
    this.datetime = datetime;
    this.onlydate = onlydate;
    this.device = device;
    this.country = country;
    this.browser = browser;
    this.s_id = s_id;
    //console.log(country);
}

function msgInsertFn(name, msg) {
    this.name = name;
    this.msg = msg;
}

function getCurrentDateTime(_t) {
    var d = new Date(), month = d.getMonth() + 1, day = d.getDate(), output, time, _t;
    var page = (typeof _t != 'undefined') ? _t : '';
    time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    output = d.getFullYear() + '/' +
        (month < 10 ? '0' : '') + month + '/' +
        (day < 10 ? '0' : '') + day;
    if (_t)
        output = output + ' ' + time;
    return output;
}
mongo.connect('mongodb://admin:pass123@ds035663.mongolab.com:35663/chatapp-db', function (err, db) {
    if (err) throw err;
    console.log('DB connection worked!!!');
    io.sockets.on("connection", function (socket) {

        var get_people_col = db.collection('peoples');
        var col = db.collection('messages');

        socket.on("joinserver", function (name, device,country,browser) {
            var exists = false;
            _.find(people, function (key, value) {
                if (key.name.toLowerCase() === name.toLowerCase())
                    return exists = true;
            });
            if (name) { //provide unique username:
                people[socket.id] = {
                    "name": name,
                    "device": device,
                    "country": country,
                    "browser": browser,
                    "id": socket.id
                };
                console.log(people[socket.id]);
                var d = new Date();
                var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                socket.emit("update", "You have connected to the server." + "<br>" + days[d.getDay()]);
                io.sockets.emit("update", people[socket.id].name + " is online.");
                sizePeople = _.size(people);
                io.sockets.emit("update-people", {
                    people: people,
                    count: sizePeople
                });
                socket.emit("joined"); //extra emit for GeoLocation
                sockets.push(socket);
                //insert people data to DB
                var _current_date_time = getCurrentDateTime(1);
                var _current_date_only = getCurrentDateTime();
                var _people = new peopleFn(name, _current_date_time, _current_date_only, device, country, browser, socket.id);
                get_people_col.insert(_people, function (err, savedPeople) {
                    if (err || !savedPeople)console.log("People " + _people.name + " not saved :( " + err);
                    else console.log("People - " + _people.name + "  saved on " + " :) ");
                });

            }
        });

        socket.on("getOnlinePeople", function (fn) {
            fn({
                people: people
            });
        });

        socket.on("countryUpdate", function (data) { //we know which country the user is from
            country = data.country.toLowerCase();
            console.log(data.country);
            people[socket.id].country = country;
            io.sockets.emit("update-people", {
                people: people,
                count: sizePeople
            });
        });
        socket.on("browserUpdate", function (data) {
            browser = data.browser;
            people[socket.id].browser = browser;
            io.sockets.emit("update-people", {people: people, count: sizePeople});
        });




        socket.on("send", function (msg, id) {
            var re = /.*:/;
            var whisper = re.test(msg);
            console.log(msg);
            console.log(id);
            var whisperStr = msg.split(":");
            var user_id = id;
            var found = false;
            if (whisper) {
                var whisperTo = whisperStr[0];
                var keys = Object.keys(people);
                if (keys.length != 0) {
                    for (var i = 0; i < keys.length; i++) {
                        var whisperId = keys[i];
                        if (socket.id === user_id) {
                            socket.emit("update", "You can't whisper to yourself.");
                            break;
                        } else {
                            found = true;
                        }
                    }
                }
            }

            if (found && socket.id !== user_id) {
                var whisperTo = whisperStr[0];
                var whisperMsg = whisperStr[1];
                //console.log(whisperMsg);
                socket.emit("whisper", {name: "You"}, whisperMsg);
                io.sockets.socket(user_id).emit("whisper", people[socket.id], whisperMsg);
                console.log(people[socket.id].name + '-' + whisperMsg);
                var _msg = new msgInsertFn(people[socket.id].name, whisperMsg);
                col.insert(_msg, function (err, savedMsg) {
                    if (err || !savedMsg)console.log("Name " + _msg.name + " not saved :( " + err);
                    else console.log("Name - " + _msg.name + "  saved msg " + _msg.msg + " :) ");
                });
            } else {
                socket.emit("update", "Can't find " + whisperTo);
            }

        });
        socket.on("check", function (name, fn) {
            var match = false;
            _.find(rooms, function (key, value) {
                if (key.name === name)
                    return match = true;

            });
            fn({
                result: match
            });
        });

    });
});
