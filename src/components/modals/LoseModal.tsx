import {
  Center,
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
import missedAnimation from "../../assets/basics/missed-animation.svg";
import missedIcon from "../../assets/basics/missed-icon.svg";
import loseSound from "../../assets/audio/lose-sound.mp3";
import { useCallback, useEffect, useRef } from "react"; // Changed from useState to useRef

interface LoseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoseModal({ isOpen, onClose }: LoseModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio when component mounts
  useEffect(() => {
    audioRef.current = new Audio(loseSound);
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
        border={"2vh solid #FF4D4D"}
        background={"rgba(0,0,0,0.85)"}
      >
        <ModalHeader pb={2}>
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
              <Image src={missedAnimation} width={"20vh"} />
            </Center>
            <VStack>
              <Text fontSize={"5vh"} fontWeight={"bold"}>
                Oh no!
              </Text>
              <Text fontSize={"4vh"} fontWeight="semibold">
                You missed this one
              </Text>
              <Text fontSize="3vh" fontWeight="bold">
                Better Luck Next Time
              </Text>
              <Image
                src={missedIcon}
                position={"absolute"}
                zIndex={10}
                top={"-24vh"}
              />
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default LoseModal;
