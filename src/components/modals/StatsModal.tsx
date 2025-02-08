import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Grid,
  Text,
  Image,
  Box,
  Progress,
  Flex,
} from "@chakra-ui/react";

// Import your logos
import gameOverBg from "../../assets/bgs/game-over-bg.svg";
import statisticsIcon from "../../assets/basics/stats-icon.svg";
import arzLogo from "../../assets/basics/powered-by-arz.svg";
// import closeIcon from "../../assets/basics/close-icon.png";
interface StockStat {
  count: number;
  maxWinners: number;
  cost: number;
}

interface StockStatData {
  name: string;
  count: number;
  remaining: number;
  max: number;
  cost: number; // Added cost field
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: number[];
  currentSpinIndex: number;
  segments: Array<{
    stockName: string;
    maxWinners: number;
    image: string;
    [key: string]: any; // Allow other properties
  }>;
}
const StatsModal = ({
  isOpen,
  onClose,
  pool,
  currentSpinIndex,
  segments,
}: StatsModalProps) => {
  // Calculate total cost of all spins
  const totalCost = pool
    .slice(0, currentSpinIndex)
    .reduce((sum, index) => sum + parseFloat(segments[index].currentPrice), 0);

  // Modified reducer to include cost calculation
  const stockStats = segments.reduce<Record<string, StockStat>>(
    (acc, segment, idx) => {
      const stockName = segment.stockName;
      if (!acc[stockName]) {
        acc[stockName] = {
          count: 0,
          maxWinners: 0,
          cost: 0,
        };
      }
      acc[stockName].maxWinners += segment.maxWinners;

      // Add cost for spins that have already occurred
      const spinsForStock = pool
        .slice(0, currentSpinIndex)
        .filter((i) => i === idx).length;

      acc[stockName].cost += spinsForStock * parseFloat(segment.currentPrice);
      return acc;
    },
    {}
  );

  // Calculate actual counts from pool
  pool.slice(0, currentSpinIndex).forEach((index) => {
    const stockName = segments[index].stockName;
    stockStats[stockName].count++;
  });

  const statsData: StockStatData[] = Object.entries(stockStats).map(
    ([name, data]) => ({
      name,
      count: data.count,
      remaining: data.maxWinners - data.count,
      max: data.maxWinners,
      cost: data.cost,
    })
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"5xl"}>
      <ModalOverlay />
      <ModalContent
        bg={`url(${gameOverBg})`}
        bgRepeat={"no-repeat"}
        bgSize={"cover"}
        border={"1vh solid #1ED760"}
        borderRadius="xl"
        color="white"
      >
        <ModalHeader textAlign="center" py={4}>
          <Image
            src={statisticsIcon}
            w="200px"
            mx="auto"
            mb={2}
            alt="Statistics"
          />
          <Text fontSize="2xl" fontWeight="bold" color="#FFB800">
            Total Spins: {currentSpinIndex}{" "}
            <Text
              as={"span"}
              color={"red"}
              cursor={"pointer"}
              onClick={() => {
                localStorage.clear();
                window.location.reload();
                onClose();
              }}
            >
              Reset
            </Text>
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} px={8}>
          <Grid templateColumns="repeat(5, 1fr)" gap={4} alignItems="center">
            <Text fontWeight="bold" color="#1ED760">
              Stock
            </Text>
            <Text fontWeight="bold" color="#1ED760" textAlign="center">
              Remaining
            </Text>
            <Text fontWeight="bold" color="#1ED760" textAlign="center">
              Total
            </Text>
            <Text fontWeight="bold" color="#1ED760" textAlign="center">
              Cost
            </Text>
            <Text fontWeight="bold" color="#1ED760" textAlign="center">
              Progress
            </Text>

            {statsData.map((stat, i) => (
              <Box key={stat.name} gridColumn="1 / -1" display="contents">
                <Flex align="center" gap={3}>
                  <Image
                    src={segments[i].image}
                    boxSize="40px"
                    objectFit="contain"
                    filter={stat.name === "Lost" ? "invert(1)" : "none"}
                    alt={stat.name}
                  />
                  <Text>{stat.name}</Text>
                </Flex>
                <Text textAlign="center">{stat.remaining}</Text>
                <Text textAlign="center">{stat.count}</Text>
                <Text textAlign="center" color="#FFB800">
                  SAR {stat.cost.toFixed(2)}
                </Text>
                <Progress
                  value={(stat.count / stat.max) * 100 || 0}
                  colorScheme="green"
                  height="20px"
                  borderRadius="md"
                  bg="gray.700"
                />
              </Box>
            ))}
          </Grid>

          <Flex justify="space-between" mt={8} px={4}>
            <Image src={arzLogo} w="200px" opacity={0.8} alt="Powered by ARZ" />
            <Flex direction="column" align="flex-end">
              <Text fontSize="xl" color="#FFB800">
                Total Cost: SAR {totalCost.toFixed(2)}
              </Text>
              <Text fontSize="sm" color="gray.400">
                (Sum of all spin values)
              </Text>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default StatsModal;
