exchangeRatesBitcoin <- read.csv("../data/BTCexchangeRate2015FromBlockchainINFO.csv")
#install.packages("scales")

exchangeRatesBitcoin$Date <- as.Date(exchangeRatesBitcoin$Date)

library(ggplot2)
library(scales)

datebreaks <- seq(as.Date("2015-01-01"), 
                  as.Date("2015-12-31"), 
                  by="1 month")

ggplot(exchangeRatesBitcoin, 
       aes(x=exchangeRatesBitcoin$Date, 
           y=exchangeRatesBitcoin$Value,
           group=1)
       ) +
  geom_line(colour="#000099") +
  ggtitle("Dollar Bitcoin Exchange Rate Full Year 2015") +
  xlab("Full Year 2015") + 
  ylab("$/BTC") +
  scale_x_date(breaks=datebreaks,
               labels=date_format("%m")) 