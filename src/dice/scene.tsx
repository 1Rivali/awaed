import React, { useState, useEffect } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { motion, useAnimation } from "framer-motion";
import { SEGMENTS } from "../constants/constants";

// ============================================================
// 1. SEGMENTS & PRIZE POOL LOGIC
// ------------------------------------------------------------
// (Replace the image strings below with your actual imports.)

// These states and helper are used to select a winning segment.
const createPool = () => {
  const pool: number[] = [];
  SEGMENTS.forEach((segment, index) => {
    for (let i = 0; i < segment.maxWinners; i++) {
      pool.push(index);
    }
  });
  // Shuffle using Fisher-Yates
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
};

// ============================================================
// 2. BOARD & ANIMATION CONSTANTS
// ------------------------------------------------------------
const BOARD_WIDTH = 300;
const BOARD_HEIGHT = 500;
const BOARD_ROWS = 8; // Number of peg rows

// Ball and peg dimensions
const ballRadius = 10; // Ball diameter = 20px
const pegRadius = 4; // Peg diameter = 8px
const margin = 2; // Extra margin so the ball doesn't hit the peg

// When bouncing, the ball will shift horizontally by:
const collisionOffset = ballRadius + pegRadius + margin; // e.g. 10+4+2 = 16px

// Vertical spacing between peg rows.
const PEG_SPACING_Y = BOARD_HEIGHT / (BOARD_ROWS + 1);

// ============================================================
// 3. TRIANGULAR BOARD CREATION
// ------------------------------------------------------------
interface Position {
  x: number;
  y: number;
}

/**
 * Generates a triangular (pyramid) layout of pegs.
 * - Row 0 has 1 peg.
 * - Row i has i+1 pegs.
 * - Each row is horizontally centered.
 */
