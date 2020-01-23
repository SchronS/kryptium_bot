var request = require('request');
var sleep = require('./sleep');
var awaitActions = require('./awaitActions');


exports.match_designated_open_bets = function (targetBets) {
    var flag = 1;
    var bet;
    return new Promise(async function (resolve, reject) {
        console.log('Wait for matchings to finish up');
        for (var i = 0; i < targetBets.length; i++) {
            await loadBetFromRemoteID(targetBets[i]).then(function (response) {
                bet = response;
            }).catch(function (err) {
                console.log(err);
                reject('Error');
            });
            await matchBet(bet).then(function (msg) {
                console.log(msg);
            }).catch(function (err) {
                console.log(err);
            });
        }
        resolve();
    });
};

function loadBetFromRemoteID(targetBet) {
    return new Promise(function (resolve, reject) {
        request.get('http://localhost:5000/api/Bets/filterBets?remoteIds=' + targetBet, function (err, httpResponse, bet) {
            if (err) {
                console.log(err);
                reject('Error');
            }
            resolve(JSON.parse(bet));
        });
    });
}

function matchBet(bet) {
    var flag = 1;
    return new Promise(function (resolve, reject) {
        request.post(`http://localhost:5000/api/Bets/callBet?betId=${bet[0].id}&forcast=${bet[0].forecasts[1].forecast}&wager=${bet[0].forecasts[1].h2hRequiredAmount}&calcNetFeeOnly=false`, async function (err, httpResponse, userBets) {
            if (err) {
                console.log(err);
                reject('Error');
            }
            while (flag) {
                await awaitActions.waitForMatchingPendingBets().then(function (response) {
                    flag = response;
                }).catch(function (err) {
                    console.log(err);
                });
            };
            resolve('Bet Matched');
        });
    });
}
