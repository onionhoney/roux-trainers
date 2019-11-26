import React, { useEffect } from 'react'
import CubeSim from './CubeSim'
import { FaceletCube, CubieCube, Move, CubeUtil } from './CubeLib';
import { CubieT, MoveT } from "./Defs";
const HEIGHT = 300, WIDTH = 300;

type AppProps = { };


// Hook
function useKeyControl(keyMapping: {[key: string]: string} ) {
  // State for keeping track of whether key is pressed
  const [move, setMove] = React.useState<[string, number]>( ["", 0] );

  // If pressed key is our target key then set to true
  function downHandler({ key }: {key : string}) {
    key = key.toUpperCase()
    if (keyMapping.hasOwnProperty(key)) {
      setMove( ([_, cnt]) => [keyMapping[key], cnt + 1] );
    }
  }

  // Add event listeners
  React.useEffect(() => {
    window.addEventListener('keydown', downHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return move;
}
const keyMapping = {
  "I": "R",
  "K": "R'",
  "W": "B",
  "O": "B'",
  "S": "D",
  "L": "D'",
  "D": "L",
  "E": "L'",
  "J": "U",
  "F": "U'",
  "H": "F",
  "G": "F'",
  ";": "y",
  "A": "y'",
  "U": "r",
  "R": "l'",
  "M": "r'",
  "V": "l",
  "T": "x",
  "Y": "x",
  "N": "x'",
  "B": "x'",
  ".": "M'",
  "X": "M'",
  "5": "M",
  "6": "M",
  "P": "z",
  "Q": "z'",
  "Z": "d",
  "C": "u'",
  ",": "u",
  "/": "d'",
}

type AppState = {
  cube: CubieT,
  state: "solving",
  moveHistory: MoveT[]
}
const initState : AppState = {
  cube: CubieCube.id,
  state: "solving",
  moveHistory: []
}

function App(props: AppProps) {
  //const [locations, setLocations] = React.useState([])
  let [state, setState] = React.useState(initState)
  let {cube} = state
  let facelet = FaceletCube.from_cubie(cube)
  let keyMove = useKeyControl(keyMapping)

  useEffect( () => {
    let [move_str, _] = keyMove
    if (move_str === "") return;
    console.log(move_str)
    let moves = Move.parse(move_str)
    if (moves.length > 0) {
      let move = moves[0]
      setState( {...state, cube: CubieCube.apply(state.cube, move), moveHistory: [...state.moveHistory, move] })
    }
  },[keyMove])

  let cmll_solved = CubeUtil.is_cmll_solved(cube)

  return (
    <div>
    <CubeSim
      width={WIDTH}
      height={HEIGHT}
      cube={facelet}
    />
    <div>
      {cmll_solved ? "CMLL Solved" : "Not solved"}
    </div>
    </div>
  )
}
export default App