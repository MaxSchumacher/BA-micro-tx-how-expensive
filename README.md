# Microtransactions in Bitcoin: How expensive are they really?

This repository contains all files with which the analysis for 
my Bachelor thesis are conducted.

Publishing every line of code is an attempt at maximum
transparency (which methods were used? Did errors in the implementation lead to
wrong conclusions?) and reproducability (running the code in the repository should 
lead to the exact same data-set the initial research was conducted on).

Using git for version control also serves as a universal undo button throughout
the entire project.

Generally speaking, code for web Queries is implemented in node (v4.2.1) while
the local Toshi instance is queried in SQL directly. Statistical analysis and
visualization are conducted in R (within the RStudio-IDE).

## Toshi: QueryToshiData.js

Initially, the program queries Coinbase's Toshi remotely (over the internet) 
via their REST-API, an approach that not feasible for the getting volumes and 
fees for all transactions since 01/01/2015 until 10/31/2015 
(Bitcoin's "Birthday"): Roughly 40 million transactions in 48000 blocks.

The setup is a local instance of Coinbase's Toshi Bitcoin-node, it stores
Blockchain-data within a Postgres-database which makes it easier to quickly run
large, fine-grained queries.

## Bitcoin-Core: JSON-RPC

Bitcoin-core's API is also put to the test, to get a better feel for
the data.

## Coinbase-exchange: getExchangeRates.js

Microtransactions are being viewed in a US-Dollar context to make them more
relatable (cup of coffee, song on iTunes, mobile app). To accomplish this, a 
transaction's volume (amount) has to be expressed in USD at (roughly) the time 
of the transaction.

The individual exchange rates are obtained via Coinbase's Exchange API, the time
of a transaction's first confirmation (the first block the transaction appeared
in) is used.

