'use strict';
let bitcoin = require('bitcoin');
let _ = require('lodash');

var client = new bitcoin.Client({
  host: 'localhost',
  port: 8332,
  user: 'bitcoinrpc',
  pass: 'BviubSoy6FtfhzBVgf3knuQr3M83L4EpGzzEsmHcJaDA',
  timeout: 30000
});

client.cmd('getblockhash', 300000, (err, blockhash, resHeaders) => {
    if (err) return console.log(err);
    client.cmd('getblock', blockhash, (err, block, resHeaders) => {
        if (err) return console.log(err);

        for (let i = 3; i <= 3; i++) {
          client.cmd('getrawtransaction', block.tx[i], 1, (err, tx, resHeaders) => {
            if (err) return console.log(err);
              _.forEach(tx.vin, (element) => {
                client.cmd('getrawtransaction', element.txid, 1, (err, inputvalue, resHeaders) => {
                  console.log(element.txid);
                  console.log(inputvalue.vout);
                })
              });

              /*
              console.log(tx.time);
              console.log(tx.vout);
              */
          })
        }
    })
});

// transaction fees = input - output
