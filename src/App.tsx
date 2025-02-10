import { Box } from "@chakra-ui/react";

import DiceScene from "./dice/scene";
import { Route, Routes } from "react-router";
import SpinWheelMobile from "./spinTheWheel/SpinWheelMobile";

const App = () => {
  return (
    <Box>
      {" "}
      <Routes>
        <Route path="/" element={<SpinWheelMobile />} />
        <Route path="/plinko" element={<DiceScene />} />
      </Routes>
    </Box>
  );
};

export default App;
