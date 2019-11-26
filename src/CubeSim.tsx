import React from 'react'

import {CubieCube, Move, FaceletCube} from "./CubeLib";
import {CubieT, FaceletCubeT, Face} from "./Defs";
import { deflateRaw } from 'zlib';
import { Color } from 'csstype';
import * as THREE from 'three';

type Config = {cube: FaceletCubeT, width: number, height: number, colorScheme?: Array<Color>}

/*
How to propagate control of keypress ..? maybe not here, in the app.

Let's look at click analogy: if a user click on sub-component,
that message should be propagated upwards to the parent.

That is, "keydown" should transform to some kind of message, e.g. the resulting cube state
to be passed to the App, which then decides whether to trigger state change or let the cube keep being solved

*/


function draw(canvas : HTMLCanvasElement, cube: FaceletCubeT, colorSchemeOpt?: Array<Color> ) {
    let colorScheme = colorSchemeOpt || ["white", "yellow", "green", "blue", "orange", "red"]
    const ctx = canvas.getContext('2d')!
    // we will draw on a standard size, then scale down if needed
    const HEIGHT = 600, WIDTH = 600;
    const scalex = canvas.height / HEIGHT, scaley = canvas.width / WIDTH;
    ctx.scale(scalex, scaley)
    ctx.clearRect(0, 0, HEIGHT, WIDTH)

    const scene = new THREE.Scene();

    const material = new THREE.MeshBasicMaterial({
        color:0xffffff,
        vertexColors: THREE.FaceColors
    });
    const newCubeGeometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    const newCubeMesh = new THREE.Mesh(newCubeGeometry, material);
    scene.add(newCubeMesh);
    scene.add(newCubeMesh);



    ctx.rect(0, 0, 100, 100)
    ctx.stroke()
    // draw uface
    // uface bottom right = (0,0), width = 200, height =

    ctx.beginPath();
    ctx.moveTo(75, 50);
    ctx.lineTo(100, 75);
    ctx.lineTo(100, 25);
    ctx.fill();
    //ctx.fillStyle =
}

type AxesInfo = [THREE.Vector3, THREE.Euler, THREE.Material]
const TAU = Math.PI * 2;
const axesInfoPre : [THREE.Vector3, THREE.Euler][] = [
    [new THREE.Vector3( 0,  1,  0), new THREE.Euler(-TAU/4,  0,  0)],
    [new THREE.Vector3( 0, -1,  0), new THREE.Euler( TAU/4,  0,  0)],
    [new THREE.Vector3( 0,  0,  1), new THREE.Euler( 0,  0,      0)],
    [new THREE.Vector3( 0,  0, -1), new THREE.Euler( 0,  TAU/2,  0)],
    [new THREE.Vector3(-1,  0,  0), new THREE.Euler( 0, -TAU/4,  0)],
    [new THREE.Vector3( 1,  0,  0), new THREE.Euler( 0,  TAU/4,  0)],
];
function CubeSim(props: Config) {
  const mount = React.useRef<HTMLDivElement | null>(null)
  let colorScheme = props.colorScheme || [0xffffff, 0xffff00,  0x00ff00, 0x0000ff, 0xff8800, 0xff0000]

  React.useEffect(() => {
    let width = mount.current!.clientWidth
    let height = mount.current!.clientHeight
    //draw(canvasRef.current!, props.cube, props.colorScheme)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    const geo = new THREE.PlaneGeometry(0.9 * 2, 0.9 * 2)
    const geo_border = new THREE.PlaneGeometry(1 * 2, 1 * 2)
    const materials = Array(6).fill(0).map( (_, i) => new THREE.MeshBasicMaterial({ color: colorScheme[i], side:THREE.DoubleSide}))
    const materials_border = new THREE.MeshBasicMaterial({ color: 0x000000, side:THREE.DoubleSide })


    const axesInfo : AxesInfo[] = axesInfoPre.map( ([a, b], i) => ([a, b, materials[i]]) )

    // define stickers for u face
    //let stickers : THREE.Mesh[] = []

    // corner: (1,1,1) +
    const cube = new THREE.Group();
    //type Mode = "UF" | "FRU"
    let mode = "FRU"
    for (let i = 0; i < 6; i++) {
        const cubie = new THREE.Group();
        const rot = new THREE.Matrix4().makeRotationFromEuler(axesInfo[i][1]);
        const rot1 = new THREE.Matrix4().makeRotationFromEuler(axesInfo[1][1]);
        cubie.setRotationFromMatrix(rot.multiply(rot1))

        for (let z = -1; z <= 1; z++) {
            for (let x = -1; x <= 1; x++) {
                let idx = (z + 1) * 3 + (x + 1)
                let material = materials[props.cube[i][idx]]
                const sticker = new THREE.Mesh(geo, material )
                const stickerwrap = new THREE.Mesh(geo_border, materials_border )

                const stickergroup = new THREE.Group()
                const eps = 0.04

                sticker.setRotationFromEuler(axesInfo[0][1])
                sticker.position.copy(new THREE.Vector3(x * 2, 3, z * 2))
                stickerwrap.setRotationFromEuler(axesInfo[0][1])
                stickerwrap.position.copy(new THREE.Vector3(x * 2, 3 - eps, z * 2))

                stickergroup.add(sticker)
                stickergroup.add(stickerwrap)


                if (i == 4 || i == 3 || i == 1 || (i == 5 && mode === "UF")) {
                    const sticker_hint = new THREE.Mesh(geo, material)
                    sticker_hint.setRotationFromEuler(axesInfo[0][1])
                    sticker_hint.position.copy(new THREE.Vector3(x * 2, 3 + 3 + 3, z * 2))
                    stickergroup.add(sticker_hint)
                }
                cubie.add(stickergroup)
            }
        }
        cube.add(cubie)
    }

    // l side
    for (let i = 4; i === 4; i++) {

    }
    /*
    const cubie_f = new THREE.Group();
    for (let z = -1; z <= 1; z++) {
        for (let x = -1; x <= 1; x++) {
            let idx = (z + 1) * 3 + (x + 1)
            const sticker = new THREE.Mesh(geo, materials[2])
            sticker.position.copy(new THREE.Vector3(x * 2, 3, z * 2).add( axesInfo[0][0]))
            sticker.setRotationFromEuler(axesInfo[0][1])
            cubie_f.add(sticker)
        }
    }
    cube.add(cubie_f)
    */
    cube.scale.set(1/3, 1/3, 1/3)

    if (mode == "FRU")
        camera.position.copy(new THREE.Vector3(2.2 / 1.1, 3/1.1, 3/1.1))
    else
        camera.position.copy(new THREE.Vector3(0 / 1.1, 3/1.1, 3/1.1))

    //camera.position.copy(new THREE.Vector3(2.5, 5, 5))
    camera.lookAt(new THREE.Vector3(0, 0, 0))


    scene.add(cube)
    renderer.setClearColor('#000000')
    renderer.setSize(width, height)

    mount.current!.appendChild(renderer.domElement)

    const renderScene = () => {
        renderer.render(scene, camera)
      }
    renderScene()

    let current = mount.current!

    return () => {
        current.removeChild(renderer.domElement)
        scene.remove(cube)
        geo.dispose()
        materials.forEach(m => m.dispose())
    }
    })
    let {height, width} = props

    return <div
        ref = {mount}
        style = {{width, height}}
    />;
}

export default CubeSim