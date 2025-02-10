import { motion } from "framer-motion";
import { Box, Center, Heading, Image, Text, VStack } from "@chakra-ui/react";
import gameOverBg from "../assets/bgs/game-over-bg.svg";
import gameOverBackTmw from "../assets/game-over/back-tmw.svg";
import gameOverComplete from "../assets/game-over/complete.svg";
import gameOverSpinsOvr from "../assets/game-over/spins-ovr.svg";
import gameOverThanks from "../assets/game-over/thanks.svg";
import awaedWritten from "../assets/basics/logo-written.svg";
import arzLogo from "../assets/basics/powered-by-arz.svg";
const GameOver = () => {
  return (
    <motion.div
      initial={{
        backgroundSize: "cover",
      }} // Initial state (hidden)
      animate={{
        background: `url(${gameOverBg})`,
        backgroundSize: "cover",
      }} // Animate to visible
      transition={{ duration: 4, ease: "easeIn" }}
    >
      <Box w={"100vw"} height={"100vh"} bgSize={"cover"} position={"relative"}>
        <Center>
          <VStack mt={"20vh"} height={"60vh"} justifyContent={"space-around"}>
            <Image mt={"8vw"} src={gameOverComplete} height={"25vw"} />
            <Image src={gameOverSpinsOvr} height={"16vw"}></Image>
            <Heading color={"white"} fontSize={"8vw"}>
              Total Spins:{" "}
              <Text as={"span"} color={"#FFB800"}>
                153
              </Text>
            </Heading>
            <Image src={gameOverBackTmw} height={"8vw"}></Image>
            <Image src={gameOverThanks} height={"8vw"}></Image>
            <Text
              as={"span"}
              zIndex={"200"}
              color={"red"}
              cursor={"pointer"}
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Reset
            </Text>
          </VStack>
        </Center>
        <Box
          width={"100vw"}
          position={"absolute"}
          bottom={"0"}
          left={"0"}
          py={"3vw"}
          pl={"5vw"}
          pr={"5vw"}
          zIndex={50}
        >
          <Image width={"30vw"} mb={"1vw"} src={awaedWritten} />
          <Image width={"50vw"} src={arzLogo} />
        </Box>
      </Box>
    </motion.div>
  );
};

export default GameOver;
