import React, { useEffect } from 'react'

import { FaceletCubeT, Face } from "../lib/Defs";
import * as THREE from 'three';
import { arrayEqual } from '../lib/Math';
import * as chroma from 'chroma-js';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { OrbitControls } from '../lib/three/OrbitControls';

type Config = {
    cube: FaceletCubeT, width: number, height: number, colorScheme: Array<string>, facesToReveal: Face[],
    theme: string,
    hintDistance?: number,
    enableControl? : boolean
}
let { Vector3 } = THREE

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
    // UDFBLR
    [new THREE.Vector3(0, 1, 0), new THREE.Euler(-TAU / 4, 0, 0)],
    [new THREE.Vector3(0, -1, 0), new THREE.Euler(TAU / 4, 0, 0)],
    [new THREE.Vector3(0, 0, 1), new THREE.Euler(0, 0, 0)],
    [new THREE.Vector3(0, 0, -1), new THREE.Euler(0, TAU / 2, 0)],
    [new THREE.Vector3(-1, 0, 0), new THREE.Euler(0, -TAU / 4, 0)],
    [new THREE.Vector3(1, 0, 0), new THREE.Euler(0, TAU / 4, 0)],
];


type ConfigT = {width: number, height: number, colorScheme: Array<string>, mode?: string,
    faces?: Face[], theme?: string, hintDistance?: number,     enableControl? : boolean
}

const roundedFace = ((rounded?: number[], cornerRadius?: number, ) => {
    cornerRadius = cornerRadius || 0.1
    rounded = rounded || [1, 1, 1, 1]
    let geo = new THREE.BufferGeometry()
    let cornerVertices = []
    let cornerCenter = new THREE.Vector3(1 - cornerRadius, 1 - cornerRadius, 0)
    let squareCorner = new THREE.Vector3(1, 1, 0)
    for (let i = 0; i <= 90; i += 10) {
        let degree = (i * Math.PI) / 180
        cornerVertices.push( 
            cornerCenter.clone().add(new THREE.Vector3(Math.cos(degree), Math.sin(degree), 0).multiplyScalar(cornerRadius))
        )
    }
    let vertices = []
    for (let i = 0; i < 4; i++) {
        if (rounded[i]) {
            vertices.push(...cornerVertices)
        } else {
            vertices.push(squareCorner.clone())
        }
        cornerVertices = cornerVertices.map(x => x.clone().applyAxisAngle(new Vector3(0, 0, 1), 0.5 * Math.PI))
        squareCorner.applyAxisAngle(new Vector3(0, 0, 1), 0.5 * Math.PI)
    }
    //vertices.push(new Vector3(0, 0, 0))

    let vertices_float32 = new Float32Array( vertices.length * 3)
    let vertices_attr = new THREE.BufferAttribute(vertices_float32, 3).copyVector3sArray( vertices)
    // console.log(vertices_attr)
    let faces = []
    for (let i = 0; i< vertices.length; i++) {
        let i1 = (i + 1) % vertices.length;
        faces.push(vertices[vertices.length - 1])
        faces.push(vertices[i])
        faces.push(vertices[i1])
    }
    geo.setFromPoints(faces)

    return geo
})



