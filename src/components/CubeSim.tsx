import React, { useEffect } from 'react'

import { FaceletCubeT, Face } from "../lib/Defs";
import * as THREE from 'three';
import { useTheme } from '@material-ui/core';
import { getConfig } from '../lib/Local';

type Config = {
    cube: FaceletCubeT, width: number, height: number, colorScheme: Array<number>, facesToReveal: Face[],
    bgColor?: string
}

/*
How to propagate control of keypress ..? maybe not here, in the app.

Let's look at click analogy: if a user click on sub-component,
that message should be propagated upwards to the parent.

That is, "keydown" should transform to some kind of message, e.g. the resulting cube state
to be passed to the App, which then decides whether to trigger state change or let the cube keep being solved

*/


type AxesInfo = [THREE.Vector3, THREE.Euler]
const TAU = Math.PI * 2;
const axesInfo: [THREE.Vector3, THREE.Euler][] = [
    [new THREE.Vector3(0, 1, 0), new THREE.Euler(-TAU / 4, 0, 0)],
    [new THREE.Vector3(0, -1, 0), new THREE.Euler(TAU / 4, 0, 0)],
    [new THREE.Vector3(0, 0, 1), new THREE.Euler(0, 0, 0)],
    [new THREE.Vector3(0, 0, -1), new THREE.Euler(0, TAU / 2, 0)],
    [new THREE.Vector3(-1, 0, 0), new THREE.Euler(0, -TAU / 4, 0)],
    [new THREE.Vector3(1, 0, 0), new THREE.Euler(0, TAU / 4, 0)],
];

const setup = function (width: number, height: number, colorScheme?: Array<number>, mode?: string,
    faces?: Face[]) {
    let facesToReveal = faces || [Face.L, Face.B, Face.D]
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    const mag = 1.0
    const alpha = 0.5
    const enableBorder = true
    const geo = new THREE.PlaneGeometry(0.89 * mag * 2, 0.89 * mag * 2)
    const geo_border = new THREE.PlaneGeometry(1.0 * mag * 2, 1.0 * mag * 2)
    //const geo_border = new THREE.EdgesGeometry(geo_border_0)
    renderer.setPixelRatio(window.devicePixelRatio)

    //let colorScheme_ = colorScheme || [0xffffff, 0xffff00,  0x00ff00, 0x0000ff, 0xff8800, 0xff0000]

    mode = mode || "FRU"

    if (mode === "FRU")
        camera.position.copy(new THREE.Vector3(2.6 / 1.1, 3 / 1.1, 3 / 1.1))
    else
        camera.position.copy(new THREE.Vector3(0 / 1.1, 3 / 1.1, 3 / 1.1))

    //camera.position.copy(new THREE.Vector3(2.5, 5, 5))
    camera.lookAt(new THREE.Vector3(0, 0, 0))


    let stickers_tmpl: THREE.Mesh[], stickerwrap_tmpl: THREE.Mesh

    function updateFacesToReveal(faces: Face[]) {
        facesToReveal = faces
    }
    function updateColorScheme(colorScheme: Array<number>) {
        let colorScheme_ = colorScheme
        //console.log("update color scheme ", colorScheme_)
        let materials = Array(7).fill(0).map((_, i) => {
            let mat = new THREE.MeshBasicMaterial({ color: colorScheme_[i], side: THREE.DoubleSide });
            mat.alphaTest = alpha;
            return mat
        })

        stickers_tmpl = materials.map((mat) => {
            let mesh = new THREE.Mesh(geo, mat)
            mesh.setRotationFromEuler(axesInfo[0][1])
            return mesh
        })

        let materials_border = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.FrontSide })
        stickerwrap_tmpl = (() => {
            let mesh = new THREE.Mesh(geo_border, materials_border)
            mesh.setRotationFromEuler(axesInfo[0][1])
            return mesh
        })()
    }

    function drawCube(faces: FaceletCubeT): THREE.Group {
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

                    const eps = 0.05
                    sticker.position.copy(new THREE.Vector3(x * 2, 3, z * 2))
                    stickerwrap.position.copy(new THREE.Vector3(x * 2, 3 - eps, z * 2))

                    if (facesToReveal.indexOf(i) > -1) { // (i === 5 && mode === "UF")) {
                        const stickerhint = curr_tmpl.clone()
                        stickerhint.position.copy(new THREE.Vector3(x * 2, 3 + 7 + 3, z * 2))
                        cubie.add(stickerhint)

                    }
                    if (enableBorder)
                        cubie.add(stickerwrap)

                    cubie.add(sticker)
                }

            }
            cube.add(cubie)
        }
        cube.scale.set(1 / 3, 1 / 3, 1 / 3)
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

    const updateWidthHeight = (width: number, height: number, clearColor?: string) => {
        const canvas = renderer.domElement;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, true);
            clearColor = clearColor || '#eeeeef';
            //renderer.setViewport( 0, 0, width * window.devicePixelRatio, height * window.devicePixelRatio);
            renderer.setClearColor(clearColor) // #70788a') //#5a606e') // '#373B43') // '#eeeeee')
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
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
        domElement: () => { return renderer.domElement },
        updateCube,
        renderScene,
        updateWidthHeight,
        cleanup,
        updateColorScheme,
        updateFacesToReveal
    }
}

let cubeSim = setup(370, 370)

function CubeSim(props: Config) {
    const mount = React.useRef<HTMLDivElement | null>(null)
    let { width, height } = props

    useEffect(() => {
        let dom = cubeSim.domElement()
        let current = mount.current!

        current.appendChild(dom)
        cubeSim.updateFacesToReveal(props.facesToReveal)
        cubeSim.updateWidthHeight(width, height, props.bgColor || "#eeeeef")
        cubeSim.updateColorScheme(props.colorScheme)
        cubeSim.updateCube(props.cube)
        cubeSim.renderScene()

        return () => {
            current.removeChild(dom)
        }
    })

    return <div
        ref={mount}
        style={{ width: props.width, height: props.height }}
    />;
}

export default CubeSim