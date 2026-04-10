"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  FileJson,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HelpCircle,
  Copy,
  Download,
  ChevronRight,
  ChevronDown,
  Braces,
  List,
  Hash,
  Type,
  ToggleLeft,
  Circle,
  Sparkles,
  Moon,
  Sun,
  GitBranch,
  TreeDeciduous,
  AlertCircle,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react"

interface TreeNode {
  name: string
  value?: unknown
  type: string
  children?: TreeNode[]
  path: string
}

interface D3Node {
  name: string
  type: string
  value?: unknown
  path: string
  children?: D3Node[]
  x?: number
  y?: number
  depth?: number
}

function buildTree(data: unknown, name = "root", path = ""): TreeNode {
  const currentPath = path ? `${path}.${name}` : name

  if (data === null) {
    return { name, value: "null", type: "null", path: currentPath }
  }

  if (Array.isArray(data)) {
    return {
      name,
      type: "array",
      path: currentPath,
      children: data.map((item, index) => buildTree(item, `[${index}]`, currentPath)),
    }
  }

  if (typeof data === "object") {
    return {
      name,
      type: "object",
      path: currentPath,
      children: Object.entries(data).map(([key, value]) => buildTree(value, key, currentPath)),
    }
  }

  return {
    name,
    value: data,
    type: typeof data,
    path: currentPath,
  }
}

function csvToJson(csv: string): unknown[] {
  const lines = csv.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) throw new Error("CSV must have header and at least one row")
  const headers = lines[0].split(",").map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(",")
    const obj: Record<string, string | null> = {}
    headers.forEach((h, i) => {
      obj[h] = values[i] ? values[i].trim() : null
    })
    return obj
  })
}

const sampleJson = `{
  "expeditions": [
    {
      "id": "EXP-001",
      "destination": "Alpha Centauri",
      "crew": ["Commander Nova", "Dr. Quark", "Pilot Jax"],
      "vessel": {
        "name": "The Star-Hopper",
        "class": "Explorer"
      },
      "hazard_level": 2,
      "active": true
    },
    {
      "id": "EXP-002",
      "destination": "Andromeda Fringe",
      "crew": ["Captain Orion", "Engineer Rivet"],
      "vessel": {
        "name": "Void Walker",
        "class": "Heavy Freighter"
      },
      "hazard_level": 5,
      "active": false
    }
  ],
  "metadata": {
    "version": "1.0",
    "generated_at": "2026-03-13T10:00:00Z"
  }
}`

function getTypeIcon(type: string) {
  switch (type) {
    case "object":
      return <Braces className="h-3.5 w-3.5 text-primary" />
    case "array":
      return <List className="h-3.5 w-3.5 text-amber-600" />
    case "number":
      return <Hash className="h-3.5 w-3.5 text-emerald-600" />
    case "string":
      return <Type className="h-3.5 w-3.5 text-rose-500" />
    case "boolean":
      return <ToggleLeft className="h-3.5 w-3.5 text-sky-500" />
    case "null":
      return <Circle className="h-3.5 w-3.5 text-muted-foreground" />
    default:
      return <Circle className="h-3.5 w-3.5 text-muted-foreground" />
  }
}

function getValueDisplay(value: unknown, type: string) {
  if (type === "string") return <span className="text-rose-600 dark:text-rose-400">{`"${value}"`}</span>
  if (type === "number") return <span className="text-emerald-600 dark:text-emerald-400">{String(value)}</span>
  if (type === "boolean")
    return <span className="text-sky-600 dark:text-sky-400">{String(value)}</span>
  if (type === "null") return <span className="text-muted-foreground italic">null</span>
  return null
}

interface TreeNodeComponentProps {
  node: TreeNode
  depth: number
  onSelect: (node: TreeNode) => void
  selectedPath: string | null
  scale: number
  expansionMode: "default" | "expand" | "collapse"
  expansionSignal: number
}