const redraw_cube = function (cube: FaceletCubeT, config: ConfigT ) {
    let { width, height, colorScheme, mode, faces, theme, enableControl} = config
    let hintDistance = config.hintDistance || 3
    const bgColor = theme === "bright" ? "#eeeeef" : '#252525' 

    mode = mode || "FRU"
    let facesToReveal = faces || [Face.L, Face.B, Face.D]

    const scene = new THREE.Scene()
    const angle = 50
    const camera = new THREE.PerspectiveCamera(angle, width / height, 0.1, 1000)

    const mag = 1.0
    const alpha = 0.5
    const enableBorder = true

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height, true);
    //renderer.setViewport( 0, 0, width * window.devicePixelRatio, height * window.devicePixelRatio);
    renderer.setClearColor(bgColor) // #70788a') //#5a606e') // '#373B43') // '#eeeeee')
    renderer.setPixelRatio(window.devicePixelRatio)
    let controls = new OrbitControls( camera, renderer.domElement );
    controls.enabled = !!config.enableControl

    const angleScale = Math.sin(70 / 180 * Math.PI)  /  Math.sin(angle / 180 * Math.PI)
    const scale = (hintDistance > 5) ? .96 * angleScale : .9 * angleScale
    const cameraPosition = (mode === "FRU") ? new THREE.Vector3(2.5 * scale, 3.5 * scale, 3 * scale) : new THREE.Vector3(0 / 1.1, 3 / 1.1, 3 / 1.1)
    camera.position.copy(cameraPosition)
    camera.aspect = width / height;
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    let stickers_tmpl: THREE.Mesh[], stickerwrap_tmpl: THREE.Mesh

    const geos : THREE.BufferGeometry[] = []; // new THREE.PlaneGeometry(0.89 * mag * 2, 0.89 * mag * 2)
    const geo_border = new THREE.PlaneGeometry(2.0, 2.0)//1.0 * mag * 2, 1.0 * mag * 2)

    let materials_border = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.FrontSide })
    stickerwrap_tmpl = (() => {
        let mesh = new THREE.Mesh(geo_border, materials_border)
        mesh.setRotationFromEuler(axesInfo[0][1])
        return mesh
    })()

    const sticker_scale = 0.88
    const corner_radius = 0.4
    const hint_scale = 0.95
    const rounded_patterns = [
        [0, 0, 0, 1],
        [0, 0, 1, 1],
        [0, 0, 1, 0],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
        [0, 1, 1, 0],
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0]
    ];

    function drawCube(faces: FaceletCubeT, colorScheme: Array<string>): THREE.Group {
        //console.log("update color scheme ", colorScheme_)
        let materials = Array(7).fill(0).map((_, i) => {
            let mat = new THREE.MeshBasicMaterial({ color: colorScheme[i], side: THREE.DoubleSide });
            mat.alphaTest = alpha;
            return mat
        })

        stickers_tmpl = materials.map((mat) => {
            return rounded_patterns.map(pattern => {
                let geo = roundedFace(pattern, corner_radius)
                geos.push(geo)
                let mesh = new THREE.Mesh(geo, mat)
                mesh.scale.set(sticker_scale, sticker_scale, sticker_scale)
                mesh.setRotationFromEuler(axesInfo[0][1])
                return mesh
            })
        }).flat()

        let hint_mesh = Array(7).fill(0).map((_, i) => {
            let color = (theme === "bright") 
                ? chroma.mix(colorScheme[i], 'white', 0.18).hex()
               :  chroma.mix(colorScheme[i], 'black', 0.35).hex()
 
               // 
            //chroma.default(colorScheme[i]).brighten(0.7).hex()
                  //desaturate(2).hex() //darken(0.5).hex()
            let mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });

            let geo = roundedFace([1,1,1,1], corner_radius)
            geos.push(geo)
            let mesh = new THREE.Mesh(geo, mat)
            mesh.scale.set(hint_scale, hint_scale, hint_scale)
            mesh.setRotationFromEuler(axesInfo[0][1])
            return mesh
        })


        const cube = new THREE.Group();
        for (let i = 0; i < 6; i++) {
            const cubie = new THREE.Group();
            const rot = new THREE.Matrix4().makeRotationFromEuler(axesInfo[i][1]);
            const rot1 = new THREE.Matrix4().makeRotationFromEuler(axesInfo[1][1]);
            cubie.setRotationFromMatrix(rot.multiply(rot1))
            for (let z = -1; z <= 1; z++) {
                for (let x = -1; x <= 1; x++) {
                    let idx = (z + 1) * 3 + (x + 1)

                    const curr_tmpl = stickers_tmpl[faces[i][idx] * 9 + idx]
                    const sticker = curr_tmpl.clone()
                    const stickerwrap = stickerwrap_tmpl.clone()

                    const eps = 0.05
                    sticker.position.copy(new THREE.Vector3(x * 2, 3, z * 2))
                    stickerwrap.position.copy(new THREE.Vector3(x * 2, 3 - eps, z * 2))

                    if (facesToReveal.indexOf(i) > -1) { // (i === 5 && mode === "UF")) {
                        const stickerhint = hint_mesh[faces[i][idx]].clone()
                        stickerhint.position.copy(new THREE.Vector3(x * 2, 3 + hintDistance, z * 2))
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

    let cubeG = drawCube(cube, colorScheme)
    scene.add(cubeG)

    const render = () => {
        controls.update();
        renderer.render(scene, camera)
    }
    render()

    let frameID = -1
    const animate = () => {
        frameID = requestAnimationFrame(animate)
        renderer.render(scene, camera)
    }
    animate()

    const updateCubeAndColor = (cube: FaceletCubeT, colorScheme: Array<string>) => {
        scene.remove(cubeG)
        cubeG = drawCube(cube, colorScheme)
        scene.add(cubeG)
        renderer.render(scene, camera)
        return renderer
    }

    const cleanup = () => {
        geos.forEach(g => g.dispose())
        materials_border.dispose()
        geo_border.dispose()
        scene.remove(cubeG)
        cancelAnimationFrame(frameID)
    }
    return {
        updateCubeAndColor,
        getRenderer: () => renderer,
        cleanupFunc: cleanup,
        renderControls: render
    }
    //let defaultColorScheme = [ 0x00ff00, 0x0000ff, 0xff0000,0xff8800,0xffff00, 0xffffff]
}

let drawCube = (function(){
    let config_cache : ConfigT | null = null
    let painter : Painter | null = null
    let func = (cube: FaceletCubeT, config: ConfigT) => {
        if (config_cache === null) {
            painter?.cleanupFunc()

            painter = redraw_cube(cube, config)
            config_cache = config
            return painter
        }
        else if (config.width === config_cache.width && config.height === config_cache.height &&
            arrayEqual(config.faces || [], config_cache.faces || []) && config.theme === config_cache.theme &&
            config.hintDistance === config_cache.hintDistance && config.enableControl === config_cache.enableControl) {

            painter?.updateCubeAndColor(cube, config.colorScheme)
            config_cache = config
            return painter!
        } else {
            painter?.cleanupFunc()
            painter = redraw_cube(cube, config)
            config_cache = config
            return painter!
        }
    }
    return func
})

type Painter = {
    updateCubeAndColor: (cube: FaceletCubeT, scheme: Array<string>) => THREE.WebGLRenderer,
    getRenderer: () => THREE.WebGLRenderer,
    cleanupFunc: () => void,
    renderControls: () => void

}

function CubeSim(props: Config) {
    const mount = React.useRef<HTMLDivElement | null>(null)
    let { width, height, colorScheme, facesToReveal, hintDistance, theme} = props
    let cubePainter = React.useMemo(drawCube, [])


    const gt_xs = useMediaQuery(useTheme().breakpoints.up('sm'));
    const enableControl = gt_xs

    let painter = cubePainter(props.cube, {
            width, height, colorScheme, faces: facesToReveal, theme, hintDistance, enableControl })

    useEffect( () => {
        let dom = mount.current!
        dom.appendChild(painter.getRenderer().domElement) //renderer.domElement)
        return () => {
            dom.removeChild(painter.getRenderer().domElement)
        }
    })

    return <div
        ref={mount}
        style={{ width: props.width, height: props.height, zIndex: 1 }}
    />;
}

export default CubeSim