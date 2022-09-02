import React, { useEffect } from 'react'
import * as SRVisualizer from 'sr-visualizer'
import { MoveSeq } from '../lib/CubeLib'
import {Face as VFace} from 'sr-visualizer'


function CaseVisualizer(props: {name: string, alg: string,size: number, mask?: string, color?: string[], cubeOptions: Partial<SRVisualizer.CubeOptions>}) {
  const mount = React.useRef<HTMLDivElement | null>(null)
  useEffect( () => {
    let dom = mount.current
    if (dom) {
      const args = {
        width: props.size,
	      height: props.size,
        view: 'plan',
	      algorithm: new MoveSeq(props.alg).inv().toString(),
        mask: props.mask as SRVisualizer.Masking,
        ...props.cubeOptions
      }
      const color = props.color
      if (color) {
        // map our scheme (UDFBLR) to theirs (URFDLB)
        args.colorScheme = [
          color[0],
          color[5],
          color[2],
          color[1],
          color[4],
          color[3],
        ]
      }
      SRVisualizer.cubeSVG(dom, args)
    }
    return () => {
      if (dom) dom.innerHTML = ""
    }
  })
  return (<div ref={mount}>
  </div>)
}

export default CaseVisualizer;