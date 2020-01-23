var request = require('request');
var sleep = require('./sleep');

exports.waitForMatchingPendingBets = function () {
    var wait = 1;
    var proceed = 0;
    return new Promise(function (resolve, reject) {
        request.get('http://localhost:5000/api/Bets/filterBets?isPending=true&playerHasBet=true', async function (err, httpResponse, userBets) {
            if (err) {
                console.log(err);
                reject('Error');
            }
            console.log('Number of bets waiting to be matched: ' + JSON.parse(userBets).length);

            if (JSON.parse(userBets).length > 0) {
                console.log('waiting...');
                await sleep.sleep(1000);
                resolve(wait);
            } else {
                resolve(proceed);
            }
        });
    });
};

exports.waitForPlacingNewBets = function () {
    var wait = 1;
    var proceed = 0;
    var response = [];
    return new Promise(function (resolve, reject) {
        request.get('http://localhost:5000/api/Bets/filterBets?isPending=true&playerHasBet=true', async function (err, httpResponse, userBets) {
            if (err) {
                console.log(err)
                reject('Error');
            }
            console.log('Number of bets waiting to be created: ' + JSON.parse(userBets).length);

            if (JSON.parse(userBets).length > 0) {
                console.log('waiting...');
                await sleep.sleep(1000);
                response.push(wait,JSON.parse(userBets));
                resolve(response);
            } else {
                response.push(proceed,[]);
                resolve(response);
            }
        });
    });
};

exports.wait_for_no_closed_pending_bets = function() {
    var wait = 1;
    var proceed = 0;
    return new Promise(function (resolve, reject) {
        request.get('http://localhost:5000/api/Bets/filterBets?isPending=true&playerHasBet=true', async function (err, httpResponse, noClosedPendingBets) {
            if (err) {
                console.log(err);
                reject('Error');
            }
            console.log('Number of bets waiting to be settled: ' + JSON.parse(noClosedPendingBets).length);

            if (JSON.parse(noClosedPendingBets).length > 0) {
                console.log('waiting...');
                await sleep.sleep(1000);
                resolve(wait);
            } else {
                resolve(proceed);
            }
        });
    });
};