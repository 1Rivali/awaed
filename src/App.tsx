import { Box } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import SpinWheelMobile from "./spinTheWheel/SpinWheelMobile";
import SpinWheel from "./spinTheWheel/SpinWheel";

const App = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return <Box>{isMobile ? <SpinWheelMobile /> : <SpinWheel />}</Box>;
};

export default App;
