// Game.tsx
import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Grid,
  extendTheme,
  Image,
  useDisclosure,
  Center,
  Box,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { PlinkoSegments } from "../constants/constants";
import WinModal from "../components/modals/WinModal";
import plinkoBg from "../assets/bgs/plinko-bg.svg";
import awaedLogoGreen from "../assets/basics/awaed-green-logo.svg";
import GameOver from "../components/GameOver";
import arzLogo from "../assets/basics/powered-by-arz.svg";
import awaedWritten from "../assets/basics/logo-written.svg";
import countIcon from "../assets/basics/count-icon.svg";
import statisticsButton from "../assets/basics/statistics-button.svg";
import StatsModal from "../components/modals/StatsModal";

// Create a motion-enabled Box component.
const MotionBox = motion.div;

// Define the type for each game board box.
type BoxData = {
  id: number;
  value: number;
  revealed: boolean;
};

// Create a weighted pool function using all available Plinko segments.
const createPool = (): number[] => {
  const pool: number[] = [];
  PlinkoSegments.forEach((segment, index) => {
    for (let i = 0; i < segment.maxWinners; i++) {
      pool.push(index);
    }
  });
  // Shuffle the pool using the Fisher–Yates algorithm.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
};

// Define variants for the card flip animation.
const cardVariants = {
  hidden: { rotateY: 0, scale: 1 },
  revealed: {
    rotateY: 180,
    transition: { duration: 0.6 },
  },
  winning: {
    rotateY: 180,
    scale: [1, 1.2, 1],
    transition: { duration: 1, repeat: Infinity },
    border: "2px solid #1ed760",
    boxShadow: "0 0 10px 5px #1ed760",
  },
};

