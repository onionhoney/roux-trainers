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
    enableControl? : boolean,
    obscureNonLR? : boolean,
    obscureStickerWidth?: string,
    obscureCornerMask?: boolean
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


enum CameraState {
    HOME,
    PEEK_UFL,
    PEEK_DFL,
    PEEK_DFR,
    PEEK_UBR,
    PEEK_UBL
}
type ConfigT = {width: number, height: number, colorScheme: Array<string>, mode?: string,
    faces?: Face[], theme?: string, hintDistance?: number,     enableControl? : boolean,
    cameraState?: CameraState, obscureNonLR?: boolean, obscureStickerWidth?: string, obscureCornerMask?: boolean
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

    //let vertices_float32 = new Float32Array( vertices.length * 3)
    //let vertices_attr = new THREE.BufferAttribute(vertices_float32, 3).copyVector3sArray( vertices)
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

const getCameraPosFromState = function (cstate: CameraState) : [number[], THREE.Vector3]{
    const cameraPosUFR = [2.5, 3.5, 3]
    const cameraPosUFL = [-2, 3.5, 3]
    const cameraPosDFL = [-2, -3.5, 3]
    const cameraPosDFR = [2, -3.5, 3]
    const cameraPosUBR = [2.5, 3.5, -3]
    const cameraPosUBL = [-2, 3.5, -3]

    const upVecLookingDownUB = new THREE.Vector3(0, 0, -1)
    const upVecLookingDownUBL = new THREE.Vector3(0, 0.1, -1)
    const upVecDefault = new THREE.Vector3(0, 1, 0)
    switch (cstate) {
        case CameraState.HOME: return [cameraPosUFR, upVecDefault]
        case CameraState.PEEK_DFL: return [cameraPosDFL, upVecDefault]
        case CameraState.PEEK_DFR: return [cameraPosDFR, upVecDefault]
        case CameraState.PEEK_UFL: return [cameraPosUFL, upVecDefault]
        case CameraState.PEEK_UBL: return [cameraPosUBL, upVecLookingDownUBL]
        default: return [cameraPosUBR, upVecLookingDownUB]
    }
}
const redraw_cube = function (cube: FaceletCubeT, config: ConfigT ) {
    let { width, height, colorScheme, mode, faces, theme, enableControl} = config
    let hintDistance = config.hintDistance || 3
    const bgColor = theme === "bright" ? "#eeeeef" : '#252525'

    mode = mode || "FRU"
    let facesToReveal = faces || [Face.L, Face.B, Face.D]
    //facesToReveal = [Face.L]

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

    const cameraState = config.cameraState || CameraState.HOME
    const [cameraPositionRaw, cameraUp] = getCameraPosFromState(cameraState)
    const cameraPosition = (mode === "FRU") ?
        new THREE.Vector3(cameraPositionRaw[0] * scale,
                          cameraPositionRaw[1] * scale,
                          cameraPositionRaw[2] * scale) :
        new THREE.Vector3(0 / 1.1, 3 / 1.1, 3 / 1.1)

    //console.log("Setting camera up ", cameraUp, " camera pos", cameraPosition)
    camera.up.copy(cameraUp)
    camera.position.copy(cameraPosition)
    camera.aspect = width / height;
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    let stickers_tmpl: THREE.Mesh[], stickerwrap_tmpl: THREE.Mesh
    let obscured_stickers_tmpl: THREE.Group[]
    let greyMaterial: THREE.MeshBasicMaterial

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

    // Get fill scale based on sticker width setting
    const getFillScale = (widthSetting?: string) => {
        switch (widthSetting) {
            case "Thin": return 0.96
            case "Medium": return 0.92
            case "Thick": return 0.88
            default: return 0.92 // Default to Medium
        }
    }
    const fill_scale = getFillScale(config.obscureStickerWidth)
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

        // Create obscured stickers with grey fill and colored border
        greyMaterial = new THREE.MeshBasicMaterial({ color: colorScheme[6], side: THREE.DoubleSide, alphaTest: alpha })

        obscured_stickers_tmpl = materials.map((mat, colorIndex) => {
            return rounded_patterns.map(pattern => {
                // Create a group for the obscured sticker
                const group = new THREE.Group()

                // Grey fill (slightly smaller and behind)
                let fillGeo = roundedFace(pattern, corner_radius)
                geos.push(fillGeo)
                let fillMesh = new THREE.Mesh(fillGeo, greyMaterial)
                fillMesh.scale.set(sticker_scale * fill_scale, sticker_scale * fill_scale, sticker_scale * fill_scale)
                fillMesh.setRotationFromEuler(axesInfo[0][1])
                fillMesh.position.y = 0.01 // Small offset to prevent z-fighting
                group.add(fillMesh)

                // Colored border (original size)
                let borderGeo = roundedFace(pattern, corner_radius)
                geos.push(borderGeo)
                let borderMesh = new THREE.Mesh(borderGeo, mat)
                borderMesh.scale.set(sticker_scale, sticker_scale, sticker_scale)
                borderMesh.setRotationFromEuler(axesInfo[0][1])
                group.add(borderMesh)

                return group
            })
        }).flat()



        let hint_mesh = Array(7).fill(0).map((_, i) => {
            let color = (theme === "bright")
                ? chroma.mix(colorScheme[i], 'white', 0.18).hex()
                : chroma.mix(colorScheme[i], 'black', 0.35).hex()

            let mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });

            let geo = roundedFace([1,1,1,1], corner_radius)
            geos.push(geo)
            let mesh = new THREE.Mesh(geo, mat)
            mesh.scale.set(hint_scale, hint_scale, hint_scale)
            mesh.setRotationFromEuler(axesInfo[0][1])
            return mesh
        })

        // Create obscured hint stickers with grey fill and colored border
        let obscured_hint_mesh = Array(7).fill(0).map((_, i) => {
            // Create a group for the obscured hint sticker
            const group = new THREE.Group()

            // Grey fill (slightly smaller)
            let fillGeo = roundedFace([1,1,1,1], corner_radius)
            geos.push(fillGeo)
            let fillMesh = new THREE.Mesh(fillGeo, hint_mesh[6].material)
            fillMesh.scale.set(hint_scale * fill_scale, hint_scale * fill_scale, hint_scale * fill_scale)
            fillMesh.setRotationFromEuler(axesInfo[0][1])
            fillMesh.position.y = -0.01 // Small offset to prevent z-fighting
            group.add(fillMesh)

            // Colored border (original size)
            let borderGeo = roundedFace([1,1,1,1], corner_radius)
            geos.push(borderGeo)
            let borderMesh = new THREE.Mesh(borderGeo, hint_mesh[i].material)
            borderMesh.scale.set(hint_scale, hint_scale, hint_scale)
            borderMesh.setRotationFromEuler(axesInfo[0][1])
            group.add(borderMesh)

            return group
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
                    let colorIndex = faces[i][idx]
                    let isLRColor = colorIndex === Face.L || colorIndex === Face.R
                    let isCorner = (x === -1 || x === 1) && (z === -1 || z === 1)
                    let shouldObscure = config.obscureNonLR && !isLRColor
                    let shouldMaskCorner = config.obscureCornerMask && isCorner && !isLRColor

                    // If corner masking is on, replace non-LR corner colors with grey
                    let effectiveColorIndex = shouldMaskCorner ? 6 : colorIndex

                    const curr_tmpl = (shouldObscure && !shouldMaskCorner) ? obscured_stickers_tmpl[colorIndex * 9 + idx] : stickers_tmpl[effectiveColorIndex * 9 + idx]
                    const sticker = curr_tmpl.clone()
                    const stickerwrap = stickerwrap_tmpl.clone()

                    const eps = 0.05
                    sticker.position.copy(new THREE.Vector3(x * 2, 3, z * 2))
                    stickerwrap.position.copy(new THREE.Vector3(x * 2, 3 - eps, z * 2))

                    if (facesToReveal.indexOf(i) > -1) { // (i === 5 && mode === "UF")) {
                        let isLRColor = colorIndex === Face.L || colorIndex === Face.R
                        let shouldObscureHint = config.obscureNonLR && !isLRColor
                        const stickerhint = (shouldObscureHint && !shouldMaskCorner) ?
                            obscured_hint_mesh[faces[i][idx]].clone() :
                            hint_mesh[effectiveColorIndex].clone()
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
        cubeG.clear()
        cubeG = drawCube(cube, colorScheme)
        scene.add(cubeG)
        renderer.render(scene, camera)
        return renderer
    }

    const cleanup = () => {
        geos.forEach(g => g.dispose())
        materials_border.dispose()
        geo_border.dispose()
        greyMaterial.dispose()
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
            config.hintDistance === config_cache.hintDistance && config.enableControl === config_cache.enableControl
            && config.cameraState === config_cache.cameraState && config.obscureNonLR === config_cache.obscureNonLR
            && config.obscureStickerWidth === config_cache.obscureStickerWidth && config.obscureCornerMask === config_cache.obscureCornerMask) {

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
    const [cameraState, setCameraState] = React.useState<CameraState>(CameraState.HOME);
    let { width, height, colorScheme, facesToReveal, hintDistance, theme, obscureNonLR, obscureStickerWidth, obscureCornerMask} = props
    let cubePainter = React.useMemo(drawCube, [])
    // obscureNonLR defaults to false for non-SS modes, true only for SS mode when enabled

    const gt_xs = useMediaQuery(useTheme().breakpoints.up('sm'));
    const enableControl = gt_xs

    let painter = cubePainter(props.cube, {
            width, height, colorScheme, faces: facesToReveal, theme, hintDistance, enableControl,
            cameraState, obscureNonLR: obscureNonLR, obscureStickerWidth: obscureStickerWidth, obscureCornerMask: obscureCornerMask})

    useEffect( () => {
        let dom = window //painter.getRenderer().domElement
        function downHandler ( event: KeyboardEvent){
            let suppressLogging = 0
            // intercept keyboard event for local control
            if (event.key === "1") {
                setCameraState(CameraState.PEEK_DFL);
            }
            if (event.key === "2") {
                setCameraState(CameraState.PEEK_DFR);
            }
            if (event.key === "3") {
                setCameraState(CameraState.PEEK_UFL);
            }
            if (event.key === "9") {
                setCameraState(CameraState.PEEK_UBL);
            }
            if (event.key === "0") {
                setCameraState(CameraState.PEEK_UBR);
            }
            else {
                suppressLogging = 1
            }
            if (~suppressLogging) {
                //console.log("CubeSim camera rotateion with key ", event.key)
            }
        }
        function upHandler (event: KeyboardEvent) {
            setCameraState(CameraState.HOME);
        }
        dom.addEventListener('keydown', downHandler);
        dom.addEventListener('keyup', upHandler);
        return () => {
            dom.removeEventListener('keydown', downHandler);
            dom.addEventListener('keyup', upHandler);
        };
    });

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