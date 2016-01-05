# How can the relationship between network utilization and transaction costs be shown?
# network utilization: Query all blocks and add 72 of them together to get average.
# if we have statements about the average transaction size, we might be able to skip this step

BlockSizes <- read.csv("/home/max/Documents/BA-micro-tx-how-expensive/networkUtilization/BlockSizes")

library(ggplot2)

ggplot(BlockSizes, aes(x = BlockSizes[[1]], y = BlockSizes[[2]])) +
  geom_point(shape=1)+
  geom_smooth(method=lm)


