import { useEffect, useMemo, useRef } from 'react'
import ForceGraph from '3d-force-graph'
import type { Renderer } from 'three'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { useApp } from '../../state/store'
import type { Subject } from '../../data/schema'
import { search } from '../../services/search'
import { applyDimming, buildGraphData, type FG, type GNode } from './graphUtils'

function makeLabel(n: GNode, mastered: boolean): HTMLElement {
  const el = document.createElement('div')
  el.textContent = n.name
  el.className = 'graph-label' + (n.kind === 'formula' ? ' graph-label--formula' : '')
  if (mastered) el.classList.add('graph-label--mastered')
  return el
}

export function GraphView({ subject }: { subject: Subject }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<FG | null>(null)

  const openWindow = useApp((s) => s.openWindow)
  const weekFilter = useApp((s) => s.weekFilter)
  const topicFilter = useApp((s) => s.topicFilter)
  const searchQuery = useApp((s) => s.searchQuery)
  const mastered = useApp((s) => s.mastered)
  const savedCamera = useApp((s) => s.camera)
  const saveCamera = useApp((s) => s.saveCamera)

  const data = useMemo(() => buildGraphData(subject), [subject])
  const dataRef = useRef(data)
  dataRef.current = data
  const masterRef = useRef(mastered)
  masterRef.current = mastered

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // CSS2D overlay for formula labels
    const labelRenderer = new CSS2DRenderer()
    const dom = labelRenderer.domElement
    dom.style.position = 'absolute'
    dom.style.inset = '0'
    dom.style.pointerEvents = 'none'
    dom.style.zIndex = '2'
    container.appendChild(dom)

    const fg = ForceGraph({ extraRenderers: [labelRenderer as unknown as Renderer] })(container)
      .graphData({ nodes: data.nodes as never[], links: data.links as never[] })
      .backgroundColor('rgba(0,0,0,0)')
      .showNavInfo(false)
      .nodeRelSize(4.2)
      .nodeOpacity(0.92)
      .nodeLabel((n: object) => (n as GNode).name)
      .nodeColor((n: object) => ((n as GNode).dim ? 'rgba(120,130,160,0.08)' : (n as GNode).color))
      .nodeVal((n: object) => ((n as GNode).dim ? 0.01 : (n as GNode).val))
      .linkColor((l: object) => {
        const s = (l as { source: GNode }).source
        const t = (l as { target: GNode }).target
        return s?.dim || t?.dim ? 'rgba(120,130,160,0.05)' : 'rgba(140,170,230,0.22)'
      })
      .linkWidth(0.5)
      .linkOpacity(0.45)
      .onNodeClick((node: object) => {
        const n = node as GNode
        openWindow({ kind: n.kind, id: n.id })
        const live = (fg.graphData().nodes as unknown as GNode[]).find((x) => x.id === n.id)
        if (live && live.x != null) {
          const d = 190
          fg.cameraPosition(
            { x: (live.x ?? 0) + d * 0.55, y: live.y ?? 0, z: (live.z ?? 0) + d },
            { x: live.x ?? 0, y: live.y ?? 0, z: live.z ?? 0 },
            900,
          )
        }
      })

    fg.d3Force('charge')?.strength(-150)

    // Explicit sizing: init may run before layout settles; also handle rotation/panel changes
    const resize = () => {
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      fg.width(w).height(h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    // Attach a CSS2D label to every formula node
    const scene = fg.scene()
    const labels: CSS2DObject[] = []
    for (const n of data.nodes) {
      if (n.kind !== 'formula') continue
      const obj = new CSS2DObject(makeLabel(n, masterRef.current.has(n.id)))
      const live = (fg.graphData().nodes as unknown as GNode[]).find((x) => x.id === n.id)
      if (live) live.__labelObj = obj
      if (live?.x != null) obj.position.set(live.x, live.y ?? 0, live.z ?? 0)
      scene.add(obj)
      labels.push(obj)
    }

    // Keep label objects glued to their nodes each frame
    let raf = 0
    const syncLabels = () => {
      for (const n of fg.graphData().nodes as unknown as (GNode & { __labelObj?: CSS2DObject })[]) {
        const obj = n.__labelObj
        if (obj && n.x != null) obj.position.set(n.x, n.y ?? 0, n.z ?? 0)
      }
      raf = requestAnimationFrame(syncLabels)
    }
    raf = requestAnimationFrame(syncLabels)

    // Persist camera once the layout settles
    fg.onEngineStop(() => {
      const cam = fg.cameraPosition()
      saveCamera({ x: cam.x, y: cam.y, z: cam.z, rx: 0, ry: 0, rz: 0 })
    })

    // Restore or seed the camera
    if (savedCamera) {
      fg.cameraPosition(
        { x: savedCamera.x, y: savedCamera.y, z: savedCamera.z },
        { x: 0, y: 0, z: 0 },
        0,
      )
    } else {
      fg.cameraPosition({ x: 0, y: 40, z: 480 }, { x: 0, y: 0, z: 0 }, 0)
    }

    fgRef.current = fg
    ;(window as unknown as { __fg?: FG }).__fg = fg

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      for (const obj of labels) obj.removeFromParent()
      fg._destructor()
      dom.remove()
      fgRef.current = null
      delete (window as unknown as { __fg?: FG }).__fg
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject])

  // Filters + search dim nodes without rebuilding the graph (stable layout)
  useEffect(() => {
    const matchIds = searchQuery.trim().length
      ? new Set(search(subject, searchQuery).map((h) => h.id))
      : null
    applyDimming(dataRef.current.nodes, subject, weekFilter, topicFilter, matchIds)
    const fg = fgRef.current
    fg?.nodeColor((n: object) => ((n as GNode).dim ? 'rgba(120,130,160,0.08)' : (n as GNode).color))
    fg?.nodeVal((n: object) => ((n as GNode).dim ? 0.01 : (n as GNode).val))
    // Fade the CSS2D pill labels of dimmed formulas to match
    for (const n of dataRef.current.nodes) {
      if (n.kind !== 'formula') continue
      const live = (fg?.graphData().nodes as unknown as (GNode & { __labelObj?: CSS2DObject })[] | undefined)?.find(
        (x) => x.id === n.id,
      )
      live?.__labelObj?.element.classList.toggle('graph-label--dim', n.dim)
    }
    fg?.refresh()
  }, [weekFilter, topicFilter, searchQuery, subject])

  // Reflect mastered state on labels
  useEffect(() => {
    for (const n of data.nodes) {
      if (n.kind !== 'formula') continue
      const live = (fgRef.current?.graphData().nodes as unknown as (GNode & { __labelObj?: CSS2DObject })[] | undefined)?.find(
        (x) => x.id === n.id,
      )
      live?.__labelObj?.element.classList.toggle('graph-label--mastered', mastered.has(n.id))
    }
  }, [mastered, data])

  return (
    <div className="graph-wrap">
      <div ref={containerRef} className="graph-canvas" />
      <div className="graph-legend glass glass--soft">
        <div className="legend-row"><span className="legend-dot legend-dot--formula" /> Formula</div>
        <div className="legend-row"><span className="legend-dot legend-dot--variable" /> Variable</div>
        <div className="legend-row"><span className="legend-dot legend-dot--mastered" /> Mastered</div>
      </div>
      <div className="graph-hint glass glass--soft">
        Drag to rotate · Scroll to zoom · Tap a node to open its explanation
      </div>
    </div>
  )
}
