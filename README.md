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

The Javascript files were tested with node v.5.0.0 available here:
https://nodejs.org/en/. The code utilizes features from ES2015, such as lexical
scope via let or arrow functions.

## Toshi: QueryToshiData.js

Initially, the program queries Coinbase's Toshi remotely (over the internet)
via their REST-API, an approach that not feasible for the getting volumes and
fees for

The setup is a local instance of Coinbase's Toshi Bitcoin-node, it stores
Blockchain-data within a Postgres-database which makes it easier to quickly run
large, fine-grained queries.

## Bitcoin-Core: JSON-RPC

The data-source for Bitcoin transactions themselves, namely timestamps,
transaction-hashes, volumes transacted and fees are pulled out of version 0.11.2
of bitcoin-core.

In order to use the full API of bitcoin-core, bitcoind (or bitcoin-qt, which in
turn invokes bitcoind) have to be run with the flags "-reindex" and "-txindex"
after the local blockchain is in sync with the overall network.

The JSON-RPC-API is queried via the node-bitcoin package, available here:
https://www.npmjs.com/package/bitcoin

## SQLite

The results from the JS-scripts are written into a local SQLite instance via the
sqlite3 package (https://www.npmjs.com/package/sqlite3). The idea here is to
be able to run SQL queries on the large dataset.

## R/R-Studio

The aforementioned queries are executed out of R within R-Studio, to get the
results in R's native format. The R-package supplying this functionality is
sqldf, availabe here: https://github.com/ggrothendieck/sqldf


## Exchange rates per block

Microtransactions are being viewed in a US-Dollar context to make them more
relatable (cup of coffee, song on iTunes, mobile app). To accomplish this, a
transaction's volume (amount) has to be expressed in USD at (roughly) the time
of the transaction.
