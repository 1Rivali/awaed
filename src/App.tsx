import { Box, useBreakpointValue } from "@chakra-ui/react";

import { Route, Routes } from "react-router";
import SpinTheWheelMobile from "./spinTheWheel/SpinWheelMobile";

import MinesGame from "./mines/MinesGameBigScreen";
import DesktopSpinTheWheel from "./spinTheWheel/SpinWheelDesktop";
import DesktopPlinkoBalls from "./plinko/PlinkoBallsDesktop";
import MobilePlinkoBalls from "./plinko/PlinkoBallsMobile";
import DesktopMinesGame from "./mines/DesktopMinesGame";
import MobileMinesGame from "./mines/MobileMinesGame";

const App = () => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return (
    <Box>
      {" "}
      <Routes>
        <Route
          path="/"
          element={isMobile ? <SpinTheWheelMobile /> : <DesktopSpinTheWheel />}
        />
        <Route
          path="/plinko"
          element={isMobile ? <MobilePlinkoBalls /> : <DesktopPlinkoBalls />}
        />
        <Route
          path="/mines"
          element={isMobile ? <MobileMinesGame /> : <DesktopMinesGame />}
        />
      </Routes>
    </Box>
  );
};

export default App;
