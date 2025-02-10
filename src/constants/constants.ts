import appleLogo from "../assets/spin-prizes/apple.svg";
import aramcoLogo from "../assets/spin-prizes/aramco.svg";
import googleLogo from "../assets/spin-prizes/google.svg";
import lsaImage from "../assets/spin-prizes/lsa.svg";
import lucidLogo from "../assets/spin-prizes/lucid.svg";
import nvidiaLogo from "../assets/spin-prizes/nvidia.svg";
import sabicLogo from "../assets/spin-prizes/sabic.svg";
import snapLogo from "../assets/spin-prizes/snap.svg";
import ssaImage from "../assets/spin-prizes/ssa-3.svg";
import stcLogo from "../assets/spin-prizes/stc.svg";
import plinkoappleLogo from "../assets/plinko-prizes/plinko-apple.svg";
import plinkoaramcoLogo from "../assets/plinko-prizes/plinko-aramco.svg";
import plinkogoogleLogo from "../assets/plinko-prizes/plinko-google.svg";
import plinkolsaImage from "../assets/plinko-prizes/plinko-lsa.svg";
import plinkolucidLogo from "../assets/plinko-prizes/plinko-lucid.svg";
import plinkonvidiaLogo from "../assets/plinko-prizes/plinko-nvidia.svg";
import plinkosabicLogo from "../assets/plinko-prizes/plinko-sabic.svg";
import plinkosnapLogo from "../assets/plinko-prizes/plinko-snap.svg";
import plinkossaImage from "../assets/plinko-prizes/plinko-ssa.svg";
import plinkostcLogo from "../assets/plinko-prizes/plinko-stc.svg";
export const SEGMENTS = [
  { image: appleLogo, currentPrice: "900", stockName: "AAPL", maxWinners: 1 },
  {
    image: googleLogo,
    currentPrice: "787.5",
    stockName: "GOOG",
    maxWinners: 1,
  },
  { image: nvidiaLogo, currentPrice: "450", stockName: "NVDA", maxWinners: 2 },
  { image: sabicLogo, currentPrice: "68", stockName: "SABIC", maxWinners: 34 },
  {
    // TODO:: SSA IMAGE AND VALUE
    image: ssaImage,
    currentPrice: "114.125",
    stockName: "SSA",
    maxWinners: 25,
  },
  { image: stcLogo, currentPrice: "84", stockName: "STC", maxWinners: 18 },
  {
    image: snapLogo,
    currentPrice: "86.25",
    stockName: "SNAP",
    maxWinners: 18,
  },
  {
    image: aramcoLogo,
    currentPrice: "58",
    stockName: "ARAMCO",
    maxWinners: 30,
  },
  {
    image: lucidLogo,
    currentPrice: "21.75",
    stockName: "LCID",
    maxWinners: 22,
  },
  {
    image: lsaImage,
    currentPrice: "107.875",
    stockName: "LSA",
    maxWinners: 2,
  },
];

export const PlinkoSegments = [
  {
    image: plinkoappleLogo,
    currentPrice: "900",
    stockName: "AAPL",
    maxWinners: 1,
  },

  {
    image: plinkonvidiaLogo,
    currentPrice: "450",
    stockName: "NVDA",
    maxWinners: 2,
  },
  {
    image: plinkosnapLogo,
    currentPrice: "86.25",
    stockName: "SNAP",
    maxWinners: 18,
  },
  {
    image: plinkolucidLogo,
    currentPrice: "21.75",
    stockName: "LCID",
    maxWinners: 22,
  },
  {
    image: plinkosabicLogo,
    currentPrice: "68",
    stockName: "SABIC",
    maxWinners: 34,
  },
  {
    image: plinkoaramcoLogo,
    currentPrice: "58",
    stockName: "ARAMCO",
    maxWinners: 30,
  },
  {
    // TODO:: SSA IMAGE AND VALUE
    image: plinkossaImage,
    currentPrice: "114.125",
    stockName: "SSA",
    maxWinners: 25,
  },
  {
    image: plinkostcLogo,
    currentPrice: "84",
    stockName: "STC",
    maxWinners: 18,
  },

  {
    image: plinkolsaImage,
    currentPrice: "107.875",
    stockName: "LSA",
    maxWinners: 2,
  },
  {
    image: plinkogoogleLogo,
    currentPrice: "787.5",
    stockName: "GOOG",
    maxWinners: 1,
  },
];
