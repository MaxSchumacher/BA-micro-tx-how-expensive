exchangeRatesBitcoin <- read.csv("/home/max/Documents/BA-micro-tx-how-expensive/data/COINBASE-USD.csv")
exchangeRatesBitcoin <- data.frame(exchangeRatesBitcoin$Date, exchangeRatesBitcoin$Open)

library(ggplot2)
ggplot(exchangeRatesBitcoin, aes(x=exchangeRatesBitcoin$exchangeRatesBitcoin.Date, y=exchangeRatesBitcoin$exchangeRatesBitcoin.Open, group=1)) +
  geom_line() +
  expand_limits(y=0) +
  xlab("December 2014 to December 2015") + ylab("$/BTC") +
  ggtitle("Dollar Bitcoin Exchange Rate December 2014 to December 2015")

