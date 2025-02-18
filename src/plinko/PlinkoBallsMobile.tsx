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

// ─── DESKTOP DIMENSIONS ──────────────────────────────────────────────
// Fixed board dimensions for desktop
const BOARD_WIDTH = window.innerWidth - 10; // pixels
const BOARD_HEIGHT = window.innerHeight / 2; // pixels
const BOARD_ROWS = 9;

const ballRadius = 10; // pixels
const pegRadius = 7.5; // pixels
const margin = 1; // pixels
const collisionOffset = ballRadius + pegRadius + margin;

const PEG_SPACING_Y = BOARD_HEIGHT / (BOARD_ROWS + 1);

interface Position {
  x: number;
  y: number;
}

/**
 * Generate a triangular array of peg positions:
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

// --- Transition settings for a faster, realistic motion ---
// Vertical drops use a tween with "easeIn" to simulate acceleration.
const realisticVerticalTransition = {
  type: "tween",
  ease: "easeIn",
  duration: 0.3,
};
// Horizontal moves use an "easeInOut" tween.
const realisticHorizontalTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2,
};

const MobilePlinkoBalls: React.FC = () => {
  const [pegRows, setPegRows] = useState<Position[][]>([]);
  const [litPegs, setLitPegs] = useState<boolean[][]>([]);
  const [animating, setAnimating] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<number | null>(null);
  const controls = useAnimation();
  const [crrentGameIndex, setCurrentGameIndex] = useState(0);
  const [pool, setPool] = useState<number[]>([]);
  const [toolBarVisible, setToolBarVisible] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  // Generate the peg board once on mount.
  useEffect(() => {
    const pegs = generateTriangularPegs();
    setPegRows(pegs);
    // Initialize litPegs to all false.
    const initialLitPegs = pegs.map((row) => row.map(() => false));
    setLitPegs(initialLitPegs);
  }, []);

  const createPool = () => {
    const newPool: number[] = [];
    PlinkoSegments.forEach((segment, index) => {
      for (let i = 0; i < segment.maxWinners; i++) {
        newPool.push(index);
      }
    });

    // Shuffle the pool using Fisher-Yates.
    for (let i = newPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPool[i], newPool[j]] = [newPool[j], newPool[i]];
    }
    return newPool;
  };

  // Load data from localStorage on component mount.
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
      } else {
        localStorage.removeItem("spinWheelData");
        initializePool();
      }
    } else {
      initializePool();
    }
  }, []);

  // Initialize the pool (only called once or when cache is cleared)
  const initializePool = () => {
    const newPool = createPool();
    setPool(newPool);
    const dataToSave = {
      currentSpinIndex: 0,
      pool: newPool,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem("spinWheelData", JSON.stringify(dataToSave));
  };

  // Save data to localStorage whenever currentGameIndex or pool changes.
  useEffect(() => {
    if (pool.length > 0) {
      const dataToSave = {
        currentSpinIndex: crrentGameIndex,
        pool,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("spinWheelData", JSON.stringify(dataToSave));
    }
  }, [crrentGameIndex, pool]);

  /**
   * Drop the ball through the board using realistic, faster motions.
   */
  const dropBall = async () => {
    if (animating) return;
    setAnimating(true);
    setSelectedPrize(null);
    // Reset lit pegs.
    setLitPegs(pegRows.map((row) => row.map(() => false)));

    // Pre-select the winning prize bin.
    const targetPrizeIndex = pool[crrentGameIndex];
    setCurrentGameIndex(crrentGameIndex + 1);

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

    // Create audio instance.
    const audio = new Audio(collideSound);

    // Process each peg row.
    for (let i = 0; i < pegRows.length; i++) {
      const pegRow = pegRows[i];
      const t = (i + 1) / BOARD_ROWS;
      const idealX = startingX + (targetX - startingX) * t;
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

      // Light up the chosen peg.
      setLitPegs((prev) => {
        const newLit = [...prev];
        newLit[i][chosenIndex] = true;
        return newLit;
      });

      // Vertical drop: move above the peg.
      const safeY = chosenPeg.y - collisionOffset;
      await controls.start({
        top: safeY - ballRadius,
        left: currentX - ballRadius,
        transition: realisticVerticalTransition,
      });

      // Play collision sound.
      audio.play();
      await sleep(30);

      // Determine horizontal bounce.
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
      // Horizontal move.
      await controls.start({
        top: chosenPeg.y - ballRadius,
        left: newX - ballRadius,
        transition: realisticHorizontalTransition,
      });
      currentX = newX;
      currentY = chosenPeg.y;
    }

    // Final horizontal adjustment.
    if (currentX !== targetX) {
      await controls.start({
        top: currentY - ballRadius,
        left: targetX - ballRadius,
        transition: realisticHorizontalTransition,
      });
      currentX = targetX;
    }

    // Final vertical drop.
    const finalY = BOARD_HEIGHT - ballRadius;
    await controls.start({
      top: finalY - ballRadius,
      left: currentX - ballRadius,
      transition: realisticVerticalTransition,
    });

    // Play win sound and announce the prize.
    const winSound = new Audio(collideSound);
    winSound.play();
    setSelectedPrize(targetPrizeIndex);
    setAnimating(false);
    onWinModalOpen();
  };

  // ─── Modal Controls ───────────────────────────────────────────────
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

  // End game when the maximum number of games is reached.
  useEffect(() => {
    if (crrentGameIndex >= 153) {
      const timer = setTimeout(() => {
        setShowGameOver(true);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [crrentGameIndex]);

  if (crrentGameIndex === 153 && showGameOver) {
    return <GameOver />;
  }

  return (
    <Center
      display="flex"
      flexDir="column"
      alignItems="center"
      height="100vh"
      overflow="hidden"
      background={`url(${plinkoBg})`}
      backgroundSize="cover"
      backgroundRepeat="no-repeat"
      backgroundPosition={"center"}
      position="relative"
    >
      {/* Board Container */}
      <Box
        position="relative"
        width={`${BOARD_WIDTH}px`}
        height={`${BOARD_HEIGHT}px`}
        overflow="hidden"
        mt="40px"
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
              bg="white"
              boxShadow={
                litPegs[rowIndex]?.[pegIndex]
                  ? "inset -1px 8px 10px -8px #f8c009"
                  : "-3px 20px 30px -6px #000000"
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
          background={`#FFB800`}
          backgroundSize="cover"
          animate={controls}
          initial={{
            left: BOARD_WIDTH / 2 - ballRadius,
            top: 0,
            scale: 1,
          }}
        />
      </Box>

      {/* Prize Bins */}
      <Box
        mt={0.1}
        px={0}
        width={`full`}
        display="flex"
        justifyContent="space-around"
      >
        {PlinkoSegments.map((segment, index) => (
          <Image
            src={segment.image}
            key={index}
            p={"4px"}
            flex="1"
            m={"2px"}
            borderRadius={5}
            bg={selectedPrize === index ? "green.300" : "white"}
            // Use fixed pixel widths for desktop.
            width={[2, 3, 4, 5, 7].includes(index) ? "40px" : "20px"}
          />
        ))}
      </Box>

      {/* Drop Ball Button */}
      <Button
        tabIndex={0}
        mt={10}
        onClick={dropBall}
        isDisabled={animating || crrentGameIndex >= 153}
        bg={`url(${dropBallIcon})`}
        width="150px"
        height="150px"
        bgSize="contain"
        bgRepeat="no-repeat"
        bgPos="top"
        _active={{}}
        _hover={{}}
      />

      {/* Toolbar: Count Indicator at Top-Left */}
      <Box
        position="absolute"
        left="20px"
        top="20px"
        display="flex"
        flexDir="row"
        color="white"
        alignItems="center"
      >
        <Image width="40px" src={countIcon} mr="10px" />
        <Text
          as="span"
          fontSize="20px"
          color={crrentGameIndex === 153 ? "red" : "white"}
        >
          {crrentGameIndex}/153
        </Text>
      </Box>

      {/* Logo at Top-Left */}
      {/* <Image
          position="absolute"
          top="40px"
          left="20px"
          width="300px"
          src={awaedWritten}
        /> */}

      {/* Toolbar: Stats & Tests Icons at Top-Right */}
      <Box
        position="absolute"
        top="20px"
        right="20px"
        cursor="pointer"
        height="150px"
        width="300px"
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        zIndex={200}
        dir="rtl"
        onMouseEnter={() => setToolBarVisible(true)}
        onMouseLeave={() => setToolBarVisible(false)}
      >
        {toolBarVisible && (
          <>
            <Image
              cursor="pointer"
              onClick={onStatsModalOpen}
              src={statisticsButton}
              width="50px"
              height="50px"
              mr="10px"
            />
            <Image
              cursor="pointer"
              onClick={onTestsModalOpen}
              src={testIcon}
              width="50px"
              height="50px"
            />
          </>
        )}
      </Box>

      {/* Bottom Branding */}
      <Box
        bg="rgba(0,0,0,0.6)"
        width="fit-content"
        position="absolute"
        bottom="0"
        left="0"
        py="20px"
        px="20px"
        zIndex={50}
      >
        <Image mb={"3vh"} width="10vh" src={awaedWritten} />
        <Image width="10vh" src={arzLogo} />
      </Box>

      {/* Modals */}
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
        currentSpinIndex={crrentGameIndex}
        segments={PlinkoSegments}
      />
    </Center>
  );
};

export default MobilePlinkoBalls;