const generateTriangularPegs = (): Position[][] => {
  const rows: Position[][] = [];
  // Compute horizontal spacing so that the bottom row fits nicely.
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

// ============================================================
// 4. MAIN COMPONENT
// ------------------------------------------------------------
const PlinkoBoard: React.FC = () => {
  // Peg rows for the triangular board.
  const [pegRows, setPegRows] = useState<Position[][]>([]);
  // Animation control flag.
  const [animating, setAnimating] = useState(false);
  // Which peg is "active" (lit up) when hit.
  const [activePeg, setActivePeg] = useState<{
    row: number;
    index: number;
  } | null>(null);
  // The winning segment (index into SEGMENTS) from the ball drop.
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

  // States for prize pool logic.
  const [currentSpinIndex, setCurrentSpinIndex] = useState(0);
  const [pool, setPool] = useState<number[]>([]);

  // Framer Motion animation controls for the ball.
  const controls = useAnimation();

  // When the component mounts, generate the peg board and prize pool.
  useEffect(() => {
    setPegRows(generateTriangularPegs());
    setPool(createPool());
  }, []);

  /**
   * dropBall:
   * - Animates the ball row by row.
   * - At each row, it finds the peg closest to the ball’s current x,
   *   drops to a safe height, lights up that peg briefly, then bounces off.
   * - After the final fall, the next index from the pool determines the winning segment.
   */
  const dropBall = async () => {
    if (animating) return;
    setAnimating(true);
    setSelectedSegment(null);

    // Starting position (top center).
    let currentCenterX = BOARD_WIDTH / 2;
    let currentCenterY = ballRadius;

    // Reset the ball’s position.
    controls.set({
      left: currentCenterX - ballRadius,
      top: currentCenterY - ballRadius,
      scale: 1,
    });

    // Process each peg row.
    for (let i = 0; i < pegRows.length; i++) {
      const pegRow = pegRows[i];
      // Find the peg in this row closest to the ball's current x.
      let closestPegIndex = 0;
      for (let j = 1; j < pegRow.length; j++) {
        if (
          Math.abs(pegRow[j].x - currentCenterX) <
          Math.abs(pegRow[closestPegIndex].x - currentCenterX)
        ) {
          closestPegIndex = j;
        }
      }
      const closestPeg = pegRow[closestPegIndex];
      const safeCenterY = closestPeg.y - collisionOffset;

      // Animate a vertical drop to just above the peg.
      await controls.start({
        top: safeCenterY - ballRadius,
        left: currentCenterX - ballRadius,
        transition: { duration: 0.3, ease: "easeIn" },
      });

      // Light up the peg.
      setActivePeg({ row: i, index: closestPegIndex });
      await sleep(200);

      // Determine the new x position (bounce direction).
      let newCenterX: number;
      if (Math.abs(currentCenterX - closestPeg.x) < 1) {
        newCenterX =
          closestPeg.x +
          (Math.random() < 0.5 ? -collisionOffset : collisionOffset);
      } else if (currentCenterX < closestPeg.x) {
        newCenterX = closestPeg.x - collisionOffset;
      } else {
        newCenterX = closestPeg.x + collisionOffset;
      }

      // Animate the horizontal bounce (with a slight vertical adjustment).
      await controls.start({
        top: closestPeg.y - ballRadius,
        left: newCenterX - ballRadius,
        transition: { duration: 0.2, ease: "easeOut" },
      });
      setActivePeg(null);
      currentCenterX = newCenterX;
      currentCenterY = closestPeg.y;
    }

    // Final drop to the bottom.
    const finalCenterY = BOARD_HEIGHT - ballRadius;
    await controls.start({
      top: finalCenterY - ballRadius,
      left: currentCenterX - ballRadius,
      transition: { duration: 0.5, ease: "easeIn" },
    });

    // ======================================================
    // 5. DETERMINE THE WINNING SEGMENT USING THE PRIZE POOL
    // ------------------------------------------------------
    const selectedIndex = pool[currentSpinIndex];
    console.log(selectedIndex);
    console.log(pool);
    setSelectedSegment(selectedIndex);
    setCurrentSpinIndex(currentSpinIndex + 1);
    // ======================================================

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
        {/* Render triangular pegs */}
        {pegRows.map((pegRow, rowIndex) =>
          pegRow.map((peg, pegIndex) => (
            <Box
              key={`${rowIndex}-${pegIndex}`}
              position="absolute"
              width={`${pegRadius * 2}px`}
              height={`${pegRadius * 2}px`}
              borderRadius="full"
              bg={
                activePeg &&
                activePeg.row === rowIndex &&
                activePeg.index === pegIndex
                  ? "yellow.400"
                  : "blue.400"
              }
              top={`${peg.y - pegRadius}px`}
              left={`${peg.x - pegRadius}px`}
            />
          ))
        )}

        {/* The Ball */}
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

      <Button mt={4} onClick={dropBall} isDisabled={animating}>
        {animating ? "Ball in Motion..." : "Drop Ball"}
      </Button>

      {/* Prize Bins – one for each SEGMENT */}
      <Box
        mt={4}
        width={`${BOARD_WIDTH}px`}
        display="flex"
        justifyContent="space-around"
      >
        {SEGMENTS.map((segment, index) => (
          <Box
            key={index}
            p={2}
            border="2px solid gray"
            borderRadius="md"
            textAlign="center"
            flex="1"
            m={1}
            bg={selectedSegment === index ? "green.300" : "white"}
          >
            <Text fontSize="sm" fontWeight="bold">
              {segment.stockName}
            </Text>
            <Text fontSize="xs">{segment.currentPrice}</Text>
          </Box>
        ))}
      </Box>

      {selectedSegment !== null && (
        <Box mt={2}>
          <Text fontSize="xl" fontWeight="bold">
            Winner: {SEGMENTS[selectedSegment].stockName} at{" "}
            {SEGMENTS[selectedSegment].currentPrice}
          </Text>
        </Box>
      )}
    </Flex>
  );
};

export default PlinkoBoard;
