const SteamID = require('steamid');
const path = require('path');
var request = require('request')
const {connect} = require('./database_connect.js')
const {connectPro} = require('./database_connect_promise.js')
const cron = require('node-cron');
const clc = require('cli-color')
const {response} = require("express");
const dotenv = require('dotenv');
const chokidar = require('chokidar');


function loadEnv() {
    // Laden der Umgebungsvariablen aus der .env-Datei
    const envConfig = dotenv.config();

    // Überprüfen, ob ein Fehler aufgetreten ist
    if (envConfig.error) {
        throw envConfig.error;
    }

    // Aktualisieren der Umgebungsvariablen
    for (const key in envConfig.parsed) {
        process.env[key] = envConfig.parsed[key];
    }
}

//Please do not use this function until next update!
function createTablesIfNotExists() {
    connect().then((connection) => {
        const playerCountQuery = `CREATE TABLE IF NOT EXISTS player_count (
            id INT AUTO_INCREMENT PRIMARY KEY,
            num_players INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        connection.query(playerCountQuery, function (err) {
            if (err) {
                console.error(err);
                connection.end();
                return;
            }

            // Prüfen, ob die Tabelle erstellt wurde
            const checkTableQuery = `SELECT table_name FROM information_schema.tables WHERE table_name = 'player_count'`;

            connection.query(checkTableQuery, function (err, result) {
                if (err) {
                    console.error(err);
                } else if (result[0].length > 0) {
                    // Tabelle wurde erstellt
                    console.log(clc.green('[SERVER] ') + 'player_count Tabelle wurde angelegt');
                } else {
                    // Tabelle wurde nicht erstellt, weil sie bereits existiert
                    console.log(clc.yellow('[SERVER] ') + 'player_count Tabelle existiert bereits. Überspringe..');
                }
                connection.end();
            });
        });
    });
}




function steamID64toSteamID(steamID64) {
    const steamID = new SteamID(steamID64);

    if (steamID.isValid()) {
        const universe = steamID.universe;
        const accountID = steamID.accountid;

        const steamID2 = `STEAM_${universe}:${accountID % 2}:${Math.floor(accountID / 2)}`;

        return steamID2;
    } else {
        throw new Error('Invalid SteamID');
    }
}

function checkPlayerCount() {
    const options = {
        method: 'GET',
        url: `https://api.imp87.xyz/csgo/${process.env.GAMESERVER_IP}`,
        headers: {}
    };

    connect().then((connection) => {
        // Prüfen, ob die Tabelle player_count existiert
        connection.query(`SELECT 1 FROM player_count LIMIT 1`, function (err) {
            // Daten aus der API abrufen
            request(options, function (error, response) {
                if (error) throw new Error(error);
                const responseJSON = JSON.parse(response.body);
                const numPlayers = responseJSON.data.raw.numplayers;

                // Eintrag in der Datenbank erstellen
                const query = `INSERT INTO player_count (num_players, created_at) VALUES (${numPlayers}, CURRENT_TIMESTAMP)`;
                connection.query(query, function (err) {
                    if (err) console.error(err);
                    connection.end(function(err) {
                        if (err) console.error(err);
                    });
                });
            });
        });
    });
}


function deleteOldPlayerCounts() {
    connect().then((connection) => {
        const date48hAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const query = `DELETE FROM player_count WHERE created_at < '${date48hAgo}'`;
        connection.query(query, function (err, result) {
            if (err) console.error(clc.red('[SERVER] ') + err);
            connection.end()
        });
    });

}

function getMaxPlayers(callback){
    var options = {
        'method': 'GET',
        'url': 'https://api.imp87.xyz/csgo/5.180.254.59:50005',
        'headers': {}
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);

        var apiResponse = JSON.parse(response.body);
        var maxPlayers = apiResponse.data.maxplayers;

        callback(maxPlayers);

    });
}
    async function resetScore(steamid, callback) {
    const query = `UPDATE rankme
SET score = 1000,
    kills = 0,
    deaths = 0,
    assists = 0,
    suicides = 0,
    tk = 0,
    shots = 0,
    hits = 0,
    headshots = 0,
    connected = 0,
    rounds_tr = 0,
    rounds_ct = 0,
    lastconnect = 0,
    knife = 0,
    glock = 0,
    hkp2000 = 0,
    usp_silencer = 0,
    p250 = 0,
    deagle = 0,
    elite = 0,
    fiveseven = 0,
    tec9 = 0,
    cz75a = 0,
    revolver = 0,
    nova = 0,
    xm1014 = 0,
    mag7 = 0,
    sawedoff = 0,
    bizon = 0,
    mac10 = 0,
    mp9 = 0,
    mp7 = 0,
    ump45 = 0,
    p90 = 0,
    galilar = 0,
    ak47 = 0,
    scar20 = 0,
    famas = 0,
    m4a1 = 0,
    m4a1_silencer = 0,
    aug = 0,
    ssg08 = 0,
    sg556 = 0,
    awp = 0,
    g3sg1 = 0,
    m249 = 0,
    negev = 0,
    hegrenade = 0,
    flashbang = 0,
    smokegrenade = 0,
    inferno = 0,
    decoy = 0,
    taser = 0,
    mp5sd = 0,
    breachcharge = 0,
    head = 0,
    chest = 0,
    stomach = 0,
    left_arm = 0,
    right_arm = 0,
    left_leg = 0,
    right_leg = 0,
    c4_planted = 0,
    c4_exploded = 0,
    c4_defused = 0,
    ct_win = 0,
    tr_win = 0,
    hostages_rescued = 0,
    vip_killed = 0,
    vip_escaped = 0,
    vip_played = 0,
    mvp = 0,
    damage = 0,
    match_win = 0,
    match_draw = 0,
    match_lose = 0,
    first_blood = 0,
    no_scope = 0,
    no_scope_dis = 0,
    thru_smoke = 0,
    blind = 0,
    assist_flash = 0,
    assist_team_flash = 0,
    assist_team_kill = 0,
    wallbang = 0
    WHERE steam = ?`
        connectPro().then((connection) => {
            // Prüfe den Zeitstempel des letzten Zurücksetzens
            const checkLastResetQuery = 'SELECT last_reset FROM rankme WHERE steam = ?';
            connection.query(checkLastResetQuery, [steamid]).then((result) => {
                if (result[0].length > 0) {
                    const lastResetTimestamp = result[0][0].last_reset;
                    const now = new Date();
                    const timeDifference = now - lastResetTimestamp;

                    // Prüfe, ob das letzte Zurücksetzen vor mehr als 24 Stunden durchgeführt wurde
                    if (timeDifference >= process.env.RESET_COOLDOWN * 60 * 60 * 1000) {
                        connection.query(query, [steamid]).then((result) => {
                            // Aktualisiere den last_reset Zeitstempel für die betroffene Zeile
                            const updateLastResetQuery = 'UPDATE rankme SET last_reset = NOW() WHERE steam = ?';
                            connection.query(updateLastResetQuery, [steamid]).then(() => {
                                callback(null, 200); // Erfolgreiches Zurücksetzen
                            });
                        });
                    } else {
                        // Wenn das letzte Zurücksetzen vor weniger als 24 Stunden durchgeführt wurde, sende 429
                        callback(null, 429);
                    }
                } else {
                    callback(null, 404); // Spieler nicht gefunden
                }
            });
        });
    }



const watcher = chokidar.watch(__dirname + '../.env');

// Handler für die 'change'-Ereignisse
watcher.on('change', (path) => {
    console.log(clc.yellow('[SERVER] ') + `.env-Datei wurde geändert. Lade Umgebungsvariablen neu...`);
    loadEnv();
});






checkPlayerCount()
deleteOldPlayerCounts()

cron.schedule('*/30 * * * *', checkPlayerCount);
cron.schedule('*/30 * * * *', deleteOldPlayerCounts);




module.exports = {
    steamID64toSteamID,
    checkPlayerCount,
    getMaxPlayers,
    resetScore
}
