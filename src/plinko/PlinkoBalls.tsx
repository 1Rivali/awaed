import {
  Box,
  Button,
  Center,
  Image,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { motion, useAnimation } from "framer-motion";
import React, { useEffect, useState } from "react";
import collideSound from "../assets/audio/plinko-1.mp3";
import countIcon from "../assets/basics/count-icon.svg";
import awaedWritten from "../assets/basics/logo-written.svg";
import ballIcon from "../assets/basics/plink-ball.svg";
import statisticsButton from "../assets/basics/statistics-button.svg";
import testIcon from "../assets/basics/tests-button.svg";
import plinkoBg from "../assets/bgs/plinko-bg.svg";
import { PlinkoSegments } from "../constants/constants";

import arzLogo from "../assets/basics/powered-by-arz.svg";
import dropBallIcon from "../assets/basics/drop-ball.svg";
import GameOver from "../components/GameOver";
import StatsModal from "../components/modals/StatsModal";
import TestsModal from "../components/modals/TestsModal";
import WinModal from "../components/modals/WinModal";
interface Position {
  x: number;
  y: number;
}

// Board dimensions and peg rows.
const BOARD_WIDTH = window.innerWidth * 0.7; // Adjust based on the screen size
const BOARD_HEIGHT = window.innerHeight * 0.5; // Adjust based on the screen size
const BOARD_ROWS = 9;

// Dimensions for the ball and peg.
const ballRadius = 20; // Ball diameter = 20px.
const pegRadius = 15; // Peg diameter = 8px.
const margin = 2;
const collisionOffset = ballRadius + pegRadius + margin; // e.g. 10 + 4 + 2 = 16px

// Vertical spacing between peg rows.
const PEG_SPACING_Y = BOARD_HEIGHT / (BOARD_ROWS + 1);

/**
 * Generate a triangular array of peg positions.
 *
 * - Row 0 has 1 peg.
 * - Row i has i+1 pegs.
 * - The pegs in each row are centered horizontally.
 */
const generateTriangularPegs = (): Position[][] => {
  const rows: Position[][] = [];
  const spacingX = BOARD_WIDTH / (BOARD_ROWS + 1);

  for (let i = 0; i < BOARD_ROWS; i++) {
    const pegRow: Position[] = [];
    const numPegs = i + 1;
    const rowWidth = (numPegs - 1) * spacingX;
    const startX = (BOARD_WIDTH - rowWidth) / 2;
    const y = (i + 1) * PEG_SPACING_Y;
    for (let j = 0; j < numPegs; j++) {
      const x = startX + j * spacingX;
      pegRow.push({ x, y });
    }
    rows.push(pegRow);
  }
  return rows;
};

// Create a Framer Motion–enabled Box.
const MotionBox = motion(Box);

// A simple sleep helper.
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Define 10 prizes.

// --- Transition settings for a faster, realistic motion ---

// For vertical drops we use a tween with "easeIn" to simulate acceleration under gravity.
// Duration is reduced from 0.5 to 0.3 seconds.
const realisticVerticalTransition = {
  type: "tween",
  ease: "easeIn",
  duration: 0.3,
};

// For horizontal moves we use an "easeInOut" tween.
// Duration is reduced from 0.3 to 0.2 seconds.
const realisticHorizontalTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2,
};

