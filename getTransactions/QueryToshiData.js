'use strict';
var https = require('https'),
       fs = require('fs'),
        _ = require('lodash');

var blocks = [];
var toshiBlockPath = "https://bitcoin.toshi.io/api/v0/blocks/";

// block 336861 first block of 2015.
// block 381400 occured on October 31. 2015 (Bitcoin's Birthday)
blockRange(336861, 337861);

function blockRange(beginning, end) {
	for (var height = beginning; height <= end; height++) {
		// on average: 144 blocks per day.
		if (height % 72 == 0) {
			blocks.push(new Promise(resolve => {
  				var url = toshiBlockPath + height.toString();
  				https.get(url, res => {
            res.setEncoding('utf8');
            var tempBlockStorage = "";
            res.on('data', d => {
              tempBlockStorage += d;
            })
            res.on('end', () => {
              resolve(JSON.parse(tempBlockStorage));
            })
          })
      }));
	  }
	}
}

var toshiTxPath = "https://bitcoin.toshi.io/api/v0/transactions/";
var transactionHashes = [];
var transactions = [];

Promise.all(blocks).then(blocks => {
	_.forEach(blocks, el => _.forEach(el.transaction_hashes, tx => {
        transactionHashes.push(tx);
    }))
    for (let j = 1; j <= transactionHashes.length; j += 50) {
      var url = toshiTxPath + transactionHashes[j];
      transactions.push(new Promise(resolve => https.get(url, res => {
          res.setEncoding('utf8');
          var tempTxStorage = "";
          res.on('data', d => {
            tempTxStorage += d;
          })
          res.on('end', () => {
            resolve(JSON.parse(tempTxStorage));
          })
      })))
    }

    let filteredTransactions = [];

    Promise.all(transactions).then(transactions => {
      _.forEach(transactions, tx => {
          let pcFee = tx.fees / tx.amount;
          filteredTransactions.push({
            hash: tx.hash,
            timestamp: tx.block_time,
            volume: tx.amount,
            transaction_fees: tx.fees,
            percentage_fee: pcFee
        });
      });
      //console.log(filteredTransactions)
      module.exports = filteredTransactions;
    })
});
