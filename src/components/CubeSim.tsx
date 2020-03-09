import React, { useEffect } from 'react'

import { FaceletCubeT } from "../lib/Defs";
import * as THREE from 'three';

type Config = {cube: FaceletCubeT, width: number, height: number, colorScheme: Array<number>}

/*
How to propagate control of keypress ..? maybe not here, in the app.

Let's look at click analogy: if a user click on sub-component,
that message should be propagated upwards to the parent.

That is, "keydown" should transform to some kind of message, e.g. the resulting cube state
to be passed to the App, which then decides whether to trigger state change or let the cube keep being solved

*/


type AxesInfo = [THREE.Vector3, THREE.Euler]
const TAU = Math.PI * 2;
const axesInfo : [THREE.Vector3, THREE.Euler][] = [
    [new THREE.Vector3( 0,  1,  0), new THREE.Euler(-TAU/4,  0,  0)],
    [new THREE.Vector3( 0, -1,  0), new THREE.Euler( TAU/4,  0,  0)],
    [new THREE.Vector3( 0,  0,  1), new THREE.Euler( 0,  0,      0)],
    [new THREE.Vector3( 0,  0, -1), new THREE.Euler( 0,  TAU/2,  0)],
    [new THREE.Vector3(-1,  0,  0), new THREE.Euler( 0, -TAU/4,  0)],
    [new THREE.Vector3( 1,  0,  0), new THREE.Euler( 0,  TAU/4,  0)],
];

const setup = function(width: number, height: number, colorScheme?: Array<number>, mode?: string) {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    const geo = new THREE.PlaneGeometry(0.9 * 2, 0.9 * 2)
    const geo_border = new THREE.PlaneGeometry(1 * 2, 1 * 2)

    //let colorScheme_ = colorScheme || [0xffffff, 0xffff00,  0x00ff00, 0x0000ff, 0xff8800, 0xff0000]

    mode = mode || "FRU"

    if (mode === "FRU")
        camera.position.copy(new THREE.Vector3(2.2 / 1.1, 3/1.1, 3/1.1))
    else
        camera.position.copy(new THREE.Vector3(0 / 1.1, 3/1.1, 3/1.1))

    //camera.position.copy(new THREE.Vector3(2.5, 5, 5))
    camera.lookAt(new THREE.Vector3(0, 0, 0))


    let stickers_tmpl: THREE.Mesh[] , stickerwrap_tmpl: THREE.Mesh

    function updateColorScheme(colorScheme: Array<number>) {
        let colorScheme_ = colorScheme
        //console.log("update color scheme ", colorScheme_)
        let materials = Array(6).fill(0).map( (_, i) => new THREE.MeshBasicMaterial({ color: colorScheme_[i], side:THREE.DoubleSide}))
        let materials_border = new THREE.MeshBasicMaterial({ color: 0x000000, side:THREE.DoubleSide })
        stickers_tmpl = materials.map( (mat) => {
            let mesh = new THREE.Mesh(geo, mat)
            mesh.setRotationFromEuler(axesInfo[0][1])
            return mesh
        })
        stickerwrap_tmpl = (() => {
            let mesh = new THREE.Mesh(geo_border, materials_border)
            mesh.setRotationFromEuler(axesInfo[0][1])
            return mesh
        })()
    }

    function drawCube(faces: FaceletCubeT) : THREE.Group {
        const cube = new THREE.Group();
        for (let i = 0; i < 6; i++) {
            const cubie = new THREE.Group();
            const rot = new THREE.Matrix4().makeRotationFromEuler(axesInfo[i][1]);
            const rot1 = new THREE.Matrix4().makeRotationFromEuler(axesInfo[1][1]);
            cubie.setRotationFromMatrix(rot.multiply(rot1))
            for (let z = -1; z <= 1; z++) {
                for (let x = -1; x <= 1; x++) {
                    let idx = (z + 1) * 3 + (x + 1)

                    const curr_tmpl = stickers_tmpl[faces[i][idx]]
                    const sticker = curr_tmpl.clone()
                    const stickerwrap = stickerwrap_tmpl.clone()

                    const eps = 0.04
                    sticker.position.copy(new THREE.Vector3(x * 2, 3, z * 2))
                    stickerwrap.position.copy(new THREE.Vector3(x * 2, 3 - eps, z * 2))

                    if (i === 4 /*|| i === 3 || i === 1 */ ||  (i === 5 && mode === "UF")) {
                        const stickerhint = curr_tmpl.clone()
                        stickerhint.position.copy(new THREE.Vector3(x * 2, 3 + 3 + 3, z * 2))
                        cubie.add(stickerhint)
                    }
                    cubie.add(sticker)
                    cubie.add(stickerwrap)
                }
            }
            cube.add(cubie)
        }
        cube.scale.set(1/3, 1/3, 1/3)
        return cube
    }

    let cubeG = new THREE.Group();
    scene.add(cubeG)
    const updateCube = (cube: FaceletCubeT) => {
        scene.remove(cubeG)
        cubeG = drawCube(cube)
        scene.add(cubeG)
    }

    const renderScene = () => {
        renderer.render(scene, camera)
    }

    const updateWidthHeight = (width: number, height: number) => {
        renderer.setSize(width, height, false);
        renderer.setClearColor('#fafafa')
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }


    const cleanup = () => {
        geo.dispose()
        //materials.forEach(m => m.dispose())
    }

    //let defaultColorScheme = [ 0x00ff00, 0x0000ff, 0xff0000,0xff8800,0xffff00, 0xffffff]
    updateWidthHeight(width, height)
    //updateColorScheme(defaultColorScheme)
    //updateCube(FaceletCube.from_cubie( CubieCube.id))


    return {
        domElement: () => {return renderer.domElement},
        updateCube,
        renderScene,
        updateWidthHeight,
        cleanup,
        updateColorScheme
    }
}

const cubeSim = setup(370, 370)

function CubeSim(props: Config) {
  const mount = React.useRef<HTMLDivElement | null>(null)

  useEffect( () => {
    let dom = cubeSim.domElement()
    let current = mount.current!
    current.appendChild(dom)

    cubeSim.updateColorScheme(props.colorScheme)
    cubeSim.updateCube(props.cube)
    cubeSim.renderScene()
    console.log("render scnee")

    return () => {
        current.removeChild( dom )
    }
  } )

  return <div
      ref = {mount}
      style = {{width : props.width, height : props.height}}
  />;
}

export default CubeSim