var request = require('request');
var sleep = require('./sleep');
var moment = require('moment');

exports.placeNewBets = function () {
    return new Promise(function (resolve, reject) {
        console.log('Placing new bets');
        request.get(`http://localhost:5000/api/Oracles/filterEvents?hasBet=false&toDate=2022-03-12T18%3A54%3A16.472Z&fromDate=${moment().toISOString()}&eventsFilter=Upcoming`, async function (err, httpResponse, events) {
            if (err) {
                reject('Error');
            }
            for (var i = 0; i < 1; i++) {
                await placeBet(JSON.parse(events)[i]).then(function(msg){
                    console.log(msg);
                }).catch(function(err){
                    console.log(err);
                });
            }
            resolve('New Bets Placed');
        });
    });
}

function placeBet(event) {
    return new Promise(function (resolve, reject) {
        console.log('Placing bet : ' + event.title);

        request.post(`http://localhost:5000/api/Bets/placeBet?betType=0&eventOutputId=${event.eventOutputs[0].id}&headToHeadForcast=true&payoutRate=2&calcNetFeeOnly=false&wager=0.003437`, function (err, httpResponse, resp) {
            if (err) {
                console.log(err);
                reject('Error');
            }
            resolve('Bet placed');
        });
    });
}

exports.loadBetsRemoteID = function(target){
    var targetBetsRemoteID = [];
    return new Promise(function (resolve, reject) {
        request.get('http://localhost:5000/api/Bets/filterBets?betIds=' + target, function (err, httpResponse, resp) {
            if (err) {
                console.log(err);
                reject('Error');
            }
            for(var i = 0 ; i < JSON.parse(resp).length ; i++){
                targetBetsRemoteID.push(JSON.parse(resp)[i].remoteId);
            }
            resolve(targetBetsRemoteID);
        });
    });
}