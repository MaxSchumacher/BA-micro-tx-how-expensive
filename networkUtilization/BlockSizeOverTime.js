'use strict';
let bitcoin = require('bitcoin');
let _       = require('lodash');
let fs      = require('fs');
var generate = require('csv-generate');

var client = new bitcoin.Client({
  host: 'localhost',
  port: 8332,
  //adjust this to your own values, defined in .bitcoin/bitcoin.conf
  user: 'bitcoinrpc',
  pass: 'BviubSoy6FtfhzBVgf3knuQr3M83L4EpGzzEsmHcJaDA',
  timeout: 30000
});

function getBlockHash(height) {
  client.cmd('getblockhash', height, (err, blockhash, resHeaders) => {
    if (err) return console.log(err);
    getBlock(blockhash);
  })
}

function getBlock(blockhash) {
  client.cmd('getblock', blockhash, (err, block, resHeaders) => {
    if (err) return console.log(err);
    getBlockSize(block);
  });
}

function getBlockSize(block) {
 let averageTransactionSize = 0
 let packet = `${block.time}` + ", " + `${block.size}\n`
 fs.appendFile("BlockSizes", packet, (err) => {
   if (err) throw err;
 })
}

for (let i = 332363; i <= 386118; i += 1) {
  getBlockHash(i);
}
