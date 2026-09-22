import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  Link2,
  Layers,
  Shield,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Smartphone,
  Globe,
  CreditCard,
  ArrowRight,
  X,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tooltip } from "@/components/ui/tooltip"
import { RiskBadge } from "@/components/ui/risk-badge"
import { networkNodes, networkEdges, devices, ipAddresses, customers } from "@/data/mock"
import type { NetworkNode, NetworkEdge } from "@/data/mock"
import { cn, getRiskLevel } from "@/lib/utils"

type EntityType = "customer" | "device" | "ip" | "transaction"
type RiskFilter = "ALL" | "LOW" | "MEDIUM" | "HIGH"
type LayoutMode = "force" | "circular" | "hierarchical"

const VIEW_W = 1400
const VIEW_H = 800

const typeFilters: { type: EntityType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "customer", label: "Customers", icon: Users },
  { type: "device", label: "Devices", icon: Smartphone },
  { type: "ip", label: "IPs", icon: Globe },
  { type: "transaction", label: "Transactions", icon: CreditCard },
]

// Pre-computed force-directed-like positions spread across the canvas
const basePositions: Record<string, { x: number; y: number }> = {
  "CUST-0009": { x: 540, y: 260 },
  "CUST-0024": { x: 700, y: 330 },
  "CUST-0005": { x: 500, y: 520 },
  "CUST-0017": { x: 680, y: 560 },
  "DEV-00I9V2": { x: 620, y: 300 },
  "DEV-00I9R8": { x: 460, y: 180 },
  "DEV-00X4S5": { x: 800, y: 420 },
  "DEV-00Q7H4": { x: 560, y: 580 },
  "185.220.101.1": { x: 380, y: 200 },
  "185.220.101.5": { x: 820, y: 360 },
  "185.220.101.6": { x: 860, y: 470 },
  "185.220.101.88": { x: 760, y: 640 },
  "TXN-00013": { x: 500, y: 120 },
  "TXN-00042": { x: 760, y: 250 },
  "LOC-miami": { x: 640, y: 700 },
  "TXN-00007": { x: 420, y: 620 },
  "TXN-00008": { x: 340, y: 500 },
  "TXN-00043": { x: 880, y: 300 },
  "TXN-00044": { x: 920, y: 400 },
  "TXN-00031": { x: 620, y: 660 },
  "TXN-00032": { x: 780, y: 620 },
  "DEV-00X4T6": { x: 880, y: 350 },
  "DEV-00X4U7": { x: 920, y: 440 },
  "DEV-00Q7I5": { x: 720, y: 640 },
}

function computeCircularPositions(nodes: NetworkNode[]): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {}
  const cx = VIEW_W / 2
  const cy = VIEW_H / 2
  const radius = Math.min(VIEW_W, VIEW_H) * 0.36
  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
    pos[node.id] = { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }
  })
  return pos
}

function computeHierarchicalPositions(nodes: NetworkNode[], edges: NetworkEdge[]): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {}
  const levelOf: Record<string, number> = {}
  const adj: Record<string, string[]> = {}
  nodes.forEach((n) => (adj[n.id] = []))
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target)
    if (adj[e.target]) adj[e.target].push(e.source)
  })

  const getLevel = (id: string, seen: Set<string>): number => {
    if (levelOf[id] !== undefined) return levelOf[id]
    if (seen.has(id)) return 0
    seen.add(id)
    let max = 0
    for (const n of adj[id] || []) {
      if (n === id) continue
      max = Math.max(max, getLevel(n, seen) + 1)
    }
    levelOf[id] = max
    return max
  }
  const root = nodes[0]?.id || ""
  getLevel(root, new Set())
  // ensure all nodes get a level
  nodes.forEach((n) => {
    if (levelOf[n.id] === undefined) getLevel(n.id, new Set())
  })

  const levels: Record<number, string[]> = {}
  nodes.forEach((n) => {
    const lvl = levelOf[n.id] ?? 0
    if (!levels[lvl]) levels[lvl] = []
    levels[lvl].push(n.id)
  })
  const keys = Object.keys(levels)
    .map(Number)
    .sort((a, b) => a - b)
  keys.forEach((lvl, li) => {
    const items = levels[lvl]
    const x = (li + 0.5) * (VIEW_W / (keys.length || 1))
    items.forEach((id, i) => {
      const y = (i + 0.5) * (VIEW_H / (items.length || 1))
      pos[id] = { x, y }
    })
  })
  return pos
}

