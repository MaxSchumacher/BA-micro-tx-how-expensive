marketcapdata <- read.csv("/home/max/code/Code-for-Microtransaction-in-Bitcoin-how-expensive-are-they-really-/graphs/bitcoinmarketcap2015.csv",
                          stringsAsFactors=F);

marketcapdatacleaned.shortDate = NULL;
marketcapdatacleaned.billion = NULL;

#start at position 25 in the array, that's the first of January.

for (i in 25:nrow(marketcapdata)) {
  #marketcapdatacleaned.shortDate[i,1] = marketcapdata[i,1];
  marketcapdatacleaned.billion[i,2] <- marketcapdata[i,2] #/1000000000;
}

plot(marketcapdata,
     marketcapdatacleaned.billion,
     main="Market capizalization Bitcoin 2015",
     xlab="time",
     ylab="market cap in $bn",
     col="blue"
)
