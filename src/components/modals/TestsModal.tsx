import {
  Button,
  Center,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import closeIcon from "../../assets/basics/close-icon.png"; // Import the close icon

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  segments: { stockName: string; maxWinners: number }[];
}

const TestsModal = ({ isOpen, onClose, segments }: ResultsModalProps) => {
  const [results, setResults] = useState<number[]>(
    new Array(segments.length).fill(0)
  );
  const [numSpins, setNumSpins] = useState<number>(698); // Default to 698 spins

  // Create the pool of indices based on maxWinners
  const createPool = () => {
    const pool: number[] = [];
    segments.forEach((segment, index) => {
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

  const runMultipleSpins = (spins: number) => {
    const newResults = new Array(segments.length).fill(0);
    const pool = createPool();

    for (let i = 0; i < spins; i++) {
      const selectedIndex = pool[i % pool.length];
      newResults[selectedIndex]++;
    }

    setResults(newResults);
  };

  const handleRetry = () => {
    runMultipleSpins(numSpins);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
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
            onClick={onClose}
            cursor={"pointer"}
            width={"4vh"}
            height={"4vh"}
          />
        </ModalHeader>

        <ModalBody pb={6} textColor={"white"}>
          <VStack spacing={3} align="stretch">
            <Center>
              <Text fontSize="2xl" fontWeight="bold">
                Algorithm Test
              </Text>
            </Center>

            <NumberInput
              defaultValue={698}
              min={1}
              max={100000}
              onChange={(valueString) => setNumSpins(Number(valueString))}
              textColor="white"
            >
              <NumberInputField
                border="1px solid white"
                _active={{
                  borderColor: "#1ED760",
                  border: "1px solid #1ED760",
                }}
                _focus={{ borderColor: "#1ED760" }}
              />
            </NumberInput>

            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="white">Stock Name</Th>
                  <Th color="white" isNumeric>
                    Times Selected
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {results.map((count, index) => (
                  <Tr key={index}>
                    <Td>{segments[index].stockName}</Td>
                    <Td isNumeric>{count}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Center>
              <Button
                mt={4}
                colorScheme="teal"
                onClick={handleRetry}
                fontSize="xl"
                fontWeight="bold"
                borderRadius="2vh"
                border="0.5vh solid #1ED760"
                bg="black"
                color="#1ED760"
                _hover={{ bg: "#1ED760", color: "black" }}
              >
                Retry
              </Button>
            </Center>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TestsModal;
