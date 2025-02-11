import { Box } from "@chakra-ui/react";

import { Route, Routes } from "react-router";
import SpinWheelMobile from "./spinTheWheel/SpinWheelMobile";
import PlinkoBalls from "./plinko/PlinkoBalls";
import MinesGame from "./mines/MinesGame";

const App = () => {
  return (
    <Box>
      {" "}
      <Routes>
        <Route path="/" element={<SpinWheelMobile />} />
        <Route path="/plinko" element={<PlinkoBalls />} />
        <Route path="/mines" element={<MinesGame />} />
      </Routes>
    </Box>
  );
};

export default App;
