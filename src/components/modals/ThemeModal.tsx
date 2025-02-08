import {
  Box,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
} from "@chakra-ui/react";
import bgBlack from "../../assets/bgs/bg-black.svg";
import bgGreen from "../../assets/bgs/bg-green.svg";
import bgGreen2 from "../../assets/bgs/bg-green-2.svg";
import bgBlue from "../../assets/bgs/bg-blue.svg";
import bgBlue2 from "../../assets/bgs/bg-blue-2.svg";
import bgBlue3 from "../../assets/bgs/bg-blue-3.svg";
import wheelBlack from "../../assets/wheels/wheel-black.svg";
import wheelWhite from "../../assets/wheels/wheel-white.svg";
import spinnerWhite from "../../assets/spinner-variants/spinner-white.png";
import spinnerBlack from "../../assets/spinner-variants/spinner-black.png";
import closeIcon from "../../assets/basics/close-icon.png";
import { Dispatch, SetStateAction } from "react";

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bg: string;
  setBg: Dispatch<SetStateAction<string>>;
  spinner: string;
  setSpinner: Dispatch<SetStateAction<string>>;
  wheel: string;
  setWheel: Dispatch<SetStateAction<string>>;
}

const bgs: string[] = [bgBlack, bgGreen, bgGreen2, bgBlue, bgBlue2, bgBlue3];
const wheels = [
  { img: wheelBlack, color: "black" },
  { img: wheelWhite, color: "white" },
];
const spinners: string[] = [spinnerWhite, spinnerBlack];

const ThemeModal = ({
  isOpen,
  onClose,
  setBg,
  bg,
  setSpinner,
  spinner,
  setWheel,
  wheel,
}: ThemeModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={["md", "lg", "2xl", "4xl"]}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        borderRadius="6vh"
        border="2vh solid #1ED760"
        background="rgba(0,0,0,0.85)"
      >
        <ModalHeader display="flex" justifyContent="flex-end" p={4}>
          <Image
            src={closeIcon}
            onClick={onClose}
            cursor="pointer"
            width={["3vh", "4vh"]}
            height={["3vh", "4vh"]}
          />
        </ModalHeader>

        <ModalBody pb={6} textColor="#EDFDE1">
          <Heading my={3} fontSize={["lg", "xl"]}>
            Choose Background:
          </Heading>
          <SimpleGrid columns={[2, 3, 4]} spacing={[2, 4]}>
            {bgs.map((background) => (
              <Box
                key={background}
                width={["10vh", "12vh", "15vh"]}
                height={["10vh", "12vh", "15vh"]}
                borderRadius="50%"
                cursor="pointer"
                borderWidth={background === bg ? "4px" : "2px"}
                borderColor={background === bg ? "#1ED760" : "transparent"}
                transition="all 0.2s ease-in-out"
                _hover={{ boxShadow: "lg", transform: "scale(1.05)" }}
                onClick={() => setBg(background)}
                backgroundImage={`url(${background})`}
                backgroundSize="cover"
                backgroundPosition="center"
              />
            ))}
          </SimpleGrid>

          <Heading my={["3vh", "5vh"]}>Choose Spinner:</Heading>
          <SimpleGrid columns={[2, 3, 4]} gap={[4, 6]}>
            {spinners.map((spinButton) => (
              <Image
                key={spinButton}
                borderRadius="5vh"
                border={
                  spinButton === spinner ? "1vh solid #1ED760" : undefined
                }
                bg="gray"
                cursor="pointer"
                width={["6vh", "8vh", "10vh"]}
                height={["6vh", "8vh", "10vh"]}
                onClick={() => setSpinner(spinButton)}
                src={spinButton}
              />
            ))}
          </SimpleGrid>

          <Heading my={["3vh", "5vh"]}>Choose Wheel:</Heading>
          <SimpleGrid columns={[2, 3, 4]} gap={[4, 6]}>
            {wheels.map((choosenWheel) => (
              <Image
                key={choosenWheel.color}
                borderRadius="5vh"
                border={
                  choosenWheel.color === wheel ? "1vh solid #1ED760" : undefined
                }
                bg="gray"
                cursor="pointer"
                width={["6vh", "8vh", "10vh"]}
                height={["6vh", "8vh", "10vh"]}
                onClick={() => setWheel(choosenWheel.color)}
                src={choosenWheel.img}
              />
            ))}
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ThemeModal;
