import { Box, Center, Image, Text, useDisclosure } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import spinnerAudio from "../assets/audio/spin-232536.mp3";
import countIcon from "../assets/basics/count-icon.svg";
import awaedWritten from "../assets/basics/logo-written.svg";
import arzLogo from "../assets/basics/powered-by-arz.svg";
import statisticsButton from "../assets/basics/statistics-button.svg";
import testIcon from "../assets/basics/tests-button.svg";
import themeIcon from "../assets/basics/theme-button.svg";
import bgGreen from "../assets/bgs/mobile-bg-green.svg";

import spinnerBlack from "../assets/spinner-variants/spinner-black.png";
import spinnerWhite from "../assets/spinner-variants/spinner-white.png";
import GameOver from "../components/GameOver";
import StatsModal from "../components/modals/StatsModal";
import TestsModal from "../components/modals/TestsModal";
import ThemeModal from "../components/modals/ThemeModal";
import WinModal from "../components/modals/WinModal";
import { SEGMENTS } from "../constants/constants";

const SpinTheWheelMobile = () => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningIdx, setWinningIdx] = useState<number | null>(null);
  const [bg, setBg] = useState<string>(bgGreen);
  const [spinner, setSpinner] = useState<string>(spinnerBlack);
  const [wheel, setWheel] = useState<string>("black");
  const [spinAudio] = useState(new Audio(spinnerAudio));
  const [toolBarVisible, setToolBarVisible] = useState(false);
  const [currentSpinIndex, setCurrentSpinIndex] = useState(0);
  const [pool, setPool] = useState<number[]>([]);

  // Create the pool of indices based on maxWinners
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

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("plinkoData");
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
        localStorage.removeItem("plinkoData");
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
    localStorage.setItem("plinkoData", JSON.stringify(dataToSave));
  };

  // Save data to localStorage whenever currentSpinIndex or pool changes
  useEffect(() => {
    if (pool.length > 0) {
      const dataToSave = {
        currentSpinIndex,
        pool,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("plinkoData", JSON.stringify(dataToSave));
    }
  }, [currentSpinIndex, pool]);

  const spinWheel = () => {
    if (isSpinning || currentSpinIndex >= pool!.length) return;
    spinAudio.play();
    setIsSpinning(true);

    const selectedIndex = pool![currentSpinIndex];
    setCurrentSpinIndex(currentSpinIndex + 1);

    console.log("Winning segment index:", selectedIndex);

    const segmentAngle = 360 / SEGMENTS.length;
    const segCenter = selectedIndex * segmentAngle + segmentAngle / 2;
    const currentRotationEffective = rotation % 360;
    let additionalRotation = 90 - (currentRotationEffective + segCenter);
    additionalRotation = ((additionalRotation % 360) + 360) % 360;
    const fullRotations = (Math.floor(Math.random() * 3) + 3) * 360;
    const targetRotation = rotation + fullRotations + additionalRotation + 90;

    setRotation(targetRotation);

    // Reset spinning state after the animation (duration: 3 seconds)
    setTimeout(() => {
      setIsSpinning(false);
      setWinningIdx(selectedIndex);
      onWinModalOpen();

      spinAudio.load();
    }, 3700);
  };

  const {
    isOpen: isWinModalOpen,
    onOpen: onWinModalOpen,
    onClose: onWinModalClose,
  } = useDisclosure();

  const {
    isOpen: isOpenTheme,
    onOpen: onOpenTheme,
    onClose: onCloseTheme,
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
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    if (currentSpinIndex === 153) {
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
      h="100vh"
      bg="gray.900"
      backgroundImage={`url(${bg})`}
      bgSize={"cover"}
      overflow={"hidden"}
    >
      <Box position="relative" zIndex={"100"} overflow={"hidden"}>
        <motion.div
          style={{
            width: "90vw",
            height: "90vw",
            borderRadius: "50%",
            background: wheel,
            border: `4vw solid ${wheel === "black" ? "#EDFDE1" : "#206967"}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            boxShadow: "inset 0 0 24.5px 11.5px #1ed760",
          }}
          animate={{ rotate: rotation }}
          transition={{ type: "tween", duration: 3.5, ease: "easeOut" }}
        >
          {Array.from({ length: SEGMENTS.length / 2 }).map((_, i) => (
            <Box
              key={`line-${i}`}
              position="absolute"
              w="100%"
              h="2vw"
              bg={wheel === "black" ? "#EDFDE1" : "#206967"}
              transform={`rotate(${(360 / SEGMENTS.length) * i}deg)`}
            />
          ))}

          {SEGMENTS.map((seg, i) => {
            const angle =
              (360 / SEGMENTS.length) * i + 360 / SEGMENTS.length / 2;
            return (
              <Box
                key={`outer-text-${i}`}
                position="absolute"
                w="100%"
                h="2vw"
                transform={`rotate(${angle}deg) `}
                transformOrigin="bottom center"
              >
                <Image
                  src={seg.image}
                  filter={wheel === "black" ? "invert(0)" : "invert(1)"}
                  w={i === 4 || i === 9 ? "24vw" : "18vw"}
                  h={i === 4 || i === 9 ? "24vw" : "18vw"}
                  transform={
                    i === 1
                      ? "rotate(180deg) translate(-5vw, 8vw)"
                      : i === 4
                      ? "rotate(180deg) translate(-3vw, 11vw)"
                      : i === 9
                      ? "rotate(180deg) translate(-5vw, 10vw)"
                      : i === 8
                      ? "rotate(180deg) translate(-7vw, 8vw)"
                      : i === 0
                      ? "rotate(180deg) translate(-6vw, 8vw)"
                      : "rotate(180deg) translate(-6vw, 6.5vw)"
                  }
                  objectFit="contain"
                  borderRadius="full"
                />
              </Box>
            );
          })}
        </motion.div>

        <Box
          tabIndex={0}
          position="absolute"
          top={"38%"}
          right={"38%"}
          onClick={spinWheel}
          bg={
            isSpinning
              ? spinner === spinnerBlack
                ? `url(${spinnerWhite})`
                : `url(${spinnerBlack})`
              : `url(${spinner})`
          }
          _before={{
            content: '""',
            position: "absolute",
            inset: 0,
            border: "1.4vw solid transparent",
            borderRadius: "inherit",
            transition: "border-color 0.5s ease-in-out",
          }}
          _hover={{
            _before: { borderColor: !isSpinning && "#1ED760" },
          }}
          bgSize={"cover"}
          w="20vw"
          h="20vw"
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          fontWeight="bold"
          fontSize="2xl"
          zIndex={100}
          cursor={isSpinning ? "not-allowed" : "pointer"}
          transition="opacity 0.2s"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !isWinModalOpen && !isSpinning) {
              spinWheel();
            }
          }}
        >
          {/* <Image src={logo} w={"10vw"} height={"10vw"} /> */}
        </Box>

        <Box
          width={"10vw"}
          height={"10vw"}
          position={"absolute"}
          top={"43%"}
          right={"0%"}
          zIndex={"100"}
          bgColor={"#FFB800"}
          clipPath="polygon(0 50%, 100% 0, 100% 100%)"
        ></Box>
      </Box>
      {winningIdx !== null && (
        <WinModal
          isOpen={isWinModalOpen}
          onClose={onWinModalClose}
          currentPrice={SEGMENTS[winningIdx].currentPrice}
          stockName={SEGMENTS[winningIdx].stockName}
        />
      )}

      <ThemeModal
        isOpen={isOpenTheme}
        onClose={onCloseTheme}
        bg={bg}
        spinner={spinner}
        setBg={setBg}
        setSpinner={setSpinner}
        wheel={wheel}
        setWheel={setWheel}
      />
      <TestsModal
        isOpen={isTestsModalOpen}
        onClose={onTestsModalClose}
        segments={SEGMENTS}
      />
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={onStatsModalClose}
        pool={pool}
        currentSpinIndex={currentSpinIndex}
        segments={SEGMENTS}
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
            {" "}
            <Image
              mr={"3vw"}
              // position={"absolute"}
              // top={"0vw"}
              // right={"2vw"}
              cursor={"pointer"}
              onClick={onOpenTheme}
              src={themeIcon}
              width={"20vw"}
              height={"20vw"}
            />
            <Image
              // position={"absolute"}
              // top={"0vw"}
              // right={"25vw"}
              cursor={"pointer"}
              onClick={onStatsModalOpen}
              src={statisticsButton}
              width={"20vw"}
              height={"20vw"}
            />
            <Image
              // position={"absolute"}
              // top={"0vw"}
              // right={"48vw"}
              cursor={"pointer"}
              onClick={onTestsModalOpen}
              src={testIcon}
              width={"20vw"}
              height={"20vw"}
            />
          </>
        )}
      </Box>

      <Box
        bg={"rgba(0,0,0,0.6)"}
        width={"100vw"}
        position={"absolute"}
        bottom={"0"}
        left={"0"}
        py={"3vw"}
        pl={"5vw"}
        pr={"5vw"}
        zIndex={50}
      >
        <Image width={"50vw"} src={arzLogo} />
      </Box>
      <Image
        position={"absolute"}
        top={"14vh"}
        left={"14vh"}
        width={"50vw"}
        mb={"1vw"}
        src={awaedWritten}
      />
      {/* COUNT ICON */}
      <Box
        position={"absolute"}
        left={"5vw"}
        top={"6.5vw"}
        display={"flex"}
        flexDir={"row"}
        color={"white"}
        alignItems={"center"}
      >
        <Image width={"6vw"} src={countIcon} mr={"2vw"} />

        <Text
          as={"span"}
          fontSize={"3vw"}
          color={currentSpinIndex === 153 ? "red" : "white"}
        >
          {currentSpinIndex}/153
        </Text>
      </Box>
    </Center>
  );
};

export default SpinTheWheelMobile;
