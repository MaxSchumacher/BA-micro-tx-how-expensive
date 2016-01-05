'use strict';
let bitcoin = require('bitcoin');
let _       = require('lodash');
let fs      = require('fs');

const client = new bitcoin.Client({
  host: 'localhost',
  port: 8332,
  user: 'bitcoinrpc',
  pass: 'BviubSoy6FtfhzBVgf3knuQr3M83L4EpGzzEsmHcJaDA',
  timeout: 1000000
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

/*var cargo = async.cargo((tasks, callback) => {
    for ( let i = 0; i < tasks.length; i++) {
        console.log('hello ' + tasks[i].name);
    }
    callback();
}, 30);

cargo.push();*/

for (let height = 330000; height <= 331000; height++) {
    //Taking a sample of 6 blocks per day (144/24)
    if (height % 24 == 0) {
        fetchBlockHashes(height)
        .then(fetchBlocks)
        .then(getTransactionHashes)
        .then(transactionHashes => {
            for (let transactions of transactionHashes) {
                (getrawtransaction(transactions))
                    .then(fetchAndCalculateTransactioncosts)
                    .then(result => {
                        fs.appendFile("transactionData.csv",
                            `${result[0]}` + ", " +
                            `${result[1]}` + ", " +
                            `${result[1]-result[2]}` +"\n"
                        )});
            }
        })
    }
}