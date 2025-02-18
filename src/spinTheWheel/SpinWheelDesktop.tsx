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
import bgGreen from "../assets/bgs/bg-green.svg";

import spinnerBlack from "../assets/spinner-variants/spinner-black.png";
import spinnerWhite from "../assets/spinner-variants/spinner-white.png";
import GameOver from "../components/GameOver";
import StatsModal from "../components/modals/StatsModal";
import TestsModal from "../components/modals/TestsModal";
import ThemeModal from "../components/modals/ThemeModal";
import WinModal from "../components/modals/WinModal";
import { SEGMENTS } from "../constants/constants";

const DesktopSpinTheWheel = () => {
  // State variables
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningIdx, setWinningIdx] = useState<number | null>(null);
  const [bg, setBg] = useState<string>(bgGreen);
  const [spinner, setSpinner] = useState<string>(spinnerBlack);
  const [wheel, setWheel] = useState<string>("black");
  const [spinAudio] = useState(new Audio(spinnerAudio));
  const [currentSpinIndex, setCurrentSpinIndex] = useState(0);
  const [pool, setPool] = useState<number[]>([]);
  const [showGameOver, setShowGameOver] = useState(false);

  // Constants for desktop sizing
  const wheelSize = 600; // Wheel diameter in pixels
  const spinnerSize = 120; // Spinner button size in pixels
  const toolbarIconSize = 50; // Toolbar icons size in pixels

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
        setCurrentSpinIndex(savedSpinIndex);
        setPool(savedPool);
      } else {
        localStorage.removeItem("plinkoData");
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
    if (isSpinning || currentSpinIndex >= pool.length) return;
    spinAudio.play();
    setIsSpinning(true);

    const selectedIndex = pool[currentSpinIndex];
    setCurrentSpinIndex(currentSpinIndex + 1);

    const segmentAngle = 360 / SEGMENTS.length;
    const segCenter = selectedIndex * segmentAngle + segmentAngle / 2;
    const currentRotationEffective = rotation % 360;
    let additionalRotation = 90 - (currentRotationEffective + segCenter);
    additionalRotation = ((additionalRotation % 360) + 360) % 360;
    const fullRotations = (Math.floor(Math.random() * 3) + 3) * 360;
    const targetRotation = rotation + fullRotations + additionalRotation + 90;

    setRotation(targetRotation);

    // Reset spinning state after the animation (duration: 3.5 seconds)
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

  useEffect(() => {
    if (currentSpinIndex === 153) {
      const timer = setTimeout(() => {
        setShowGameOver(true);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [currentSpinIndex]);

  if (currentSpinIndex === 153 && showGameOver) {
    return <GameOver />;
  }

  return (
    <Center
      minH="100vh"
      bg="gray.900"
      backgroundImage={`url(${bg})`}
      bgSize="cover"
      overflow="hidden"
    >
      <Box position="relative" zIndex="100">
        {/* Spin Wheel */}
        <motion.div
          style={{
            width: `${wheelSize}px`,
            height: `${wheelSize}px`,
            borderRadius: "50%",
            background: wheel,
            border: `30px solid ${wheel === "black" ? "#EDFDE1" : "#206967"}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            boxShadow: "inset 0 0 25px 12px #1ed760",
          }}
          animate={{ rotate: rotation }}
          transition={{ type: "tween", duration: 3.5, ease: "easeOut" }}
        >
          {/* Segment Dividing Lines */}
          {Array.from({ length: SEGMENTS.length / 2 }).map((_, i) => (
            <Box
              key={`line-${i}`}
              position="absolute"
              w="100%"
              h="20px"
              bg={wheel === "black" ? "#EDFDE1" : "#206967"}
              transform={`rotate(${(360 / SEGMENTS.length) * i}deg)`}
            />
          ))}

          {/* Segment Icons */}
          {SEGMENTS.map((seg, i) => {
            const angle =
              (360 / SEGMENTS.length) * i + 360 / SEGMENTS.length / 2;
            // Adjust the inner image transforms for desktop
            let transformValue = "";
            switch (i) {
              case 1:
                transformValue = "rotate(180deg) translate(-30px, 50px)";
                break;
              case 4:
                transformValue = "rotate(180deg) translate(-30px, 50px)";
                break;
              case 9:
                transformValue = "rotate(180deg) translate(-40px, 50px)";
                break;
              case 8:
                transformValue = "rotate(180deg) translate(-50px, 43px)";
                break;
              case 0:
                transformValue = "rotate(180deg) translate(-45px, 50px)";
                break;
              case 3:
                transformValue = "rotate(180deg) translate(-20px, 30px)";
                break;
              default:
                transformValue = "rotate(180deg) translate(-40px, 40px)";
            }
            return (
              <Box
                key={`outer-text-${i}`}
                position="absolute"
                w="100%"
                h="20px"
                transform={`rotate(${angle}deg)`}
                transformOrigin="bottom center"
              >
                <Image
                  src={seg.image}
                  filter={wheel === "black" ? "invert(0)" : "invert(1)"}
                  w={
                    i === 4 || i === 9
                      ? `${wheelSize * 0.2}px`
                      : `${wheelSize * 0.2}px`
                  }
                  h={
                    i === 4 || i === 9
                      ? `${wheelSize * 0.2}px`
                      : `${wheelSize * 0.2}px`
                  }
                  transform={transformValue}
                  objectFit="contain"
                  borderRadius="full"
                />
              </Box>
            );
          })}
        </motion.div>

        {/* Spinner Button */}
        <Box
          tabIndex={0}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
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
            border: "6px solid transparent",
            borderRadius: "inherit",
            transition: "border-color 0.5s ease-in-out",
          }}
          _hover={{
            _before: { borderColor: !isSpinning && "#1ED760" },
          }}
          bgSize="cover"
          w={`${spinnerSize}px`}
          h={`${spinnerSize}px`}
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          fontWeight="bold"
          fontSize="24px"
          zIndex={100}
          cursor={isSpinning ? "not-allowed" : "pointer"}
          transition="opacity 0.2s"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !isWinModalOpen && !isSpinning) {
              spinWheel();
            }
          }}
        >
          {/* Optionally add inner content */}
        </Box>

        {/* Decorative Box */}
        <Box
          position="absolute"
          top="calc(50% - 30px)"
          right="0"
          zIndex="100"
          bgColor="#FFB800"
          clipPath="polygon(0 50%, 100% 0, 100% 100%)"
          w="60px"
          h="60px"
        ></Box>
      </Box>

      {/* Win Modal */}
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

      {/* Toolbar positioned at top-right */}
      <Box
        position="absolute"
        top="20px"
        right="20px"
        display="flex"
        zIndex="200"
        gap="10px"
      >
        <Image
          cursor="pointer"
          onClick={onOpenTheme}
          src={themeIcon}
          width={`${toolbarIconSize}px`}
          height={`${toolbarIconSize}px`}
        />
        <Image
          cursor="pointer"
          onClick={onStatsModalOpen}
          src={statisticsButton}
          width={`${toolbarIconSize}px`}
          height={`${toolbarIconSize}px`}
        />
        <Image
          cursor="pointer"
          onClick={onTestsModalOpen}
          src={testIcon}
          width={`${toolbarIconSize}px`}
          height={`${toolbarIconSize}px`}
        />
      </Box>

      {/* Bottom Branding */}
      <Box
        bg="rgba(0,0,0,0.6)"
        width="100%"
        position="absolute"
        bottom="0"
        left="0"
        py="20px"
        px="20px"
        zIndex={50}
      >
        <Image mb={"3vh"} width="30vh" src={awaedWritten} />
        <Image width="30vh" src={arzLogo} />
      </Box>

      {/* Logo at top-left */}

      {/* Count Icon */}
      <Box
        position="absolute"
        left="20px"
        top="20px"
        display="flex"
        flexDirection="row"
        color="white"
        alignItems="center"
        gap="10px"
      >
        <Image width="30px" src={countIcon} />
        <Text
          as="span"
          fontSize="24px"
          color={currentSpinIndex === 153 ? "red" : "white"}
        >
          {currentSpinIndex}/153
        </Text>
      </Box>
    </Center>
  );
};

export default DesktopSpinTheWheel;
