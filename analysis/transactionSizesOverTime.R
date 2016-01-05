# How can the relationship between network utilization and transaction costs be shown?
# network utilization: Query all blocks and add 72 of them together to get average.
# if we have statements about the average transaction size, we might be able to skip this step

TransactionSizeData <- read.csv("/home/max/Documents/BA-micro-tx-how-expensive/networkUtilization/sizeData")
TransactionSizeData <- subset(TransactionSizeData, TransactionSizeData[[2]] <= 3000)

library(ggplot2)

ggplot(TransactionSizeData, aes(x = TransactionSizeData[[1]], y = TransactionSizeData[[2]])) +
  geom_point(shape=1)+
  geom_smooth(method=lm)


