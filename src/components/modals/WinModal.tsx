import {
  Center,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import closeIcon from "../../assets/basics/close-icon.png";
import winAnimation from "../../assets/basics/win-animation.gif";
import nikeIcon from "../../assets/basics/nike-icon.png";
import winSound from "../../assets/audio/win-sound.mp3";
import { useCallback, useEffect, useRef } from "react"; // Changed from useState to useRef

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockName?: string | undefined;
  currentPrice?: string | undefined;
}

function WinModal({ isOpen, onClose, stockName, currentPrice }: WinModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio when component mounts
  useEffect(() => {
    audioRef.current = new Audio(winSound);
    audioRef.current.volume = 1; // Set volume (0-1)

    return () => {
      // Cleanup when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle audio when modal opens/closes
  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.currentTime = 0; // Reset audio to start
      audioRef.current.play().catch((error) => {
        console.error("Audio autoplay blocked:", error);
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onClose();
  }, [onClose]);
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter" && isOpen) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, handleClose]);
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose} // Use unified close handler
      size="md"
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        borderRadius={"12vh"}
        border={"2vh solid #1ED760"}
        background={"rgba(0,0,0,0.85)"}
      >
        <ModalHeader
          textTransform="lowercase"
          fontSize="2xl"
          fontWeight="medium"
          pb={2}
        >
          <Image
            src={closeIcon}
            onClick={handleClose} // Use unified close handler
            cursor={"pointer"}
            width={"4vh"}
            height={"4vh"}
            mt={"4vh"}
            ml={"2vh"}
          />
        </ModalHeader>

        <ModalBody pb={6} textColor={"white"}>
          <VStack spacing={3} align="stretch" position={"relative"}>
            <Center>
              <Image src={winAnimation} width={"20vh"} />
            </Center>
            <VStack>
              <Heading>congratulations!</Heading>
              <Text fontSize={"xl"} fontWeight="semibold">
                You won
                <Text
                  as="span"
                  display="inline"
                  fontWeight={"bold"}
                  color={"#1ED760"}
                >
                  {" "}
                  {stockName}{" "}
                </Text>
                Stock!
              </Text>
              <Text fontSize="lg">
                Current Price:
                <Text as="span" fontWeight="bold">
                  {" "}
                  {currentPrice} SAR
                </Text>
              </Text>
              <Image
                src={nikeIcon}
                position={"absolute"}
                zIndex={10}
                top={"-27vh"}
              />
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default WinModal;
