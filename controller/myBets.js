var request = require('request');
var sleep = require('./sleep');
var awaitActions = require('./awaitActions');

const refundActions = [6, 8, 14, 27, 29, 31, 33, 38];
const payMeAction = [36, 37];

exports.load_bot_bets = function () {
    return new Promise(function (resolve, reject) {
        request.get('http://localhost:5000/api/Bets/filterBets?playerHasBet=true', async function (err, httpResponse, bets) {
            if (err) {
                console.log(err)
                reject();
            }
            if (bets.length > 0) {
                for(var y = 0; y < JSON.parse(bets).length;y++){
                    for (var i = 0; i < refundActions.length; i++) {
                        if (JSON.parse(bets)[y].uiBetState == refundActions[i]) {
                            await remove_action(JSON.parse(bets)[y]).then(function (response) {
                                console.log(response);
                            }).catch(function (err) {
                                console.log(err);
                            });
                        }
                    }
                    for (var i = 0; i < payMeAction.length; i++) {
                        if (JSON.parse(bets)[y].uiBetState == payMeAction[i]) {
                            await pay_me_action(JSON.parse(bets)[y]).then(function (response) {
                                console.log(response);
                            }).catch(function (err) {
                                console.log(err);
                            });
                        }
                    }
                };
                resolve('All available actions have been executed');
            } else {
                console.log('No Bets Available');
            }
        });
    });
};

function remove_action(bet) {
    var flag = 1;
    return new Promise(function (resolve, reject) {
        request.post('http://localhost:5000/api/Bets/removeBet?calcNetFeeOnly=false&betId=' + bet.id, async function (err, httpResponse, body) {
            if (err) {
                console.log(err)
                reject('Error');
            }
            while (flag) {
                await awaitActions.wait_for_no_closed_pending_bets().then(function (value) {
                    flag = value;
                }).catch(function (message) {
                    console.log(message)
                });
            };
            resolve('Removed');
        });
    });
};

function pay_me_action(bet) {
    var flag = 1;
    return new Promise(function (resolve, reject) {
        request.post('http://localhost:5000/api/Bets/settleBet?calcNetFeeOnly=false&betId=' + bet.id, async function (err, httpResponse, body) {
            if (err) {
                console.log(err)
                reject('Error');
            }
            while (flag) {
                await awaitActions.wait_for_no_closed_pending_bets().then(function (value) {
                    flag = value;
                }).catch(function (message) {
                    console.log(message)
                });
            };
            resolve('Payed');
        });
    });
};