import React, { useEffect } from 'react'
import * as SRVisualizer from 'sr-visualizer'
import { MoveSeq } from '../lib/CubeLib'


function CaseVisualizer(props: {name: string, alg: string,size: number, mask?: string, cubeOptions: Partial<SRVisualizer.CubeOptions>}) {
  const mount = React.useRef<HTMLDivElement | null>(null)
  useEffect( () => {
    let dom = mount.current
    if (dom) {
      SRVisualizer.cubeSVG(dom, {
        width: props.size,
	      height: props.size,
        view: 'plan',
	      algorithm: new MoveSeq(props.alg).inv().toString(),
        mask: props.mask as SRVisualizer.Masking,
        ...props.cubeOptions
      })
    }
    return () => {
      if (dom) dom.innerHTML = ""
    }
  })
  return (<div ref={mount}>
  </div>)
}

export default CaseVisualizer;