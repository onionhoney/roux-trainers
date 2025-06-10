import React, { useEffect } from 'react'

import { FaceletCubeT } from "../lib/Defs";

type Config = {
    cube: FaceletCubeT, width: number, height: number, colorScheme: Array<string>,
    theme: string
}

function draw(ctx: CanvasRenderingContext2D, props: Config) {
    let { width, height, colorScheme} = props

    ctx.clearRect(0, 0, width, height)
    // size = size of cube
    let size = Math.min(width, height)
    let uSize = size * 0.5;
    let uStickerSize = uSize / 3; // 0.2
    const uStrokeWidth = uStickerSize * 0.10;
    const sideStrokeWidth = uStickerSize * 0.10;
    ctx.lineWidth = uStrokeWidth;

    ctx.resetTransform()
    let ratio = window.devicePixelRatio || 1;
    ctx.scale(ratio, ratio)
    ctx.translate((width - uSize) / 2, (size - uSize) / 2)
    let sStickerHeight = uStickerSize * 0.33;
    let sStickerOuterShift = uStickerSize * 0.1;
    let sStickerInnerShift = uStickerSize * 0.038;
    function drawSideSticker(idx: number, angle: number, sticker: number) {
        ctx.save()
        ctx.translate(uSize / 2, uSize / 2)
        ctx.rotate(angle)
        ctx.translate(-uSize / 2, -uSize / 2)
        ctx.beginPath()

        const leftShift  = (idx === 0) ? sStickerOuterShift : (idx === 1) ? sStickerInnerShift : -sStickerInnerShift;
        const rightShift = (idx === 0) ? sStickerInnerShift : (idx === 1) ? -sStickerInnerShift : -sStickerOuterShift;
        const topLeftX = idx * uStickerSize + leftShift
        const topRightX = (idx + 1) * uStickerSize + rightShift
        const topY = -sStickerHeight
        const bottomLeftX = idx * uStickerSize
        const bottomRightX = bottomLeftX + uStickerSize
        const bottomY = 0

        ctx.moveTo(topLeftX, topY)
        ctx.lineTo(topRightX, topY)
        ctx.lineTo(bottomRightX, bottomY)
        ctx.lineTo(bottomLeftX, bottomY)
        ctx.lineTo(topLeftX, topY)
        ctx.closePath()
        ctx.fillStyle = colorScheme[sticker]
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }
    function drawUSticker(x: number, y:number, sticker:number) {
        ctx.fillStyle = colorScheme[sticker]
        ctx.fillRect(x, y, uStickerSize, uStickerSize)
        ctx.strokeStyle = 'black'
        ctx.strokeRect(x, y, uStickerSize, uStickerSize)
    }

    for (let i = 0 ;i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const sticker = props.cube[0][i * 3 + j]
            drawUSticker(j * uStickerSize, i * uStickerSize, sticker)
        }
    }
    // F=2,B=3,L=4,R=5
    ctx.lineWidth = sideStrokeWidth;
    for (let i = 0; i < 3; i++) {
        drawSideSticker(2-i, Math.PI, props.cube[2][i])
        drawSideSticker(2-i, 0, props.cube[3][i])
        drawSideSticker(2-i, Math.PI * 1.5, props.cube[4][i])
        drawSideSticker(2-i, Math.PI * 0.5, props.cube[5][i])
    }

}
function CubeSim2D(props: Config) {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
    useEffect( () => {
        const canvas = canvasRef.current!
        let ratio = window.devicePixelRatio || 1;
        canvas.height = props.height * ratio
        canvas.width = props.width * ratio
        const ctx = canvas.getContext('2d')
        draw(ctx!, props)
    })

    return <canvas
        ref={canvasRef}
        style={{ width: props.width, height: props.height, zIndex: 1 }}
    />;
}

export default CubeSim2D