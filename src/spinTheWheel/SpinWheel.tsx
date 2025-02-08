import {
  Box,
  Center,
  Heading,
  Image,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import themeIcon from "../assets/basics/theme-button.svg";
import bgGreen from "../assets/bgs/bg-green.svg";
import awaedWritten from "../assets/basics/logo-written.svg";
import testIcon from "../assets/basics/tests-button.svg";
import arzLogo from "../assets/basics/powered-by-arz.svg";
import appleLogo from "../assets/spin-prizes/apple.svg";
import aramcoLogo from "../assets/spin-prizes/aramco.svg";
import googleLogo from "../assets/spin-prizes/google.svg";
import lucidLogo from "../assets/spin-prizes/lucid.svg";
import nvidiaLogo from "../assets/spin-prizes/nvidia.svg";
import sabicLogo from "../assets/spin-prizes/sabic.svg";
import snapLogo from "../assets/spin-prizes/snap.svg";
import stcLogo from "../assets/spin-prizes/stc.svg";
import spinnerBlack from "../assets/spinner-variants/spinner-black.png";
import spinnerWhite from "../assets/spinner-variants/spinner-white.png";
import TestsModal from "../components/modals/TestsModal";
import ThemeModal from "../components/modals/ThemeModal";
import WinModal from "../components/modals/WinModal";
import loseImage from "../assets/spin-prizes/lost-the-turn.svg";
import countIcon from "../assets/basics/count-icon.svg";
import LoseModal from "../components/modals/LoseModal";
import spinnerAudio from "../assets/audio/spin-232536.mp3";
import gameOverBg from "../assets/bgs/game-over-bg.svg";
import gameOverComplete from "../assets/game-over/complete.svg";
import gameOverSpinsOvr from "../assets/game-over/spins-ovr.svg";
import gameOverBackTmw from "../assets/game-over/back-tmw.svg";
import gameOverThanks from "../assets/game-over/thanks.svg";
import statisticsButton from "../assets/basics/statistics-button.svg";
import StatsModal from "../components/modals/StatsModal";

const SEGMENTS = [
  { image: appleLogo, currentPrice: "900", stockName: "AAPL", maxWinners: 2 },
  {
    image: googleLogo,
    currentPrice: "787.5",
    stockName: "GOOG",
    maxWinners: 2,
  },
  { image: nvidiaLogo, currentPrice: "450", stockName: "NVDA", maxWinners: 5 },
  { image: sabicLogo, currentPrice: "68", stockName: "SABIC", maxWinners: 25 },
  {
    image: loseImage,
    currentPrice: "0",
    stockName: "Lost",
    maxWinners: 70,
  },
  { image: stcLogo, currentPrice: "42", stockName: "STC", maxWinners: 125 },
  {
    image: snapLogo,
    currentPrice: "43.0",
    stockName: "SNAP",
    maxWinners: 125,
  },
  {
    image: aramcoLogo,
    currentPrice: "29",
    stockName: "ARAMCO",
    maxWinners: 175,
  },
  {
    image: lucidLogo,
    currentPrice: "10.875",
    stockName: "LCID",
    maxWinners: 100,
  },
  {
    image: loseImage,
    currentPrice: "0",
    stockName: "Lost",
    maxWinners: 69,
  },
];

const SpinWheel = () => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningIdx, setWinningIdx] = useState<number | null>(null);
  const [bg, setBg] = useState<string>(bgGreen);
  const [spinner, setSpinner] = useState<string>(spinnerBlack);
  const [wheel, setWheel] = useState<string>("black");
  const [spinAudio] = useState(new Audio(spinnerAudio));
  const [toolBarVisible, setToolBarVisible] = useState(false);
  const [currentSpinIndex, setCurrentSpinIndex] = useState(698);
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
      if (selectedIndex != 4 && selectedIndex != 9) {
        onWinModalOpen();
      } else {
        onLoseModalOpen();
      }
      spinAudio.load();
    }, 3700);
  };

  const {
    isOpen: isWinModalOpen,
    onOpen: onWinModalOpen,
    onClose: onWinModalClose,
  } = useDisclosure();
  const {
    isOpen: isLoseModalOpen,
    onOpen: onLoseModalOpen,
    onClose: onLoseModalClose,
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

  if (currentSpinIndex === 698) {
    return (
      <Box
        w={"100vw"}
        height={"100vh"}
        bg={`url(${gameOverBg})`}
        bgSize={"cover"}
        position={"relative"}
      >
        <Center>
          <VStack height={"90vh"} justifyContent={"space-around"}>
            <Image mt={"8vh"} src={gameOverComplete} height={"25vh"} />
            <Image src={gameOverSpinsOvr} height={"16vh"}></Image>
            <Heading color={"white"} fontSize={"8vh"}>
              Total Spins:{" "}
              <Text as={"span"} color={"#FFB800"}>
                698
              </Text>
            </Heading>
            <Image src={gameOverBackTmw} height={"8vh"}></Image>
            <Image src={gameOverThanks} height={"8vh"}></Image>
          </VStack>
        </Center>
        <Box
          width={"100vw"}
          position={"absolute"}
          bottom={"0"}
          left={"0"}
          py={"3vh"}
          pl={"5vh"}
          pr={"5vh"}
          zIndex={50}
        >
          <Image width={"30vh"} mb={"1vh"} src={awaedWritten} />
          <Image width={"50vh"} src={arzLogo} />
        </Box>
      </Box>
    );
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
            width: "90vh",
            height: "90vh",
            borderRadius: "50%",
            background: wheel,
            border: `4vh solid ${wheel === "black" ? "#EDFDE1" : "#206967"}`,
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
              h="2vh"
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
                h="2vh"
                transform={`rotate(${angle}deg) `}
                transformOrigin="bottom center"
              >
                <Image
                  src={seg.image}
                  filter={wheel === "black" ? "invert(0)" : "invert(1)"}
                  w={i === 4 || i === 9 ? "22vh" : "18vh"}
                  h={i === 4 || i === 9 ? "22vh" : "18vh"}
                  transform={
                    i === 1 || i === 4
                      ? "rotate(180deg) translate(-5vh, 8vh)"
                      : i === 9
                      ? "rotate(180deg) translate(-5vh, 10vh)"
                      : i === 8
                      ? "rotate(180deg) translate(-7vh, 8vh)"
                      : i === 0
                      ? "rotate(180deg) translate(-6vh, 8vh)"
                      : "rotate(180deg) translate(-6vh, 6.5vh)"
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
            border: "1.4vh solid transparent",
            borderRadius: "inherit",
            transition: "border-color 0.5s ease-in-out",
          }}
          _hover={{
            _before: { borderColor: !isSpinning && "#1ED760" },
          }}
          bgSize={"cover"}
          w="20vh"
          h="20vh"
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
          {/* <Image src={logo} w={"10vh"} height={"10vh"} /> */}
        </Box>

        <Box
          width={"10vh"}
          height={"10vh"}
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
      {winningIdx !== null && (
        <LoseModal isOpen={isLoseModalOpen} onClose={onLoseModalClose} />
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
        height={"25vh"}
        width={"62vh"}
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
              mr={"3vh"}
              // position={"absolute"}
              // top={"0vh"}
              // right={"2vh"}
              cursor={"pointer"}
              onClick={onOpenTheme}
              src={themeIcon}
              width={"20vh"}
              height={"20vh"}
            />
            <Image
              // position={"absolute"}
              // top={"0vh"}
              // right={"25vh"}
              cursor={"pointer"}
              onClick={onStatsModalOpen}
              src={statisticsButton}
              width={"20vh"}
              height={"20vh"}
            />
            <Image
              // position={"absolute"}
              // top={"0vh"}
              // right={"48vh"}
              cursor={"pointer"}
              onClick={onTestsModalOpen}
              src={testIcon}
              width={"20vh"}
              height={"20vh"}
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
        py={"3vh"}
        pl={"5vh"}
        pr={"5vh"}
        zIndex={50}
      >
        <Image width={"30vh"} mb={"1vh"} src={awaedWritten} />
        <Image width={"50vh"} src={arzLogo} />
      </Box>
      {/* COUNT ICON */}
      <Box
        position={"absolute"}
        left={"5vh"}
        top={"6.5vh"}
        display={"flex"}
        flexDir={"row"}
        color={"white"}
        alignItems={"center"}
      >
        <Image width={"6vh"} src={countIcon} mr={"2vh"} />

        <Text
          as={"span"}
          fontSize={"3vh"}
          color={currentSpinIndex === 698 ? "red" : "white"}
        >
          {currentSpinIndex}/698
        </Text>
      </Box>
    </Center>
  );
};

export default SpinWheel;
