import React, { useState, useEffect } from "react";
import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { motion, useAnimation } from "framer-motion";
import { SEGMENTS } from "../constants/constants";

interface Position {
  x: number;
  y: number;
}

// Board dimensions and peg rows.
const BOARD_WIDTH = 300;
const BOARD_HEIGHT = 500;
// With 9 rows, there will be 9 + 1 = 10 bins.
const BOARD_ROWS = 9;

// Dimensions for the ball and peg.
const ballRadius = 10; // Ball diameter = 20px.
const pegRadius = 4; // Peg diameter = 8px.
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

const PlinkoBoard: React.FC = () => {
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
    SEGMENTS.forEach((segment, index) => {
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

      // Vertical drop: move to a safe position above the peg.
      const safeY = chosenPeg.y - collisionOffset;
      await controls.start({
        top: safeY - ballRadius,
        left: currentX - ballRadius,
        transition: realisticVerticalTransition,
      });

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
    setSelectedPrize(targetPrizeIndex);
    setAnimating(false);
  };

  return (
    <Flex direction="column" align="center" mt={5}>
      {/* Board Container */}
      <Box
        position="relative"
        width={`${BOARD_WIDTH}px`}
        height={`${BOARD_HEIGHT}px`}
        border="2px solid gray"
        borderRadius="md"
        overflow="hidden"
      >
        {/* Render static pegs */}
        {pegRows.map((pegRow, rowIndex) =>
          pegRow.map((peg, pegIndex) => (
            <Box
              key={`${rowIndex}-${pegIndex}`}
              position="absolute"
              width={`${pegRadius * 2}px`}
              height={`${pegRadius * 2}px`}
              borderRadius="full"
              bg="blue.400"
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
          bg="red.400"
          animate={controls}
          initial={{
            left: BOARD_WIDTH / 2 - ballRadius,
            top: ballRadius - ballRadius,
            scale: 1,
          }}
          style={{ position: "absolute" }}
        />
      </Box>

      {/* Button to trigger the ball drop */}
      <Button mt={4} onClick={dropBall} isDisabled={animating}>
        {animating ? "Ball in Motion..." : "Drop Ball"}
      </Button>

      {/* Prize Bins */}
      <Box
        mt={4}
        width={`${BOARD_WIDTH}px`}
        display="flex"
        justifyContent="space-around"
      >
        {SEGMENTS.map((segment, index) => (
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
          ></Image>
        ))}
      </Box>

      {/* Prize Announcement */}
      {selectedPrize !== null && (
        <Box mt={2}>
          <Text fontSize="xl">
            You won: {SEGMENTS[selectedPrize].stockName}
          </Text>
        </Box>
      )}
    </Flex>
  );
};

export default PlinkoBoard;
