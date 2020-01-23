var bot = require('../model/bot');
var request = require('request');
var sleep = require('./sleep');
var mybets = require('./myBets');
var matchBets = require('./matchBets');
var placeNewBets = require('./placeNewBets');
var awaitActions = require('./awaitActions');

exports.bot_page = function (req, res) {
    res.render('bot.html');
}

exports.load_available_bots = function (req, res) {
    bot.loadAvailableBots(function (err, bots) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(bots);
            load_bots(bots);
        }
    });
};

async function load_bots(bots) {
    var i = 0;
    var flag = 1;
    var targetBets = [];
    var target;
    while (i < bots.length) {
        flag = 1;
        await import_wallet(bots[i]).then(function () {
            console.log('Wallet Imported');
        });

        if (i) {
            await matchBets.match_designated_open_bets(targetBets).then(function () {
                console.log('matched bets');
            }).catch(function(err){
                console.log(err);
            });
        }

        await placeNewBets.placeNewBets().then(function (msg) {
            console.log(msg);
        }).catch(function (err) {
            console.log(err);
        });

        console.log('Waiting for new bets to be placed');

        while (flag) {
            await awaitActions.waitForPlacingNewBets().then(function (response) {
                flag = response[0];
                if(response[1].length > 0){
                    target = response[1][0].id;
                }
            }).catch(function(err){
                console.log(err);
            });
        }

        await placeNewBets.loadBetsRemoteID(target).then(function(targetBetsRemoteID){
            targetBets = targetBetsRemoteID;
            i++;
        }).catch(function(err){
            console.log(err);
        });

        if (i == bots.length) {
            await import_wallet(bots[0]).then(function (response) {
                console.log(response);
            });

            await matchBets.match_designated_open_bets(targetBets).then(function () {
                console.log('matched bets');
                i++;
            }).catch(function(err){
                console.log(err);
            });
        }
    }
    console.log('Cycle finished');
}

async function import_wallet(bot) {
    return new Promise(function (resolve, reject) {
        request.post('http://localhost:5000/api/Wallets/importWallet?PK=' + bot.pk, async function (err, httpResponse, response) {
            console.log(bot);
            if (err) {
                console.log(err);
                reject();
            } else {
                request.post('http://localhost:5000/api/Wallets/setSettings?nickname=' + bot.user, function (error) {
                    if (error) {
                        console.log(error)
                    }
                });
                var flag = 1;
                console.log('waiting');
                while (flag) {
                    await sync_network().then(function (value) {
                        flag = value;
                    }).catch(function (message) {
                        console.log(message)
                    });
                };
                await mybets.load_bot_bets().then(function (response) {
                    console.log(response);
                });
                resolve('Wallet Imported');
            };
        });
    });

};

function sync_network() {
    var wait = 1;
    var proceed = 0;
    return new Promise(function (resolve, reject) {
        request.get('http://localhost:5000/api/Network/getSelectedNetwork', async function (err, httpResponse, response) {
            if (err) {
                console.log(err);
                reject(err);
            }

            if (JSON.parse(response).outOfSync) {
                await sleep.sleep(1000);
                resolve(wait);
            } else {
                console.log('rdy');
                resolve(proceed);
            };
        });
    });
};