require('dotenv').config()
const port = process.env.PORT
const express = require('express');
const app = express()
const clc = require('cli-color')
const { setConnect } = require("./scripts/database");
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const session = require('express-session');
const ejs = require('ejs')
app.set('view engine', 'ejs');
const router = require('./routes/mainRoutes.js');
const crypto = require("crypto");
const path = require("path");
app.set('views', __dirname + '/public')
app.use(express.static(path.join(__dirname, '/public', ), {index: 'index'}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const secret = crypto.randomBytes(128).toString('hex');
const {steamID64toSteamID, getMaxPlayers} = require('./scripts/functions.js')

const { sessionStore } = setConnect();

app.use(session({
    key: process.env.COMMUNITY_NAME + ' login=true',
    secret: secret,
    resave: true,
    store: sessionStore,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new SteamStrategy({
    returnURL: 'https://zm1.imp87.xyz/auth/steam/return',
    realm: 'https://zm1.imp87.xyz/',
    apiKey: process.env.STEAM_WEB_APIKEY
}, (identifier, profile, done) => {
    // Hier solltest du den Benutzer in der Datenbank speichern oder überprüfen
    // und ihn anschließend mit der done()-Methode zurückgeben
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use('/', router)

app.get('/', (req, res) => {
    if(req.session && req.session.user){
        return res.redirect('/dashboard');
    }else{
        return res.redirect('/login')
    }
});


app.get('/auth/steam', passport.authenticate('steam'));

app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), (req, res) => {
    const steamID = steamID64toSteamID(req.user._json.steamid);
    req.session.player = req.user._json.personaname;
    req.session.avatar = req.user._json.avatar;
    req.session.avatarFull = req.user._json.avatarfull;
    req.session.country = req.user._json.loccountrycode;
    req.session.user = {
        isAuthenticated: true,
        steamID: steamID
    };
    req.session.save((error) => {
        if (error) {
            console.error('Fehler beim Speichern der Sitzungsdaten:', error);
            // Hier kannst du einen geeigneten Fehlerbehandlungsmechanismus implementieren
            return res.redirect('/');
        }
        return res.redirect('/dashboard');
    });
});


app.listen(port, () => {
    console.log(clc.green('[SERVER] ') + 'Hauptsystem gestartet.')
    console.log(clc.green('[SERVER] ') + 'Server läuft auf Port ' + port)
})