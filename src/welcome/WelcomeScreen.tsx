import { Box, Center, HStack, Image, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import awaedWritten from "../assets/basics/logo-written.svg";
import arzLogo from "../assets/basics/arz-logo.svg";
import minesImage from "../assets/games-images/mines.png";
import plinkoImage from "../assets/games-images/plinko.png";
import wheelImage from "../assets/games-images/wheel.png";
import bgGreen from "../assets/bgs/game-over-bg.svg";
import leap from "../assets/basics/leap-2025.png";

// Create a Motion-enabled Box component
const MotionBox = motion(Box);

// Variants for the game boxes
const gameBoxVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 150, damping: 20 },
  },
};

const gameBoxStyle = {
  width: "30vh",
  height: "30vh",
  borderRadius: "20px",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  cursor: "pointer",
};

const WelcomeScreen = () => {
  return (
    <Box
      w="100%"
      h="100vh"
      background={`url(${bgGreen})`}
      backgroundColor="black"
      bgSize="cover"
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      {/* "Made for 2025" Section */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
      >
        <HStack color="white" spacing={4}>
          <Heading size="xl">Made for</Heading>
          <Image src={leap} width="30vh" alt="Leap 2025" />
          <Heading size="xl">2025</Heading>
        </HStack>
      </MotionBox>

      {/* Logo Section */}
      <Center mt={4}>
        <HStack spacing={10} alignItems="center">
          <Image width="30vh" src={awaedWritten} alt="Logo Written" />
          <Heading
            color="white"
            fontSize="4xl"
            as={motion.h1}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.3,
            }}
          >
            X
          </Heading>
          <Image width="10vh" src={arzLogo} alt="ARZ Logo" />
        </HStack>
      </Center>

      {/* Game Boxes */}
      <HStack mt={10} spacing={20}>
        <Link to={"/wheel"}>
          <MotionBox
            {...gameBoxStyle}
            backgroundImage={`url(${wheelImage})`}
            variants={gameBoxVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            whileHover={{
              scale: 1.1,
              rotate: 2,
              boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.4)",
            }}
          />
        </Link>
        <Link to={"/mines"}>
          <MotionBox
            {...gameBoxStyle}
            backgroundImage={`url(${minesImage})`}
            variants={gameBoxVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            whileHover={{
              scale: 1.1,
              rotate: 2,
              boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.4)",
            }}
          />
        </Link>
        <Link to={"/plinko"}>
          <MotionBox
            {...gameBoxStyle}
            backgroundImage={`url(${plinkoImage})`}
            variants={gameBoxVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            whileHover={{
              scale: 1.1,
              rotate: 2,
              boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.4)",
            }}
          />
        </Link>
      </HStack>
    </Box>
  );
};

export default WelcomeScreen;