function TreeNodeComponent({
  node,
  depth,
  onSelect,
  selectedPath,
  scale,
  expansionMode,
  expansionSignal,
}: TreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedPath === node.path

  useEffect(() => {
    if (expansionMode === "expand") {
      setIsExpanded(true)
      return
    }
    if (expansionMode === "collapse") {
      setIsExpanded(false)
      return
    }
    setIsExpanded(depth < 2)
  }, [expansionMode, expansionSignal, depth])

  return (
    <div style={{ fontSize: `${scale}rem` }}>
      <div
        className={`flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer transition-colors hover:bg-accent ${
          isSelected ? "bg-primary/10 ring-1 ring-primary/30" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          onSelect(node)
          if (hasChildren) setIsExpanded(!isExpanded)
        }}
      >
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-accent rounded"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        {getTypeIcon(node.type)}
        <span className="font-medium text-foreground">{node.name}</span>
        {node.type === "array" && (
          <span className="text-muted-foreground text-xs">({node.children?.length} items)</span>
        )}
        {node.type === "object" && node.children && (
          <span className="text-muted-foreground text-xs">{`{${node.children.length}}`}</span>
        )}
        {node.value !== undefined && (
          <span className="ml-1">{getValueDisplay(node.value, node.type)}</span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child, idx) => (
            <TreeNodeComponent
              key={`${child.path}-${idx}`}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
              scale={scale}
              expansionMode={expansionMode}
              expansionSignal={expansionSignal}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Horizontal Tree Visualization Component (D3-style)
interface HorizontalTreeProps {
  data: TreeNode
  onSelect: (node: TreeNode) => void
  selectedPath: string | null
  scale: number
}

interface LayoutNode extends D3Node {
  x: number
  y: number
  depth: number
  parent?: LayoutNode
}

function HorizontalTreeView({ data, onSelect, selectedPath, scale }: HorizontalTreeProps) {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate tree layout
  const { nodes, links, width, height } = useMemo(() => {
    const nodeHeight = 22
    const levelWidth = 140
    const padding = 40

    // Convert TreeNode to D3Node and calculate layout
    function layoutTree(node: TreeNode, depth: number = 0): { layoutNodes: LayoutNode[]; maxDepth: number; leafCount: number } {
      const layoutNodes: LayoutNode[] = []
      let leafCount = 0
      let maxDepth = depth

      function traverse(n: TreeNode, d: number, parent?: LayoutNode): { node: LayoutNode; leaves: number } {
        const layoutNode: LayoutNode = {
          name: n.name,
          type: n.type,
          value: n.value,
          path: n.path,
          x: 0,
          y: 0,
          depth: d,
          parent,
          children: undefined,
        }

        if (!n.children || n.children.length === 0) {
          layoutNode.x = d * levelWidth + padding
          layoutNode.y = leafCount * nodeHeight + padding
          leafCount++
          layoutNodes.push(layoutNode)
          maxDepth = Math.max(maxDepth, d)
          return { node: layoutNode, leaves: 1 }
        }

        const childResults = n.children.map(child => traverse(child, d + 1, layoutNode))
        layoutNode.children = childResults.map(r => r.node) as D3Node[]
        
        // Position parent at center of children
        const firstChild = childResults[0].node
        const lastChild = childResults[childResults.length - 1].node
        layoutNode.x = d * levelWidth + padding
        layoutNode.y = (firstChild.y + lastChild.y) / 2

        layoutNodes.push(layoutNode)
        return { node: layoutNode, leaves: childResults.reduce((sum, r) => sum + r.leaves, 0) }
      }

      traverse(node, depth)
      return { layoutNodes, maxDepth, leafCount }
    }

    const { layoutNodes, maxDepth, leafCount } = layoutTree(data)

    // Generate links
    const linkData: { source: LayoutNode; target: LayoutNode }[] = []
    layoutNodes.forEach(node => {
      if (node.parent) {
        linkData.push({ source: node.parent, target: node })
      }
    })

    return {
      nodes: layoutNodes,
      links: linkData,
      width: (maxDepth + 1) * levelWidth + padding * 2,
      height: leafCount * nodeHeight + padding * 2,
    }
  }, [data])

  // Generate curved path for links
  const generatePath = (source: LayoutNode, target: LayoutNode) => {
    const midX = (source.x + target.x) / 2
    return `M ${source.x + 60} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x} ${target.y}`
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case "object": return "fill-primary"
      case "array": return "fill-amber-500"
      case "number": return "fill-emerald-500"
      case "string": return "fill-rose-500"
      case "boolean": return "fill-sky-500"
      default: return "fill-muted-foreground"
    }
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-auto"
      style={{ fontSize: `${scale}rem` }}
    >
      <svg 
        width={Math.max(width, 600)} 
        height={Math.max(height, 400)}
        className="min-w-full"
      >
        {/* Links */}
        <g>
          {links.map((link, i) => (
            <path
              key={i}
              d={generatePath(link.source, link.target)}
              fill="none"
              className={`stroke-border transition-colors ${
                hoveredPath === link.target.path || selectedPath === link.target.path
                  ? "stroke-primary stroke-[2]"
                  : "stroke-[1.5]"
              }`}
            />
          ))}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((node, i) => {
            const isHovered = hoveredPath === node.path
            const isSelected = selectedPath === node.path
            const hasChildren = node.children && node.children.length > 0

            return (
              <g
                key={i}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onClick={() => onSelect(node as unknown as TreeNode)}
                onMouseEnter={() => setHoveredPath(node.path)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                {/* Node circle */}
                <circle
                  r={isHovered || isSelected ? 6 : 4}
                  className={`${getNodeColor(node.type)} transition-all ${
                    isHovered || isSelected ? "stroke-primary stroke-2" : ""
                  }`}
                />
                
                {/* Node label */}
                <text
                  x={hasChildren ? -8 : 10}
                  y={4}
                  textAnchor={hasChildren ? "end" : "start"}
                  className={`text-[11px] fill-foreground transition-colors ${
                    isHovered || isSelected ? "font-semibold" : "font-normal"
                  }`}
                >
                  {node.name}
                  {node.type === "array" && ` [${node.children?.length || 0}]`}
                </text>

                {/* Tooltip on hover */}
                {isHovered && node.value !== undefined && (
                  <g transform="translate(10, -20)">
                    <rect
                      x={0}
                      y={-12}
                      width={Math.min(String(node.value).length * 7 + 16, 200)}
                      height={20}
                      rx={4}
                      className="fill-popover stroke-border"
                    />
                    <text
                      x={8}
                      y={2}
                      className="text-[10px] fill-popover-foreground"
                    >
                      {String(node.value).slice(0, 25)}{String(node.value).length > 25 ? "..." : ""}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export default function JSONViewer() {
  const [inputValue, setInputValue] = useState(sampleJson)
  const [treeData, setTreeData] = useState<TreeNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  const [scale, setScale] = useState(0.875)
  const [inputTab, setInputTab] = useState("paste")
  const [viewMode, setViewMode] = useState<"tree" | "horizontal">("tree")
  const [treeExpansionMode, setTreeExpansionMode] = useState<"default" | "expand" | "collapse">("default")
  const [treeExpansionSignal, setTreeExpansionSignal] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [parseProgress, setParseProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const setTreeExpansion = useCallback((mode: "default" | "expand" | "collapse") => {
    setTreeExpansionMode(mode)
    setTreeExpansionSignal((v) => v + 1)
  }, [])

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  const parseInput = useCallback(async () => {
    setError(null)
    setSelectedNode(null)
    setIsParsing(true)
    setParseProgress(0)

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setParseProgress(prev => Math.min(prev + 15, 90))
    }, 50)

    try {
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const trimmed = inputValue.trim()
      let data: unknown

      setParseProgress(40)

      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        data = JSON.parse(trimmed)
      } else if (trimmed.includes(",")) {
        data = csvToJson(trimmed)
      } else {
        throw new Error("Input must be valid JSON or CSV")
      }

      setParseProgress(80)
      await new Promise(resolve => setTimeout(resolve, 50))

      setTreeData(buildTree(data))
      setTreeExpansion("default")
      setParseProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid input")
      setTreeData(null)
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setIsParsing(false)
        setParseProgress(0)
      }, 200)
    }
  }, [inputValue])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsParsing(true)
    setParseProgress(20)

    const reader = new FileReader()
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setParseProgress(20 + (event.loaded / event.total) * 60)
      }
    }
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      setInputValue(text)
      setInputTab("paste")
      setParseProgress(100)
      setTimeout(() => {
        setIsParsing(false)
        setParseProgress(0)
      }, 200)
    }
    reader.onerror = () => {
      setError("Failed to read file")
      setIsParsing(false)
      setParseProgress(0)
    }
    reader.readAsText(file)
  }

  const loadSample = () => {
    setInputValue(sampleJson)
    setError(null)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inputValue)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const downloadJson = () => {
    if (!treeData) return
    const blob = new Blob([inputValue], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Auto-parse on mount with sample data
  useEffect(() => {
    parseInput()
  }, [])

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">JSON Component Viewer</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <HelpCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Help</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    About This Tool
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <p className="text-muted-foreground">
                    Visualize, explore, and debug any JSON or CSV file as an interactive tree.
                    All processing happens locally—your data never leaves your device.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Features</h4>
                    <ul className="list-disc pl-4 text-muted-foreground space-y-1">
                      <li>Parse JSON or CSV data</li>
                      <li>Two view modes: Tree and Horizontal Graph</li>
                      <li>Interactive tree visualization with click and hover</li>
                      <li>Dark mode support</li>
                      <li>Zoom in/out for better readability</li>
                      <li>Copy and download your data</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Type Indicators</h4>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Braces className="h-4 w-4 text-primary" /> Object
                      </div>
                      <div className="flex items-center gap-2">
                        <List className="h-4 w-4 text-amber-600" /> Array
                      </div>
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-rose-500" /> String
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-emerald-600" /> Number
                      </div>
                      <div className="flex items-center gap-2">
                        <ToggleLeft className="h-4 w-4 text-sky-500" /> Boolean
                      </div>
                      <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-muted-foreground" /> Null
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Built with React, Next.js & Tailwind CSS
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {isParsing && (
        <div className="fixed top-14 left-0 right-0 z-40">
          <Progress value={parseProgress} className="h-1 rounded-none" />
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <div className="grid gap-4 lg:grid-cols-2 relative">
          {/* Input Panel */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Input</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard} title="Copy">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <Tabs value={inputTab} onValueChange={setInputTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="paste">Paste Data</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="flex-1 flex flex-col gap-3 mt-3">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 min-h-[300px] w-full rounded-lg border bg-muted/30 p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Paste JSON or CSV here..."
                    spellCheck={false}
                  />
                </TabsContent>
                <TabsContent value="upload" className="flex-1 flex flex-col gap-3 mt-3">
                  <div
                    className="flex-1 min-h-[300px] flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 p-8 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground">JSON or CSV files supported</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Error Display */}
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Parse Error</p>
                    <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button onClick={parseInput} className="gap-2" disabled={isParsing}>
                  {isParsing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Parse
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={loadSample}>
                  Load Sample
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <span>Visualization</span>
                  {/* View Mode Toggle */}
                  <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
                    <button
                      onClick={() => setViewMode("tree")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        viewMode === "tree"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <TreeDeciduous className="h-3.5 w-3.5" />
                      Tree
                    </button>
                    <button
                      onClick={() => setViewMode("horizontal")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        viewMode === "horizontal"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      Graph
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {viewMode === "tree" && treeData && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 px-2"
                        onClick={() => setTreeExpansion("expand")}
                        title="Expand All"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span className="text-xs">Expand</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 px-2"
                        onClick={() => setTreeExpansion("collapse")}
                        title="Collapse All"
                      >
                        <Minimize2 className="h-3.5 w-3.5" />
                        <span className="text-xs">Collapse</span>
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setScale((s) => Math.min(s + 0.125, 1.25))}
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setScale((s) => Math.max(s - 0.125, 0.5))}
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setScale(0.875)}
                    title="Reset Zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={downloadJson}
                    disabled={!treeData}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsFullscreen(true)}
                    title="Fullscreen"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="flex-1 min-h-[300px] max-h-[500px] rounded-lg border bg-muted/30 overflow-auto">
                {treeData ? (
                  viewMode === "tree" ? (
                    <div className="p-2">
                      <TreeNodeComponent
                        node={treeData}
                        depth={0}
                        onSelect={setSelectedNode}
                        selectedPath={selectedNode?.path ?? null}
                        scale={scale}
                        expansionMode={treeExpansionMode}
                        expansionSignal={treeExpansionSignal}
                      />
                    </div>
                  ) : (
                    <HorizontalTreeView
                      data={treeData}
                      onSelect={setSelectedNode}
                      selectedPath={selectedNode?.path ?? null}
                      scale={scale}
                    />
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                    <FileJson className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-sm font-medium">No data parsed yet</p>
                    <p className="text-xs">Paste or upload JSON/CSV and click Parse</p>
                  </div>
                )}
              </div>

              {/* Node Details - Bottom Panel */}
              {viewMode === "tree" && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Node Details
                  </h3>
                  {selectedNode ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Path:</span>
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {selectedNode.path}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="flex items-center gap-1.5">
                          {getTypeIcon(selectedNode.type)}
                          {selectedNode.type}
                        </span>
                      </div>
                      {selectedNode.value !== undefined && (
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground">Value:</span>
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs break-all">
                            {JSON.stringify(selectedNode.value)}
                          </code>
                        </div>
                      )}
                      {selectedNode.children && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Children:</span>
                          <span>{selectedNode.children.length} items</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click on a node to see details here
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Floating Node Details Panel (for Graph View) */}
          {viewMode === "horizontal" && selectedNode && (
            <div className="fixed right-4 top-20 z-50 w-80 animate-in slide-in-from-right-4 fade-in duration-200">
              <Card className="shadow-xl border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {getTypeIcon(selectedNode.type)}
                      {selectedNode.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSelectedNode(null)}
                    >
                      <span className="sr-only">Close</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {/* Path */}
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Path</span>
                    <code className="mt-1 block rounded bg-muted px-2 py-1.5 font-mono text-xs break-all">
                      {selectedNode.path}
                    </code>
                  </div>

                  {/* Type */}
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Type</span>
                    <div className="mt-1 flex items-center gap-2">
                      {getTypeIcon(selectedNode.type)}
                      <span className="capitalize font-medium">{selectedNode.type}</span>
                      {selectedNode.children && (
                        <span className="text-muted-foreground">
                          ({selectedNode.children.length} items)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Value */}
                  {selectedNode.value !== undefined && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Value</span>
                      <div className="mt-1 rounded bg-muted p-2 font-mono text-xs max-h-32 overflow-auto">
                        {getValueDisplay(selectedNode.value, selectedNode.type) || JSON.stringify(selectedNode.value, null, 2)}
                      </div>
                    </div>
                  )}

                  {/* Children Preview for objects/arrays */}
                  {selectedNode.children && selectedNode.children.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Children</span>
                      <div className="mt-1 rounded bg-muted p-2 max-h-40 overflow-auto">
                        <div className="space-y-1">
                          {selectedNode.children.slice(0, 10).map((child, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent cursor-pointer text-xs"
                              onClick={() => setSelectedNode(child)}
                            >
                              {getTypeIcon(child.type)}
                              <span className="font-medium truncate">{child.name}</span>
                              {child.value !== undefined && (
                                <span className="text-muted-foreground truncate flex-1 text-right">
                                  {String(child.value).slice(0, 20)}
                                  {String(child.value).length > 20 ? "..." : ""}
                                </span>
                              )}
                            </div>
                          ))}
                          {selectedNode.children.length > 10 && (
                            <p className="text-xs text-muted-foreground text-center py-1">
                              +{selectedNode.children.length - 10} more items
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>JSON Component Viewer - Built with React, Next.js & Tailwind CSS. <a href="https://sinhaankur.com" className="text-indigo-600 hover:underline ml-1" target="_blank" rel="noopener">by sinhaankur.com</a></p>
          <p className="text-xs mt-1"><strong>Privacy:</strong> This tool runs entirely in your browser. No data is uploaded, stored, or shared. Your files never leave your device.</p>
        </footer>
      </main>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in duration-200">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 bg-card shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileJson className="h-4 w-4" />
              </div>
              <span className="font-semibold">Visualization - Fullscreen</span>
              {/* View Mode Toggle */}
              <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 ml-4">
                <button
                  onClick={() => setViewMode("tree")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === "tree"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TreeDeciduous className="h-3.5 w-3.5" />
                  Tree
                </button>
                <button
                  onClick={() => setViewMode("horizontal")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === "horizontal"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  Graph
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {viewMode === "tree" && treeData && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2"
                    onClick={() => setTreeExpansion("expand")}
                    title="Expand All"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span className="text-xs">Expand</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2"
                    onClick={() => setTreeExpansion("collapse")}
                    title="Collapse All"
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                    <span className="text-xs">Collapse</span>
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScale((s) => Math.min(s + 0.125, 1.25))}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScale((s) => Math.max(s - 0.125, 0.5))}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScale(0.875)}
                title="Reset Zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-2" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsFullscreen(false)}
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 overflow-auto p-4 relative">
            <div className="h-full w-full rounded-lg border bg-muted/30 overflow-auto">
              {treeData ? (
                viewMode === "tree" ? (
                  <div className="p-4">
                    <TreeNodeComponent
                      node={treeData}
                      depth={0}
                      onSelect={setSelectedNode}
                      selectedPath={selectedNode?.path ?? null}
                      scale={scale}
                      expansionMode={treeExpansionMode}
                      expansionSignal={treeExpansionSignal}
                    />
                  </div>
                ) : (
                  <HorizontalTreeView
                    data={treeData}
                    onSelect={setSelectedNode}
                    selectedPath={selectedNode?.path ?? null}
                    scale={scale}
                  />
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                  <FileJson className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No data parsed yet</p>
                  <p className="text-sm">Exit fullscreen and parse some JSON or CSV data</p>
                </div>
              )}
            </div>

            {/* Floating Node Details Panel in Fullscreen */}
            {selectedNode && (
              <div className="absolute right-8 top-8 z-50 w-80 animate-in slide-in-from-right-4 fade-in duration-200">
                <Card className="shadow-xl border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {getTypeIcon(selectedNode.type)}
                        {selectedNode.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setSelectedNode(null)}
                      >
                        <span className="sr-only">Close</span>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {/* Path */}
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Path</span>
                      <code className="mt-1 block rounded bg-muted px-2 py-1.5 font-mono text-xs break-all">
                        {selectedNode.path}
                      </code>
                    </div>

                    {/* Type */}
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Type</span>
                      <div className="mt-1 flex items-center gap-2">
                        {getTypeIcon(selectedNode.type)}
                        <span className="capitalize font-medium">{selectedNode.type}</span>
                        {selectedNode.children && (
                          <span className="text-muted-foreground">
                            ({selectedNode.children.length} items)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Value */}
                    {selectedNode.value !== undefined && (
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Value</span>
                        <div className="mt-1 rounded bg-muted p-2 font-mono text-xs max-h-32 overflow-auto">
                          {getValueDisplay(selectedNode.value, selectedNode.type) || JSON.stringify(selectedNode.value, null, 2)}
                        </div>
                      </div>
                    )}

                    {/* Children Preview */}
                    {selectedNode.children && selectedNode.children.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Children</span>
                        <div className="mt-1 rounded bg-muted p-2 max-h-40 overflow-auto">
                          <div className="space-y-1">
                            {selectedNode.children.slice(0, 10).map((child, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent cursor-pointer text-xs"
                                onClick={() => setSelectedNode(child)}
                              >
                                {getTypeIcon(child.type)}
                                <span className="font-medium truncate">{child.name}</span>
                                {child.value !== undefined && (
                                  <span className="text-muted-foreground truncate flex-1 text-right">
                                    {String(child.value).slice(0, 20)}
                                    {String(child.value).length > 20 ? "..." : ""}
                                  </span>
                                )}
                              </div>
                            ))}
                            {selectedNode.children.length > 10 && (
                              <p className="text-xs text-muted-foreground text-center py-1">
                                +{selectedNode.children.length - 10} more items
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Press Escape hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <span className="text-xs text-muted-foreground bg-muted/80 backdrop-blur px-3 py-1.5 rounded-full">
              Press <kbd className="font-mono bg-background px-1.5 py-0.5 rounded border mx-1">Esc</kbd> to exit fullscreen
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
