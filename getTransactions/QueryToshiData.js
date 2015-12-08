'use strict';
var https = require('https'),
       fs = require('fs'),
        _ = require('lodash');

// var dummyExchangeRate = 300.0;

var blocks = [];
var toshiBlockPath = "https://bitcoin.toshi.io/api/v0/blocks/";
var toshiTxPath = "https://bitcoin.toshi.io/api/v0/transactions/";
var transactions = [];

function blockRange(beginning, end) {
	for (var height = beginning; height <= end; height++) {
		// on average: 144 blocks per day.
		if (height % 1 == 0) {
			blocks.push(new Promise(resolve => {
				var url = toshiBlockPath + height.toString();
				https.get(url, res => {
				    res.setEncoding('utf8');
				    res.on('data', d => {resolve(JSON.parse(d))});
		    })
            }));
		}
	}
}

// block 336861 is the first block of 2015.
// block 381400 occured on October 31. 2015 (Bitcoin's Birthday)
blockRange(100001, 100001);

var transactionHashes = [];

Promise.all(blocks).then(blocks => {
	_.forEach(blocks, el => _.forEach(el.transaction_hashes, tx => {
        transactionHashes.push(tx);
        _.forEach(transactionHashes, hash => {
            var url = toshiTxPath + hash;
            transactions.push(new Promise(resolve => https.get(url, res => {
                res.setEncoding('utf8');
                res.on('data', d => resolve(JSON.parse(d)));
            })))
        });

        Promise.all(transactions).then(transactions => {
            _.forEach(transactions, n => {
                let wat = "volume: " + n.amount + ', ' + "fees: " + n.fees +"\n";

                fs.appendFile("transactions", wat, 'utf8', (err) => {
                    if (err) throw err;
                } )

            })
	    })
    }))
});