const PlinkoBalls: React.FC = () => {
  const [pegRows, setPegRows] = useState<Position[][]>([]);
  const [animating, setAnimating] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<number | null>(null);
  const controls = useAnimation();
  const [currentSpinIndex, setCurrentSpinIndex] = useState(0);
  const [pool, setPool] = useState<number[]>([]);
  // Generate the board once on mount.
  useEffect(() => {
    setPegRows(generateTriangularPegs());
  }, []);
  const createPool = () => {
    const pool: number[] = [];
    PlinkoSegments.forEach((segment, index) => {
      for (let i = 0; i < segment.maxWinners; i++) {
        pool.push(index);
      }
    });

    // Shuffle the pool using Fisher-Yates algorithm
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool;
  };
  useEffect(() => {
    const savedData = localStorage.getItem("spinWheelData");
    console.log("savedData:", savedData);
    if (savedData) {
      const {
        currentSpinIndex: savedSpinIndex,
        pool: savedPool,
        timestamp,
      } = JSON.parse(savedData);
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - timestamp;
      const twentyHoursInMs = 20 * 60 * 60 * 1000;

      if (timeDiff < twentyHoursInMs) {
        // Load saved data if 20 hours have not passed
        setCurrentSpinIndex(savedSpinIndex);
        setPool(savedPool); // Restore the saved pool
      } else {
        // Clear localStorage if 20 hours have passed
        localStorage.removeItem("spinWheelData");
        initializePool(); // Create a new pool
      }
    } else {
      // If no saved data exists, initialize the pool
      initializePool();
    }
  }, []);

  // Initialize the pool (only called once or when cache is cleared)
  const initializePool = () => {
    const newPool = createPool();
    setPool(newPool);
    // Save the new pool to localStorage
    const dataToSave = {
      currentSpinIndex: 0,
      pool: newPool,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem("spinWheelData", JSON.stringify(dataToSave));
  };

  // Save data to localStorage whenever currentSpinIndex or pool changes
  useEffect(() => {
    if (pool.length > 0) {
      const dataToSave = {
        currentSpinIndex,
        pool,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("spinWheelData", JSON.stringify(dataToSave));
    }
  }, [currentSpinIndex, pool]);
  /**
   * Drop the ball through the board with a more realistic, faster falling motion:
   * - Vertical drops use a tween with "easeIn" (simulating acceleration).
   * - Horizontal moves use an easeInOut tween.
   */
  const dropBall = async () => {
    if (animating) return;
    setAnimating(true);
    setSelectedPrize(null);
    setLitPegs([]);

    // Pre-select the winning prize bin.
    const targetPrizeIndex = pool![currentSpinIndex];
    setCurrentSpinIndex(currentSpinIndex + 1);
    console.log(targetPrizeIndex);
    const numBins = BOARD_ROWS + 1;
    const binWidth = BOARD_WIDTH / numBins;
    const targetX = targetPrizeIndex * binWidth + binWidth / 2;
    const startingX = BOARD_WIDTH / 2;

    // Set the ball's initial position.
    let currentX = startingX;
    let currentY = ballRadius;
    controls.set({
      left: currentX - ballRadius,
      top: currentY - ballRadius,
      scale: 1,
    });

    // Create the audio instance
    const audio = new Audio(collideSound);

    // Process each peg row.
    for (let i = 0; i < pegRows.length; i++) {
      const pegRow = pegRows[i];

      // Compute an interpolation factor for the ideal path.
      const t = (i + 1) / BOARD_ROWS;
      const idealX = startingX + (targetX - startingX) * t;

      // Select the peg in this row whose x is closest to idealX.
      let chosenIndex = 0;
      let minDiff = Math.abs(pegRow[0].x - idealX);
      for (let j = 1; j < pegRow.length; j++) {
        const diff = Math.abs(pegRow[j].x - idealX);
        if (diff < minDiff) {
          minDiff = diff;
          chosenIndex = j;
        }
      }
      const chosenPeg = pegRow[chosenIndex];

      // Light up the peg
      const newLitPegs = [...litPegs];
      newLitPegs[i][chosenIndex] = true;
      setLitPegs(newLitPegs);

      // Vertical drop: move to a safe position above the peg.
      const safeY = chosenPeg.y - collisionOffset;
      await controls.start({
        top: safeY - ballRadius,
        left: currentX - ballRadius,
        transition: realisticVerticalTransition,
      });

      // Play the sound when the ball hits the peg
      audio.play();

      // A brief delay (reduced for speed).
      await sleep(30);

      // Determine the horizontal bounce.
      let newX: number;
      if (idealX < chosenPeg.x) {
        newX = chosenPeg.x - collisionOffset;
      } else if (idealX > chosenPeg.x) {
        newX = chosenPeg.x + collisionOffset;
      } else {
        newX =
          chosenPeg.x +
          (Math.random() < 0.5 ? -collisionOffset : collisionOffset);
      }

      // Horizontal move (side-to-side bounce).
      await controls.start({
        top: chosenPeg.y - ballRadius,
        left: newX - ballRadius,
        transition: realisticHorizontalTransition,
      });

      // Update the ball's current position.
      currentX = newX;
      currentY = chosenPeg.y;
    }

    // Adjust horizontally to align exactly with the target bin.
    if (currentX !== targetX) {
      await controls.start({
        top: currentY - ballRadius,
        left: targetX - ballRadius,
        transition: realisticHorizontalTransition,
      });
      currentX = targetX;
    }

    // Final vertical drop to the bottom of the board.
    const finalY = BOARD_HEIGHT - ballRadius;
    await controls.start({
      top: finalY - ballRadius,
      left: currentX - ballRadius,
      transition: realisticVerticalTransition,
    });

    // Announce the winning prize.
    const winSound = new Audio(collideSound);
    winSound.play();
    setSelectedPrize(targetPrizeIndex);
    setAnimating(false);
    onWinModalOpen();
  };

  const [litPegs, setLitPegs] = useState<boolean[][]>([]);

  // Initialize litPegs with all false values on component mount
  useEffect(() => {
    const initialLitPegs = pegRows.map(() => []);
    setLitPegs(initialLitPegs);
  }, [pegRows]);
  const {
    isOpen: isWinModalOpen,
    onOpen: onWinModalOpen,
    onClose: onWinModalClose,
  } = useDisclosure();

  const {
    isOpen: isTestsModalOpen,
    onOpen: onTestsModalOpen,
    onClose: onTestsModalClose,
  } = useDisclosure();
  const {
    isOpen: isStatsModalOpen,
    onOpen: onStatsModalOpen,
    onClose: onStatsModalClose,
  } = useDisclosure();
  const [toolBarVisible, setToolBarVisible] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    if (currentSpinIndex >= 153) {
      const timer = setTimeout(() => {
        setShowGameOver(true);
      }, 7000); // 5 seconds delay

      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, [currentSpinIndex]);
  if (currentSpinIndex === 153 && showGameOver) {
    return <GameOver />;
  }
  return (
    <Center
      display={"flex"}
      flexDir="column"
      alignItems="center"
      height={"100vh"} // Full viewport height
      overflow={"hidden"}
      background={`url(${plinkoBg})`}
      backgroundSize={"cover"}
      backgroundRepeat={"no-repeat"}
    >
      {/* Board Container */}
      <Box
        position="relative"
        width={`${BOARD_WIDTH}px`} // Dynamic width based on screen
        height={`${BOARD_HEIGHT}px`} // Dynamic height based on screen
        overflow="hidden"
        mt={"5vh"} // Adjust the top margin based on screen height
      >
        {/* Render static pegs */}
        {pegRows.map((pegRow, rowIndex) =>
          pegRow.map((peg, pegIndex) => (
            <Box
              key={`${rowIndex}-${pegIndex}`}
              position="absolute"
              width={`${pegRadius * 2}px`} // Scale pegs proportionally
              height={`${pegRadius * 2}px`} // Scale pegs proportionally
              borderRadius="full"
              bg={"white"}
              boxShadow={
                litPegs[rowIndex]?.[pegIndex]
                  ? "inset -0.5px 8.5px 10.5px -8.5px #f8c009"
                  : "-3.5px 21px 32px -6px #000000"
              }
              top={`${peg.y - pegRadius}px`}
              left={`${peg.x - pegRadius}px`}
            />
          ))
        )}

        {/* The ball */}
        <MotionBox
          position="absolute"
          width={`${ballRadius * 2}px`}
          height={`${ballRadius * 2}px`}
          borderRadius="full"
          background={"#FFC121"}
          animate={controls}
          initial={{
            left: BOARD_WIDTH / 2 - ballRadius,
            top: ballRadius - ballRadius,
            scale: 1,
          }}
          style={{
            background: `url(${ballIcon})`,
            backgroundSize: "contain",
          }}
        >
          <Center>
            {/* <Image width={"60%"} height={"60%"} src={}></Image> */}
          </Center>
        </MotionBox>
      </Box>

      {/* Button to trigger the ball drop */}

      {/* Prize Bins */}
      <Box
        mt={4}
        px={4}
        width={`${BOARD_WIDTH}px`} // Responsive to screen size
        display="flex"
        justifyContent="space-around"
      >
        {PlinkoSegments.map((segment, index) => (
          <Image
            src={segment.image}
            key={index}
            p={2}
            border="2px solid gray"
            borderRadius="md"
            textAlign="center"
            flex="1"
            m={1}
            bg={selectedPrize === index ? "green.300" : "white"}
            width={"10vw"} // Scale images proportionally
          ></Image>
        ))}
      </Box>

      <Button
        tabIndex={0}
        mt={4}
        onClick={dropBall}
        isDisabled={animating || currentSpinIndex >= 153}
        bg={`url(${dropBallIcon})`}
        width={"25vw"} // Responsive button size
        height={"25vw"} // Responsive button size
        bgSize={"contain"}
        bgRepeat={"no-repeat"}
        bgPos={"center"}
        _hover={{}}
        _active={{}}
      ></Button>

      {/* Prize Announcement */}
      {/* {selectedPrize !== null && (
        <Box mt={2}>
          <Text fontSize="xl">
            You won: {PlinkoSegments[selectedPrize].stockName}
          </Text>
        </Box>
      )} */}

      {/* Responsive Toolbar and Stats */}
      <Box
        position={"absolute"}
        left={"2vw"} // Use vw for positioning
        top={"1.5vw"}
        display={"flex"}
        flexDir={"row"}
        color={"white"}
        alignItems={"center"}
      >
        <Image width={"4vw"} src={countIcon} mr={"1vw"} />

        <Text
          as={"span"}
          fontSize={"2vw"} // Dynamic font size
          color={currentSpinIndex === 153 ? "red" : "white"}
        >
          {currentSpinIndex}/153
        </Text>
      </Box>

      <Image
        position={"absolute"}
        top={"20vw"} // Adjust the position based on viewport size
        width={"22vw"} // Scalable width
        mb={"1vw"}
        src={awaedWritten}
      />

      <Box
        position={"absolute"}
        top={"0"}
        right={"0"}
        cursor={"pointer"}
        height={"25vw"}
        width={"62vw"}
        display={"flex"}
        zIndex={"200"}
        dir="rtl"
        onMouseEnter={() => setToolBarVisible(true)}
        onMouseLeave={() => setToolBarVisible(false)}
      >
        {toolBarVisible && (
          <>
            <Image
              cursor={"pointer"}
              onClick={onStatsModalOpen}
              src={statisticsButton}
              width={"5vw"} // Adjust width dynamically
              height={"5vw"} // Adjust height dynamically
            />
            <Image
              cursor={"pointer"}
              onClick={onTestsModalOpen}
              src={testIcon}
              width={"5vw"}
              height={"5vw"}
            />
          </>
        )}
      </Box>
      {selectedPrize !== null && (
        <WinModal
          isOpen={isWinModalOpen}
          onClose={onWinModalClose}
          currentPrice={PlinkoSegments[selectedPrize].currentPrice}
          stockName={PlinkoSegments[selectedPrize].stockName}
        />
      )}

      <TestsModal
        isOpen={isTestsModalOpen}
        onClose={onTestsModalClose}
        segments={PlinkoSegments}
      />
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={onStatsModalClose}
        pool={pool}
        currentSpinIndex={currentSpinIndex}
        segments={PlinkoSegments}
      />
      <Box
        bg={"rgba(0,0,0,0.6)"}
        width={"100vw"} // Full width of the viewport
        position={"absolute"}
        bottom={"0"}
        left={"0"}
        py={"2vw"} // Scale padding based on viewport size
        pl={"3vw"}
        zIndex={50}
      >
        <Image width={"30vw"} src={arzLogo} />
      </Box>
    </Center>
  );
};

export default PlinkoBalls;
