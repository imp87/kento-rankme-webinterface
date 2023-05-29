const express = require('express');
const {connect} = require('../scripts/database_connect')
const {connectPro} = require('../scripts/database_connect_promise.js')
const router = express.Router();
const multer = require('multer')
const ejs = require('ejs')
router.use(express.urlencoded({extended: false}));
const passport = require('passport');
const session = require('express-session');
const SteamStrategy = require('passport-steam').Strategy;
const {getNumPlayers, getMaxPlayers, updateScoreAndPushHistory, resetScore} = require('../scripts/functions.js')
const moment = require('moment');


router.get('/dashboard', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }

    connectPro().then((connection) => {
        connection.query(`SELECT * FROM rankme`).then((result) => {
            connection.query(`SELECT num_players, created_at FROM player_count ORDER BY created_at DESC LIMIT 10`).then((result1) => {
                connection.query(`SELECT * FROM rankme WHERE steam = ?`, [req.session.user.steamID]).then((result2) => {
                    getMaxPlayers(function(maxPlayers) {
                            const options = {
                            }
                                    options.players = result[0]
                                    options.avatar = req.session.avatar
                                    options.avatarFull = req.session.avatarFull
                                    options.username = req.session.player
                                    options.playerCountData = result1[0]
                                    options.chartMaxPlayers = maxPlayers
                                    options.listNumPlayers = process.env.MAXPLAYERS_CHART
                                    options.currentScore = result2[0][0]?.score ?? 'Noch kein Score!'
                                    options.currentKills = result2[0][0]?.kills ?? 'Noch keine Kills!'
                                    options.currentDeaths = result2[0][0]?.deaths ?? 'Noch keine Tode!'
                                    options.steamID = result2[0][0]?.steam ?? req.session.user.steamID
                                    options.currentSuicides = result2[0][0]?.suicides ?? 'Noch keine Suicide!'
                                        options.currentHits = result2[0][0]?.hits ?? 'Noch keine Hits!'
                                    return res.render('index', options);

                    });
                })
            });
        });
    });
});


router.get('/logout', (req, res) => {
    // Setze die 'loggedIn' Session-Variable auf false
    req.session.loggedIn = false;
    // Entferne die Benutzerdaten aus der Session
    req.session.player = null
    req.session.avatar = null
    req.session.country = null
    // Leite den Benutzer zur Login-Seite weiter
    res.redirect('/login');
});



router.get('/login', (req, res) => {
    return res.render('login')
})


router.post('/push/score/:steamid', async (req, res) => {
    const steamid = req.params.steamid;
    const now = new Date();
    if(process.env.BOOST_ACTIVE === 'true'){
        try {
            const connection = await connectPro();
            const [result1] = await connection.query('SELECT steam FROM rankme WHERE steam = ?', [steamid]);

            if (result1.length === 0) {
                connection.end();
                return res.status(404).send(false);
            }

            const [result2] = await connection.query('SELECT TIMESTAMPDIFF(HOUR, last_push_time, ?) as elapsedHours FROM push_history WHERE steam = ?', [now, steamid]);

            if (result2.length === 0 || result2[0].elapsedHours >= 24) {
                if (result2.length === 0) {
                    await connection.query('INSERT INTO push_history (steam, last_push_time) VALUES (?, ?)', [steamid, now]);
                } else {
                    await connection.query('UPDATE push_history SET last_push_time = ? WHERE steam = ?', [new Date(), steamid]);
                }

                await connection.query('UPDATE rankme SET score = score + ? WHERE steam = ?', [process.env.BOOST_WEBSITE, steamid]);
                connection.end();
                return res.status(200).send(true);
            } else {
                connection.end();
                return res.status(429).send(false);
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send(false);
        }
    }else{
        return res.status(403).send(false)
    }

});

router.post('/reset/score/:steamid', (req, res) => {
    const steamid = req.params.steamid;
    if(process.env.RESET_ACTIVE === 'true'){
        resetScore(steamid, (error, status) => {
            if (error) {
                console.error(error);
                res.status(500).send(false);
            } else {
                res.status(status).send(status === 200);
            }
        });
    }else{
        return res.status(405).send(false)
    }

})

router.get('/stats', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login')
    }

    connectPro().then((connection) => {
        connection.query(`SELECT * FROM rankme`).then((result) => {
                connection.query(`SELECT * FROM rankme WHERE steam = ?`, [req.session.user.steamID]).then((result2) => {
                    getMaxPlayers(function(maxPlayers) {

                        const options = {};

                        options.playerData = result2[0][0]
                        options.avatar = req.session.avatar
                        options.avatarFull = req.session.avatarFull
                        options.username = req.session.player
                        options.chartMaxPlayers = maxPlayers
                        options.listNumPlayers = process.env.MAXPLAYERS_CHART
                        options.currentScore = result2[0][0]?.score ?? 'Noch kein Score!'
                        options.currentKills = result2[0][0]?.kills ?? 'Noch keine Kills!'
                        options.currentDeaths = result2[0][0]?.deaths ?? 'Noch keine Tode!'
                        options.steamID = result2[0][0]?.steam ?? req.session.user.steamID
                        options.currentSuicides = result2[0][0]?.suicides ?? 'Noch keine Suicide!'
                        options.currentHits = result2[0][0]?.hits ?? 'Noch keine Hits!'
                        return res.render('stats', options);

                    });
                })
        });
    });
})

module.exports = router