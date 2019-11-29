import React, { useEffect } from 'react'
import CubeSim from './CubeSim'
import { FaceletCube, CubieCube, Move, CubeUtil } from './CubeLib';
import { CubieT, MoveT, defaultKeyMapping } from "./Defs";
import AppView from "./AppView"
import { AppState, StateT } from "./Types"
import { useKeyControl, useAppState } from "./Hooks"
import { alg_generator, AlgDesc } from "./Algs"
import { rand_choice } from './Math';


type AppProps = {}

function App(props: AppProps) {
  let [state, setState] = useAppState()
  let keyMove = useKeyControl(defaultKeyMapping)

  let generator = alg_generator( state.config.cmllSelector )
  let trig_generator = alg_generator( state.config.triggerSelector )

  //console.log("current selector = ", state.config.orientationSelector)
  let ori_generator = alg_generator( state.config.orientationSelector)

  useEffect( () => {
    let [move_str, _] = keyMove
    if (move_str === "") return;
    // case match on kind of operation
    if (move_str[0] === "#") {
      if (move_str === "#scramble") {
        // enter cleared solving state based on selection
        let trigger_alg : AlgDesc = trig_generator()

        let alg : AlgDesc = generator();

        let alg_str = trigger_alg.alg + " " + rand_choice(["U", "", "U'", "U2"]) + " " + alg.alg
        let moves : MoveT[] = Move.inv(Move.parse(alg_str));

        //console.log("moves", Move.to_string(moves))

        let cube = CubeUtil.get_random_l10p()
        cube = CubieCube.apply(cube, moves)

        // ori based on ...?
        let ori : string = ori_generator().id
        //console.log("current ori selector's ori ", ori)

        setState( {
          cube,
          moveHistory: [],
          stateName: "solving",
          info: {
            cube,
            desc: [trigger_alg, alg]
          },
          ori
        })
      } else if (move_str === "#redo") {
        setState( {
          cube: state.info.cube,
          moveHistory: [],
          stateName: "solving",
        })
      }
    } else { // move
      // only allow this in solving state
      if (state.stateName === "solving") {
        //console.log(move_str)
        let moves = Move.parse(move_str)
        if (moves.length > 0) {
          let move = moves[0]
          let cube = CubieCube.apply(state.cube, move)
          let cmll_solved = CubeUtil.is_cmll_solved(cube)
          let newState : StateT = cmll_solved ? "solved" : "solving";
          setState( {
            cube: CubieCube.apply(state.cube, move),
            moveHistory: [...state.moveHistory, move],
            stateName: newState
          })
        }
      }
    }
  }, [keyMove])

  let {cube} = state

  let facelet = FaceletCube.from_cubie(cube)

  return (
    <AppView state={state} setState={setState} />
  )
}
export default App