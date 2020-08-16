
import { CubieCube, Move, FaceletCube } from '../lib/CubeLib';
import { CubeUtil } from "../lib/CubeLib"
import min2phase from "../lib/min2phase"


it('calls cubejs correctly', () => {

  console.debug("tf")
  const cube = new CubieCube().apply("R U B")

  console.log("tf")
  const transformed_cube = cube.to_cstimer_cube()

  console.assert( transformed_cube.is_solveable(), "Cube must be solveable")

  min2phase.initialize();

   min2phase.solve(transformed_cube)
  //Cube.initSolver();
  //ReactDOM.render(<App />, div);
  //ReactDOM.unmountComponentAtNode(div);
});
