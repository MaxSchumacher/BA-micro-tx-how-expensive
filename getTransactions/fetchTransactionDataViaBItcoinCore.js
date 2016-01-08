'use strict';

let bitcoin = require('bitcoin'),
          _ = require('lodash'),
         fs = require('fs'),
      async = require('async');

const fileNameToWriteResultsTo = "BACKUPFullYear2015.csv";

const concurrency = 20, // Of async.queue payload.
       sampleSize = 24; // Taking a sample of 6 blocks per day (144/24)

//block-ranges to fetch
const start = 336861, // first block of 2015
        end = 391182; // first block of 2016

const client = new bitcoin.Client({
    host: 'localhost',
    port: 8332,
    user: 'bitcoinrpc',
    pass: 'BviubSoy6FtfhzBVgf3knuQr3M83L4EpGzzEsmHcJaDA',
    timeout: 99999999
});

const fetchBlockHashes = (height) => {
  const blockHashes = [];
    blockHashes.push(new Promise(resolve => {
        client.cmd('getblockhash', height, (err, blockhash) => {
            if (err) return console.log('getblockhash error: ' + err);
            resolve(blockhash);
        });
    }));
  return Promise.all(blockHashes);
};

const fetchBlocks = (hashes) => {
  const blocks = [];
  for (const hash of hashes) {
    blocks.push(new Promise(resolve => {
      client.cmd('getblock', hash, (err, block) => {
        if (err) return console.log('getblock error: ' + err);
        resolve(block);
      });
    }))
  }
  return Promise.all(blocks);
};

const getTransactionHashes = (blocks) => {
  const transactionHashes = [];
  for (const block of blocks) {
    let numberOfTransactions = block.tx.length;
      //index starts at 1 to avoid coinbase transactions.
    for (let index = 1; index <= numberOfTransactions - 1; index++) {
      if (typeof block.tx[index] == 'string') { //exclude broken hashes
        transactionHashes.push(block.tx[index]);
      }
    }
  }
  return transactionHashes;
};

const fetchAndCalculateTransactioncosts = (transaction) => {
        let timestamp = transaction.time;
        let input = new Promise(resolve => {
            resolve(fetchAndSumInputs(transaction))
        });
        let output = sumOutputs(transaction);
        return Promise.all([timestamp, input, output]);
};

const getrawtransaction = (txs) => {
    if (typeof txs != 'string') console.log("Invalid hash, not a string.");
    return new Promise(resolve => {
        client.cmd('getrawtransaction', txs, 1, (err, tx) => {
            if (err) return console.log('getrawtransaction: ' + err);
            resolve(tx);
        })
    });
};

const fetchAndSumInputs = (tx) => {
    let vin = tx.vin;
    let singleValues = [];
    _.forEach(vin, inputs => {
        singleValues.push(new Promise(resolve => {
            getrawtransaction(inputs.txid).then(transaction => {
                resolve(transaction.vout[inputs.vout].value);
            });
        }))
    });
    return Promise.all(singleValues).then(values => _.sum(values));
};

const sumOutputs = (tx) => {
    let sum = 0;
    _.forEach(tx.vout, output => {
        sum += output.value;
    });
    return sum;
};

//fails for transactions with lots of inputs (too many simultaneous requests)
let q = async.queue((transactions, callback) => {
    getrawtransaction(transactions)
        .then(fetchAndCalculateTransactioncosts)
        .then(result => {
            fs.appendFile("../data/" + fileNameToWriteResultsTo,
                `${result[0]}` + ", " +
                `${result[1]}` + ", " +
                `${result[1] - result[2]}` +"\n"
            );
            callback();
        }
    );
}, concurrency);

const getBlockRange = (start, end) => {
    for (let height = start; height <= end; height++) {
        if (height % sampleSize == 0) {
            fetchBlockHashes(height)
                .then(fetchBlocks)
                .then(getTransactionHashes)
                .then(transactionHashes => {
                    for (let transactions of transactionHashes) {
                        q.push(transactions, function (err) {
                            if (err) throw err;
                        });
                    }
                })
        }
    }
};

getBlockRange(start, end);