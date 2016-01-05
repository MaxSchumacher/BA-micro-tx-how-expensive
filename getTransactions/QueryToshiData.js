'use strict';
var https = require('https'),
       fs = require('fs'),
        _ = require('lodash');

var blocks = [];
var toshiBlockPath = "https://bitcoin.toshi.io/api/v0/blocks/";

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('December2015');

// block 332363: first block of December 2014.
// block 386118: first block of December 2015.

// Stress test period: 361900: Shortly before the stress-test until 362200 (two days later)
//end of two week december 2015: 388135
blockRange(386779, 391120);
let averageExchangeRate = 421.549;

function blockRange(beginning, end) {
  let rangeOfBlocks = end - beginning;
  // on average: (6 * 24) = 144 blocks per day.
  let blockSampleSize = 72;
  let numberOfBlockQueries = Math.round(rangeOfBlocks/blockSampleSize) + 1;
  console.log("Initiating " + numberOfBlockQueries + " sample queries over " + rangeOfBlocks + " blocks.");

  for (var height = beginning; height <= end; height++) {
		if (height % blockSampleSize == 0) {
			blocks.push(new Promise(resolve => {
  				var url = toshiBlockPath + height.toString();
  				https.get(url, res => {
            res.setEncoding('utf8');
            var tempBlockStorage = "";
            res.on('data', d => {
              tempBlockStorage += d;
            });
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
    }));
    let numberOfTransactions = transactionHashes.length;
    console.log(numberOfTransactions + " transactions extracted, initiating queries ...");
    for (let j = 1; j <= transactionHashes.length; j += 50) {
      var url = toshiTxPath + transactionHashes[j];
      transactions.push(new Promise(resolve => https.get(url, res => {
          res.setEncoding('utf8');
          var tempTxStorage = "";
          res.on('data', d => {
            tempTxStorage += d;
          });
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
          let dollarVolume = (tx.amount * Math.pow(10,-8)) * averageExchangeRate;
          let percentage_fee = tx.fees / tx.amount;
          filteredTransactions.push({
            hash: tx.hash,
            timestamp: tx.block_time,
            dollarVolume: dollarVolume,
            volume: tx.amount,
            transaction_fees: tx.fees,
            percentage_fee: percentage_fee
        });
      });

      db.serialize(function() {
        let tableCreation =
          "CREATE TABLE transactions" +
          "(hash TEXT, timestamp DATE, dollarVolume NUMBER, volume NUMBER, transaction_fees NUMBER, percentage_fee REAL)"
        db.run(tableCreation, [], () => {
          _.forEach(filteredTransactions, tx => {
            let tempQuery =
              "INSERT INTO transactions" +
              "(hash, timestamp, dollarVolume, volume, transaction_fees, percentage_fee) VALUES (" +
              `"${tx.hash}"` + "," +
              `"${tx.timestamp}"` + "," +
              `${tx.Dollarvolume}` + "," +
              `${tx.volume}` + "," +
              `${tx.transaction_fees}` + "," +
              `${tx.percentage_fee}` +
            ")";
            db.run(tempQuery);
            console.log(tempQuery);
          });
          db.close(() => {
            console.log("Insertion into database complete.")
          });
        });
      });
    })
});
