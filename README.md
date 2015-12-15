# Microtransactions in Bitcoin: How expensive are they really?

This repository contains all files with which the analysis the Bachelor thesis
regarding microtransactions in Bitcoin was conducted.

Publishing every line of code is an attempt at maximum
transparency (which methods were used? Did conceptual or implementation errors
lead to wrong conclusions?) and reproducability (running the code in the
repository should lead to the exact same data-set and Statistical results my
research is based on).

Using git for version control also serves as a universal "undo button" throughout
the entire project.

## the code

The Javascript files were tested with node v5.2.0 available here:

[Node.js](https://nodejs.org/en/ "Node.js")

The code relies on features from ES2015, such as lexical
scope via let, arrow functions, Promises and template strings, thus a modern
version of node.js is needed.

## Toshi: QueryToshiData.js

install via ``npm install lodash sqlite3``

The data-source for Bitcoin transactions, namely timestamps,
transaction-hashes, volumes transacted and fees are from pulled
Coinbase's Toshi API remotely:

[Toshi API Documentation](https://toshi.io/docs/ "Toshi API Documentation")

## Bitcoin-Core - JSON-RPC: bitcoincore.js

Data about network utilization (Daily averages of block-size) is provided via verison 0.11.2 of bitcoin-core.

In order to use the full API of bitcoin-core, bitcoind (or bitcoin-qt, which in
turn invokes bitcoind) have to be run with the flags "-reindex" and "-txindex"
after the local blockchain is in sync with the overall network.

The JSON-RPC-API is queried via the node-bitcoin package, available here:
[NPM bitcoin package](https://www.npmjs.com/package/bitcoin "NPM bitcoin package"),
 install it via ``npm install bitcoin``.

## SQLite

The results from the JS-scripts are written into a local SQLite instance via the
sqlite3 package (https://www.npmjs.com/package/sqlite3). The idea here is to
be able to run SQL queries on the large dataset.

## R/R-Studio

The aforementioned queries are executed out of R within R-Studio, to get the
results in R's native format. The R-package supplying this functionality is
sqldf, availabe here: https://github.com/ggrothendieck/sqldf
