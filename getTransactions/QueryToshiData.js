'use strict';
var https = require('https'),
       fs = require('fs'),
        _ = require('lodash');

var blocks = [];
var toshiBlockPath = "https://bitcoin.toshi.io/api/v0/blocks/";

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('blockChainData');

// block 336861 first block of 2015.
// block 381400 occured on October 31. 2015 (Bitcoin's Birthday)
blockRange(336861, 336861);

//Todo: implement warning for number of queries (approximation)

function blockRange(beginning, end) {
	for (var height = beginning; height <= end; height++) {
		// on average: 144 blocks per day.
		if (height % 1 == 0) {
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
  let numberOfBlocks = blocks.length;
  console.log(numberOfBlocks + " blocks received, starting extraction of transactions ...")
	_.forEach(blocks, el => _.forEach(el.transaction_hashes, tx => {
        transactionHashes.push(tx);
    }))
    let numberOfTransactions = transactionHashes.length;
    console.log(numberOfTransactions + " transactions extracted, initiating queries ...");
    for (let j = 1; j <= transactionHashes.length; j += 200) {
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
        let txSampleSize = transactions.length;
        console.log(txSampleSize + " transactions received, filtering now ...");
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
      db.serialize(function() {
        let tableCreation =
          "CREATE TABLE transactions" +
          "(hash TEXT, timestamp DATE, volume NUMBER, transaction_fees NUMBER, pcFee NUMBER)"
        db.run(tableCreation, [], () => {
          _.forEach(filteredTransactions, tx => {
            let tempQuery =
              "INSERT INTO transactions" +
              "(hash, timestamp, volume, transaction_fees, pcFee) VALUES (" +
              `"${tx.hash}"` + "," +
              `"${tx.timestamp}"` + "," +
              `${tx.volume}` + "," +
              `${tx.transaction_fees}` + "," +
              `${tx.percentage_fee}` +
            ")";
            db.run(tempQuery);
          })
          db.close(() => {
            console.log("Insertion into database complete.")
          });
        });
      });
    })
});
