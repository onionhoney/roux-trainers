
import { CubieCube, Move, FaceletCube } from '../lib/CubeLib';
import { CubeUtil } from "../lib/CubeLib"
import min2phase from "../lib/min2phase"
import { CubieT } from '../lib/Defs';

// URFDLB

function transform(cube: CubieT, delta: CubieT) {
  let newCube: CubieT = CubieCube.clone(cube)
  console.log(cube.cp[1])
  for (let i = 0; i < 8; i++) {
    let [pos, piece] = [i, cube.cp[i]]
    let [newpos, newpiece] = [delta.cp[pos], delta.cp[piece]]
    console.log(`${pos}, ${piece}, ${newpos}, ${newpiece}`);
    newCube.cp[delta.cp[pos]] = delta.cp[piece]
  }
  return newCube
}
it('calls cubejs correctly', () => {

  console.debug("tf")
  const cube = CubieCube.from_string("R U B")

  console.log("tf")
  const transformed_cube = CubieCube.to_cstimer_cube(cube)

  console.assert( CubieCube.is_solveable(transformed_cube), "Cube must be solveable")

  min2phase.initialize();

   min2phase.solve(transformed_cube)
  //Cube.initSolver();
  //ReactDOM.render(<App />, div);
  //ReactDOM.unmountComponentAtNode(div);
});