// Define the main Game component.
const Game: React.FC = () => {
  const [board, setBoard] = useState<BoxData[]>([]);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [pool, setPool] = useState<number[]>([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);

  // Configure the Win Modal disclosure.
  const {
    isOpen: isWinModalOpen,
    onOpen: openWinModal,
    onClose: closeWinModal,
  } = useDisclosure();

  // Set a responsive card size using breakpoints.
  const cardSize = useBreakpointValue({
    base: "150px",
    md: "200px",
    lg: "200px",
  });

  // Function to initialize the pool.
  const initializePool = () => {
    const newPool = createPool();
    setPool(newPool);
    setCurrentGameIndex(0);
    const dataToSave = {
      currentSpinIndex: 0,
      pool: newPool,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem("spinWheelData", JSON.stringify(dataToSave));
  };

  // Load saved pool data or initialize a new pool on component mount.
  useEffect(() => {
    const savedData = localStorage.getItem("spinWheelData");
    if (savedData) {
      const {
        currentSpinIndex: savedSpinIndex,
        pool: savedPool,
        timestamp,
      } = JSON.parse(savedData);
      const currentTime = new Date().getTime();
      const twentyHoursInMs = 20 * 60 * 60 * 1000;
      if (currentTime - timestamp < twentyHoursInMs) {
        setCurrentGameIndex(savedSpinIndex);
        setPool(savedPool);
        return;
      } else {
        localStorage.removeItem("spinWheelData");
      }
    }
    initializePool();
  }, []);

  // Save pool and currentGameIndex changes to localStorage.
  useEffect(() => {
    if (pool.length > 0) {
      const dataToSave = {
        currentSpinIndex: currentGameIndex,
        pool,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("spinWheelData", JSON.stringify(dataToSave));
    }
  }, [currentGameIndex, pool]);

  // When the pool is ready, generate a new game board using the next weighted winning index.
  useEffect(() => {
    if (pool.length > 0) {
      const targetPrizeIndex = pool[currentGameIndex];
      // Advance the pointer for the next game.
      setCurrentGameIndex((prev) => prev + 1);
      const newBoardData = generateBoard(targetPrizeIndex);
      setBoard(newBoardData.board);
      setWinningIndex(targetPrizeIndex);
      setGameWon(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  function getTwoDistinctRandomIndices<T>(
    arr: T[],
    excludeIndex: number
  ): [number, number] {
    // Validate the excluded index.
    if (excludeIndex < 0 || excludeIndex >= arr.length) {
      throw new Error("Excluded index is out of bounds.");
    }

    // Create an array of valid indices, excluding the provided index.
    const validIndices = arr
      .map((_, index) => index)
      .filter((index) => index !== excludeIndex);

    // Ensure that there are at least two valid indices to choose from.
    if (validIndices.length < 2) {
      throw new Error(
        "Not enough valid elements to select two distinct indices."
      );
    }

    // Randomly pick the first valid index.
    const firstIndex =
      validIndices[Math.floor(Math.random() * validIndices.length)];

    // Randomly pick the second valid index and ensure it's different from the first.
    let secondIndex =
      validIndices[Math.floor(Math.random() * validIndices.length)];
    while (secondIndex === firstIndex) {
      secondIndex =
        validIndices[Math.floor(Math.random() * validIndices.length)];
    }

    return [firstIndex, secondIndex];
  }
  // Generate a new game board.
  // The board is filled with one copy of each available PlinkoSegment (all 10),
  // plus 2 extra copies of the predetermined winning segment (total of 12 boxes).
  const generateBoard = (
    winningIdx: number
  ): { board: BoxData[]; winningIndex: number } => {
    const uniqueIndexes = Array.from(
      { length: PlinkoSegments.length },
      (_, i) => i
    );
    const [randIdx1, randIdx2] = getTwoDistinctRandomIndices<{
      image: string;
      currentPrice: string;
      stockName: string;
      maxWinners: number;
    }>(PlinkoSegments, winningIdx);
    uniqueIndexes[randIdx1] = randIdx2;
    const extraValues: number[] = [winningIdx, winningIdx];
    const allValues = [...uniqueIndexes, ...extraValues];
    allValues.sort(() => Math.random() - 0.5);
    const boardData = allValues.map((value, index) => ({
      id: index,
      value,
      revealed: false,
    }));
    return { board: boardData, winningIndex: winningIdx };
  };

  // Handle a box click by revealing the box.
  const handleBoxClick = (id: number) => {
    if (gameWon) return;
    setBoard((prevBoard) =>
      prevBoard.map((box) =>
        box.id === id && !box.revealed ? { ...box, revealed: true } : box
      )
    );
  };

  // Check if any revealed segment appears three times.
  useEffect(() => {
    const counts: Record<number, number> = {};
    board.forEach((box) => {
      if (box.revealed) {
        counts[box.value] = (counts[box.value] || 0) + 1;
      }
    });
    for (const key in counts) {
      if (counts[key] >= 3) {
        setGameWon(true);
        break;
      }
    }
  }, [board]);

  // On win, reveal all boxes.
  useEffect(() => {
    if (gameWon) {
      setBoard((prevBoard) =>
        prevBoard.map((box) => ({ ...box, revealed: true }))
      );
    }
  }, [gameWon]);

  // When the game is won, open the Win Modal.
  useEffect(() => {
    if (gameWon && winningIndex !== null) {
      setTimeout(() => {
        openWinModal();
      }, 700);
    }
  }, [gameWon, winningIndex, openWinModal]);

  // Reset the game (this function no longer closes the modal).
  const resetGame = () => {
    if (pool.length > 0) {
      const targetPrizeIndex = pool[currentGameIndex];
      setCurrentGameIndex((prev) => prev + 1);
      const newBoardData = generateBoard(targetPrizeIndex);
      setBoard(newBoardData.board);
      setWinningIndex(targetPrizeIndex);
      setGameWon(false);
    }
  };

  // When the Win Modal is closed, reset the game.
  const handleWinModalClose = () => {
    closeWinModal();
    setTimeout(() => resetGame(), 2000);
  };

  const [toolBarVisible, setToolBarVisible] = useState(false);
  // Render the game UI.
  const [showGameOver, setShowGameOver] = useState(false);
  useEffect(() => {
    if (currentGameIndex >= 153) {
      const timer = setTimeout(() => {
        setShowGameOver(true);
      }, 7000); // Delay before showing game over

      return () => clearTimeout(timer);
    }
  }, [currentGameIndex]);
  const {
    isOpen: isStatsModalOpen,
    onOpen: onStatsModalOpen,
    onClose: onStatsModalClose,
  } = useDisclosure();
  if (currentGameIndex === 153 && showGameOver) {
    return <GameOver />;
  }
  return (
    <ChakraProvider
      theme={extendTheme({
        styles: {
          global: {
            body: { backgroundColor: "#f0f4f7", overflowX: "hidden" },
          },
        },
      })}
    >
      <Center
        bg={`url(${plinkoBg})`}
        minH="100vh"
        w="100vw"
        bgSize="cover"
        bgPosition="center"
      >
        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={4}
        >
          {board.map((box) => (
            // Wrap each card in a div that sets the perspective for a 3D flip.
            <div key={box.id} style={{ perspective: "800px" }}>
              <MotionBox
                initial="hidden"
                animate={
                  box.revealed
                    ? gameWon &&
                      winningIndex !== null &&
                      box.value === winningIndex
                      ? "winning"
                      : "revealed"
                    : "hidden"
                }
                variants={cardVariants}
                style={{
                  width: cardSize || "200px",
                  height: cardSize || "200px",
                  position: "relative",
                  transformStyle: "preserve-3d",
                  cursor: "pointer",
                }}
                onClick={() => handleBoxClick(box.id)}
              >
                {/* Front Face (card back) */}
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    borderWidth: "1px",
                    borderRadius: "0.375rem",
                    backgroundColor: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image src={awaedLogoGreen} alt="Card back" />
                </div>
                {/* Back Face (revealed image) */}
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    borderWidth: "1px",
                    borderRadius: "0.375rem",
                    backgroundColor: "#EDFDE1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    w="70%"
                    h="70%"
                    src={PlinkoSegments[box.value].image}
                    alt={PlinkoSegments[box.value].stockName}
                  />
                </div>
              </MotionBox>
            </div>
          ))}
        </Grid>
      </Center>

      {/* Win Modal: When closed, it resets the game */}
      <WinModal
        isOpen={isWinModalOpen}
        onClose={handleWinModalClose}
        currentPrice={
          winningIndex !== null ? PlinkoSegments[winningIndex].currentPrice : ""
        }
        stockName={
          winningIndex !== null ? PlinkoSegments[winningIndex].stockName : ""
        }
      />
      <Box
        bg="rgba(0,0,0,0.6)"
        w="100vw"
        position="absolute"
        bottom="0"
        left="0"
        py="3vw"
        pl="5vw"
        pr="5vw"
        zIndex={50}
      >
        <Image w="50vw" src={arzLogo} />
      </Box>
      <Center>
        <Image
          position="absolute"
          top="20vw"
          w="25vw"
          mb="1vw"
          src={awaedWritten}
        />
      </Center>
      <Box
        position="absolute"
        left="5vw"
        top="6.5vw"
        display="flex"
        flexDir="row"
        color="white"
        alignItems="center"
      >
        <Image w="6vw" src={countIcon} mr="2vw" />
        <Text
          as="span"
          fontSize="3vw"
          color={currentGameIndex === 153 ? "red" : "white"}
        >
          {currentGameIndex}/153
        </Text>
      </Box>
      <Box
        position="absolute"
        top="0"
        right="0"
        cursor="pointer"
        h="25vw"
        w="62vw"
        display="flex"
        zIndex="200"
        dir="rtl"
        onMouseEnter={() => setToolBarVisible(true)}
        onMouseLeave={() => setToolBarVisible(false)}
      >
        {toolBarVisible && (
          <Image
            cursor="pointer"
            onClick={onStatsModalOpen}
            src={statisticsButton}
            w="20vw"
            h="20vw"
          />
        )}
      </Box>
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={onStatsModalClose}
        pool={pool}
        currentSpinIndex={currentGameIndex}
        segments={PlinkoSegments}
      />
    </ChakraProvider>
  );
};

export default Game;
