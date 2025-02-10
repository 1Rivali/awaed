import React, { useState, useEffect } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { motion, useAnimation } from "framer-motion";
import { SEGMENTS } from "../constants/constants";

// ============================================================
// 1. SEGMENTS & PRIZE POOL LOGIC
// ------------------------------------------------------------
const createPool = () => {
  const pool: number[] = [];
  SEGMENTS.forEach((segment, index) => {
    for (let i = 0; i < segment.maxWinners; i++) {
      pool.push(index);
    }
  });
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
};

// ============================================================
// 2. BOARD & ANIMATION CONSTANTS
// ------------------------------------------------------------
// Use screen dimensions for full-screen board
const BOARD_WIDTH = window.innerWidth;
const BOARD_HEIGHT = window.innerHeight;
const BOARD_ROWS = 12; // Increase rows for larger screen

// Scale ball and peg sizes proportionally
const ballRadius = BOARD_WIDTH * 0.01; // 1% of screen width
const pegRadius = BOARD_WIDTH * 0.004; // 0.4% of screen width
const margin = 2;

const collisionOffset = ballRadius + pegRadius + margin;
const PEG_SPACING_Y = BOARD_HEIGHT / (BOARD_ROWS + 1);

// ============================================================
// 3. TRIANGULAR BOARD CREATION
// ------------------------------------------------------------
interface Position {
  x: number;
  y: number;
}

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

const MotionBox = motion(Box);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// 4. MAIN COMPONENT
// ------------------------------------------------------------
const PlinkoBoard: React.FC = () => {
  const [pegRows, setPegRows] = useState<Position[][]>([]);
  const [animating, setAnimating] = useState(false);
  const [activePeg, setActivePeg] = useState<{
    row: number;
    index: number;
  } | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [currentSpinIndex, setCurrentSpinIndex] = useState(0);
  const [pool, setPool] = useState<number[]>([]);
  const controls = useAnimation();

  useEffect(() => {
    setPegRows(generateTriangularPegs());
    setPool(createPool());
  }, []);

  const dropBall = async () => {
    if (animating) return;
    setAnimating(true);
    setSelectedSegment(null);

    let currentCenterX = BOARD_WIDTH / 2;
    let currentCenterY = ballRadius;

    controls.set({
      left: currentCenterX - ballRadius,
      top: currentCenterY - ballRadius,
      scale: 1,
    });

    for (let i = 0; i < pegRows.length; i++) {
      const pegRow = pegRows[i];
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

      await controls.start({
        top: safeCenterY - ballRadius,
        left: currentCenterX - ballRadius,
        transition: { duration: 0.3, ease: "easeIn" },
      });

      setActivePeg({ row: i, index: closestPegIndex });
      await sleep(200);

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

      await controls.start({
        top: closestPeg.y - ballRadius,
        left: newCenterX - ballRadius,
        transition: { duration: 0.2, ease: "easeOut" },
      });
      setActivePeg(null);
      currentCenterX = newCenterX;
      currentCenterY = closestPeg.y;
    }

    const finalCenterY = BOARD_HEIGHT - ballRadius;
    await controls.start({
      top: finalCenterY - ballRadius,
      left: currentCenterX - ballRadius,
      transition: { duration: 0.5, ease: "easeIn" },
    });

    const selectedIndex = pool[currentSpinIndex];
    setSelectedSegment(selectedIndex);
    setCurrentSpinIndex(currentSpinIndex + 1);
    setAnimating(false);
  };

  return (
    <Flex
      direction="column"
      align="center"
      h="100vh"
      w="100vw"
      overflow="hidden"
    >
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

      {/* Prize Bins */}
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