const relationshipLabel: Record<string, string> = {
  uses_device: "Uses Device",
  uses_ip: "Uses IP",
  made_transaction: "Made Transaction",
  shares_device_pattern: "Shares Device Pattern",
  transacts_in: "Transacts In",
  used_by: "Used By",
  connected_via: "Connected Via",
}

const relationshipColor: Record<string, string> = {
  uses_device: "#A78BFA",
  uses_ip: "#22D3EE",
  made_transaction: "#60A5FA",
  shares_device_pattern: "#F59E0B",
  transacts_in: "#34D399",
  used_by: "#F472B6",
  connected_via: "#F59E0B",
}

function riskBorderColor(score: number): string {
  if (score <= 30) return "#22C55E"
  if (score <= 70) return "#F59E0B"
  return "#EF4444"
}

export default function FraudNetworkPage() {
  const navigate = useNavigate()
  const [typeFiltersOn, setTypeFiltersOn] = useState<Record<EntityType, boolean>>({
    customer: true,
    device: true,
    ip: true,
    transaction: true,
  })
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("ALL")
  const [search, setSearch] = useState("")
  const [layout, setLayout] = useState<LayoutMode>("force")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<NetworkEdge | null>(null)

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const isDraggingRef = useRef(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const nodes = useMemo(() => networkNodes, [])
  const edges = useMemo(() => networkEdges, [])

  const positions = useMemo(() => {
    if (layout === "circular") return computeCircularPositions(nodes)
    if (layout === "hierarchical") return computeHierarchicalPositions(nodes, edges)
    return basePositions
  }, [layout, nodes, edges])

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (node.type === "location") return false
      if (!typeFiltersOn[node.type as EntityType]) return false
      if (riskFilter !== "ALL" && getRiskLevel(node.riskScore) !== riskFilter) return false
      if (
        search &&
        !node.id.toLowerCase().includes(search.toLowerCase()) &&
        !node.label.toLowerCase().includes(search.toLowerCase())
      )
        return false
      return true
    })
  }, [nodes, typeFiltersOn, riskFilter, search])

  const visibleIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes])

  const visibleEdges = useMemo(
    () => edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target)),
    [edges, visibleIds]
  )

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId]
  )

  const connectedEntities = useMemo(() => {
    if (!selectedNode) return []
    const connected = new Map<string, { node: NetworkNode; relationship: string; weight: number }>()
    edges.forEach((e) => {
      if (e.source === selectedNode.id) {
        const target = nodes.find((n) => n.id === e.target)
        if (target) connected.set(target.id, { node: target, relationship: e.relationship, weight: e.weight })
      }
      if (e.target === selectedNode.id) {
        const source = nodes.find((n) => n.id === e.source)
        if (source) connected.set(source.id, { node: source, relationship: e.relationship, weight: e.weight })
      }
    })
    return Array.from(connected.values())
  }, [selectedNode, edges, nodes])

  const stats = useMemo(() => {
    const entityCount = nodes.filter((n) => n.type !== "location").length
    const connectionCount = edges.length
    const clusters = 4
    const avgRisk = Math.round(
      nodes.filter((n) => n.type !== "location").reduce((s, n) => s + n.riskScore, 0) / entityCount
    )
    return { entityCount, connectionCount, clusters, avgRisk }
  }, [nodes, edges])

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("[data-node]")) return
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: transform.x,
      originY: transform.y,
    }
    isDraggingRef.current = true
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setTransform((t) => ({ ...t, x: dragRef.current!.originX + dx, y: dragRef.current!.originY + dy }))
    }
  }

  const handlePointerUp = () => {
    dragRef.current = null
    isDraggingRef.current = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    setTransform((t) => ({ ...t, scale: Math.min(3, Math.max(0.4, t.scale * factor)) }))
  }

  const zoomAt = (factor: number) => {
    setTransform((t) => ({ ...t, scale: Math.min(3, Math.max(0.4, t.scale * factor)) }))
  }

  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 })
    setSelectedId(null)
  }

  const fitView = () => {
    setTransform({ x: 0, y: 0, scale: 1 })
  }

  const toggleType = (type: EntityType) => {
    setTypeFiltersOn((s) => ({ ...s, [type]: !s[type] }))
  }

  const enrichmentFor = (node: NetworkNode) => {
    const device = devices.find((d) => d.id === node.id)
    const ip = ipAddresses.find((i) => i.ip === node.id)
    const cust = customers.find((c) => c.id === node.id)
    return { device, ip, cust }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Network"
        description="Discover hidden relationships between customers, devices, IPs, and transactions"
        actions={
          <div className="flex items-center gap-2">
            <Tooltip content="Fullscreen">
              <Button variant="outline" size="icon" onClick={fitView}>
                <Maximize className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Entities", value: stats.entityCount, icon: Users, color: "text-primary" },
          { label: "Connections", value: stats.connectionCount, icon: Link2, color: "text-info" },
          { label: "Clusters", value: stats.clusters, icon: Layers, color: "text-ai-light" },
          { label: "Avg Risk Score", value: stats.avgRisk, icon: Shield, color: "text-risk-high" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg bg-muted/50 p-2", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            {typeFilters.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  typeFiltersOn[type]
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:bg-accent/40"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border/60" />

          <div className="flex items-center gap-1.5">
            {(["ALL", "LOW", "MEDIUM", "HIGH"] as RiskFilter[]).map((level) => (
              <button
                key={level}
                onClick={() => setRiskFilter(level)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  riskFilter === level
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:bg-accent/40"
                )}
              >
                {level === "ALL" ? "All Risk" : level.charAt(0) + level.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border/60" />

          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search entity ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Layout:</span>
              {(["force", "circular", "hierarchical"] as LayoutMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLayout(mode)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                    layout === mode
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:bg-accent/40"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Graph + detail panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        {/* Graph container */}
        <Card className={cn("relative overflow-hidden", selectedNode && "xl:col-start-1")}>
          <div
            className="relative h-[600px] cursor-grab select-none overflow-hidden active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="h-full w-full"
              style={{ touchAction: "none" }}
            >
              <defs>
                <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                </radialGradient>
                <filter id="selected-glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="drop-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
                <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#node-glow)" opacity="0.18" />

                {/* Edges */}
                {visibleEdges.map((edge, i) => {
                  const s = positions[edge.source]
                  const t = positions[edge.target]
                  if (!s || !t) return null
                  const color = relationshipColor[edge.relationship] || "#64748b"
                  const width = 1 + edge.weight * 3
                  const isHovered = hoveredEdge === edge
                  return (
                    <g
                      key={`${edge.source}-${edge.target}-${i}`}
                      onMouseEnter={() => setHoveredEdge(edge)}
                      onMouseLeave={() => setHoveredEdge(null)}
                    >
                      <line
                        x1={s.x}
                        y1={s.y}
                        x2={t.x}
                        y2={t.y}
                        stroke={color}
                        strokeWidth={isHovered ? width + 2 : width}
                        strokeOpacity={isHovered ? 1 : 0.45}
                        style={{ cursor: "pointer", filter: isHovered ? "drop-shadow(0 0 4px " + color + ")" : undefined }}
                      />
                    </g>
                  )
                })}

                {/* Nodes */}
                {filteredNodes.map((node) => {
                  const p = positions[node.id]
                  if (!p) return null
                  const isSelected = selectedId === node.id
                  const hasEnrichment = !!enrichmentFor(node).device || !!enrichmentFor(node).ip
                  const useFallback = !hasEnrichment

                  if (node.type === "customer") {
                    return (
                      <g
                        key={node.id}
                        data-node
                        transform={`translate(${p.x},${p.y})`}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => setSelectedId(node.id)}
                        className="cursor-pointer"
                      >
                        <circle
                          r={26}
                          fill={isSelected ? "#1e1b3a" : "#131124"}
                          stroke={riskBorderColor(node.riskScore)}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          filter={isSelected ? "url(#selected-glow)" : "url(#drop-glow)"}
                        />
                        {isSelected && <circle r={38} fill="none" stroke="#8B5CF6" strokeWidth="0.5" opacity="0.6" />}
                        <text textAnchor="middle" dy="4" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
                          {node.id.replace("CUST-", "C")}
                        </text>
                      </g>
                    )
                  }

                  if (node.type === "device") {
                    const w = 110
                    const h = 34
                    return (
                      <g
                        key={node.id}
                        data-node
                        transform={`translate(${p.x - w / 2},${p.y - h / 2})`}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => setSelectedId(node.id)}
                        className="cursor-pointer"
                      >
                        <rect
                          width={w}
                          height={h}
                          rx={8}
                          fill={isSelected ? "#1e1b3a" : "#140f26"}
                          stroke={isSelected ? "#A78BFA" : "#7C3AED"}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          filter={isSelected ? "url(#selected-glow)" : "url(#drop-glow)"}
                        />
                        <text x={w / 2} y={13} textAnchor="middle" fill="#A78BFA" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
                          {node.id}
                        </text>
                        <text x={w / 2} y={27} textAnchor="middle" fill="#a1a1aa" fontSize="8">
                          device
                        </text>
                      </g>
                    )
                  }

                  if (node.type === "ip") {
                    return (
                      <g
                        key={node.id}
                        data-node
                        transform={`translate(${p.x},${p.y})`}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => setSelectedId(node.id)}
                        className="cursor-pointer"
                      >
                        <polygon
                          points="0,-22 20,0 0,22 -20,0"
                          fill={isSelected ? "#0a1b26" : "#0b1621"}
                          stroke={isSelected ? "#22D3EE" : "#06B6D4"}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          filter={isSelected ? "url(#selected-glow)" : "url(#drop-glow)"}
                        />
                        <text textAnchor="middle" dy="14" fill="#67e8f9" fontSize="8" fontFamily="JetBrains Mono, monospace">
                          {node.id.split(".")[3]}
                        </text>
                      </g>
                    )
                  }

                  // transaction
                  return (
                    <g
                      key={node.id}
                      data-node
                      transform={`translate(${p.x},${p.y})`}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setSelectedId(node.id)}
                      className="cursor-pointer"
                    >
                      <circle
                        r={useFallback ? 14 : 11}
                        fill={isSelected ? "#101a2e" : "#0e1526"}
                        stroke={node.riskScore > 70 ? "#EF4444" : "#60A5FA"}
                        strokeWidth={isSelected ? 2 : 1.2}
                        filter={isSelected ? "url(#selected-glow)" : "url(#drop-glow)"}
                      />
                      <text textAnchor="middle" dy="3" fill="#cbd5e1" fontSize="6.5" fontFamily="JetBrains Mono, monospace">
                        {node.id.replace("TXN-", "")}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>

            {/* Zoom controls */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-lg border border-border/50 bg-card/90 p-1.5 backdrop-blur-sm">
              <Tooltip content="Zoom in">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomAt(1.15)}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Zoom out">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomAt(0.87)}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </Tooltip>
              <div className="h-px bg-border/50" />
              <Tooltip content="Fit view">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fitView}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Reset view">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetView}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 space-y-1.5 rounded-lg border border-border/50 bg-card/90 p-3 text-xs backdrop-blur-sm">
              <p className="mb-1.5 font-semibold text-foreground">Legend</p>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full border border-blue-400 bg-blue-500/20" />
                <span className="text-muted-foreground">Customer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm border border-purple-400 bg-purple-500/20" />
                <span className="text-muted-foreground">Device</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rotate-45 border border-cyan-400 bg-cyan-500/20" />
                <span className="text-muted-foreground">IP Address</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full border border-slate-400 bg-slate-500/20" />
                <span className="text-muted-foreground">Transaction</span>
              </div>
              <div className="mt-2 border-t border-border/40 pt-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Connections</span>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  {Object.entries(relationshipLabel).map(([key, label]) => (
                    <span key={key} className="flex items-center gap-1.5" style={{ color: relationshipColor[key] }}>
                      <span className="h-px w-3" style={{ background: relationshipColor[key] }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hovered edge tooltip */}
            {hoveredEdge && (
              <div
                className="pointer-events-none absolute rounded-md border border-border/50 bg-card px-3 py-2 text-xs text-foreground shadow-lg"
                style={{ top: 12, left: "50%", transform: "translateX(-50%)" }}
              >
                <span className="font-semibold">{relationshipLabel[hoveredEdge.relationship] || hoveredEdge.relationship}</span>
                <span className="text-muted-foreground"> — {hoveredEdge.source} ↔ {hoveredEdge.target}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Detail panel */}
        <div className={cn(selectedNode ? "" : "hidden", "xl:col-start-2 xl:row-start-1")}>
          <Card className="h-[600px] overflow-y-auto">
            {selectedNode && (
              <CardContent className="p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider border-transparent",
                          selectedNode.type === "customer" && "bg-blue-500/15 text-blue-400",
                          selectedNode.type === "device" && "bg-purple-500/15 text-purple-400",
                          selectedNode.type === "ip" && "bg-cyan-500/15 text-cyan-400",
                          selectedNode.type === "transaction" && "bg-slate-500/15 text-slate-300"
                        )}
                      >
                        {selectedNode.type}
                      </Badge>
                      <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-foreground font-mono">{selectedNode.id}</h3>
                    <p className="text-sm text-muted-foreground">{selectedNode.label}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Risk Score</span>
                    <RiskBadge score={selectedNode.riskScore} size="sm" />
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${selectedNode.riskScore}%`, background: riskBorderColor(selectedNode.riskScore) }}
                    />
                  </div>
                </div>

                {/* Device-specific metrics */}
                {selectedNode.type === "device" && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Customers", value: (devices.find((d) => d.id === selectedNode.id)?.customerIds || ["CUST-0009", "CUST-0024"]).length },
                      { label: "Transactions", value: devices.find((d) => d.id === selectedNode.id)?.totalTransactions ?? 428 },
                      { label: "Suspicious", value: devices.find((d) => d.id === selectedNode.id)?.suspiciousTransactions ?? 89 },
                      { label: "Locations", value: devices.find((d) => d.id === selectedNode.id)?.locations.length ?? 4 },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg bg-muted/40 p-3">
                        <p className="text-lg font-bold text-foreground">{m.value}</p>
                        <p className="text-[11px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Connected Entities ({connectedEntities.length})
                  </p>
                  <div className="space-y-1.5">
                    {connectedEntities.map(({ node, relationship }) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedId(node.id)}
                        className="flex w-full items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              node.type === "customer" && "bg-blue-400",
                              node.type === "device" && "bg-purple-400",
                              node.type === "ip" && "bg-cyan-400",
                              node.type === "transaction" && "bg-slate-400"
                            )}
                          />
                          <span className="truncate font-mono">{node.id}</span>
                        </div>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{relationshipLabel[relationship]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate(`/customers/${selectedNode.id}`)}
                  >
                    View Full Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
