import { useRef, useEffect, useState } from "react"
import {
  Sparkles,
  Send,
  Copy,
  RefreshCw,
  Trash2,
  ArrowRight,
  Bot,
  Search,
  Shield,
  Ban,
  FolderSearch,
  Network,
  AlertTriangle,
  Eye,
  Target,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "ai"
  content: string
  riskFactors?: string[]
  connectedEntities?: { label: string; risk?: string }[]
  recommendation?: string[]
  confidence?: number
}

const suggestedQuestions = [
  "Why is CUST-0009 suspicious?",
  "Show unusual activity from this device",
  "What transactions are connected to DEV-00I9V2?",
  "Summarize the current investigation",
  "Are there other customers connected to IP 192.168.24.81?",
  "Show me the latest fraud patterns",
]

const initialMessages: Message[] = [
  {
    id: "m1",
    role: "user",
    content: "Why is CUST-0009 suspicious?",
  },
  {
    id: "m2",
    role: "ai",
    content:
      "CUST-0009 currently has a risk score of 82 (HIGH).\n\nThe main risk signals are:",
    riskFactors: [
      "7 suspicious transactions in the last 30 days",
      "4 different devices used (expected: 1-2)",
      "Recent device change on Aug 28",
      "Spending increased 380% this week vs historical average",
      "Connected to 2 high-risk IP addresses (both VPN/Tor)",
      "Part of a fraud cluster with 3 other accounts",
    ],
    connectedEntities: [
      { label: "Device DEV-00I9V2", risk: "91" },
      { label: "IP 185.220.101.45", risk: "Tor Exit Node" },
      { label: "CUST-0024, CUST-0005, CUST-0032" },
    ],
    recommendation: [
      "I recommend creating an investigation for this customer and the connected cluster.",
    ],
    confidence: 94,
  },
]

const quickActions = [
  { label: "Block Customer", icon: Ban, color: "text-red-400" },
  { label: "Create Investigation", icon: FolderSearch, color: "text-amber-400" },
  { label: "View Network", icon: Network, color: "text-blue-400" },
]

const recentQueries = [
  "Show me the latest fraud patterns",
  "What transactions are connected to DEV-00I9V2?",
  "Summarize the current investigation",
  "Why is CUST-0009 suspicious?",
]

const platformStats = [
  { label: "Alerts Today", value: "24", icon: AlertTriangle, color: "text-red-400" },
  { label: "Open Investigations", value: "12", icon: FolderSearch, color: "text-amber-400" },
  { label: "Model Precision", value: "94.7%", icon: Target, color: "text-emerald-400" },
  { label: "Blocked Today", value: "38", icon: Shield, color: "text-blue-400" },
]

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const handleSend = (question: string) => {
    const text = (question || input).trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text },
    ])
    setInput("")
    setShowSuggestions(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="✦ Fraud Intelligence Copilot"
        description="Ask about transactions, customers, patterns, or investigations"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4" style={{ minHeight: "calc(100vh - 220px)" }}>
        {/* Chat area */}
        <Card className="flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 bg-gradient-to-r from-ai/10 to-transparent px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ai/20">
                <Bot className="h-5 w-5 text-ai-light" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Copilot</p>
                <p className="text-xs text-muted-foreground">Analyzing your fraud environment</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                Online
              </span>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5">
            {/* Welcome / suggestions */}
            {showSuggestions && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-ai-light" />
                  <p className="text-sm font-medium text-foreground">Suggested questions</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="group flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-4 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-ai/40 hover:bg-ai/5 hover:text-foreground"
                    >
                      <span>{q}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-ai-light" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showSuggestions && (
              <div className="space-y-5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "ai" && (
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ai/20">
                        <Sparkles className="h-3.5 w-3.5 text-ai-light" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "rounded-tr-sm bg-primary/90 text-primary-foreground"
                          : "rounded-tl-sm bg-card border border-border/40"
                      )}
                    >
                      {msg.role === "ai" && (
                        <div className="mb-1.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-ai-light">
                            ✦ AI
                          </span>
                          {msg.confidence && (
                            <Badge variant="outline" className="text-[9px] border-border/40 text-muted-foreground">
                              {msg.confidence}% confidence
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="space-y-1 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {msg.content.split("\n").map((line, i) => (
                          <p key={i} className={line.trim() === "" ? "h-2" : undefined}>
                            {line}
                          </p>
                        ))}
                      </div>

                      {msg.riskFactors && (
                        <div className="mt-3 space-y-1.5">
                          {msg.riskFactors.map((factor, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ai-light" />
                              <span>{factor}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.connectedEntities && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Connected entities
                          </p>
                          {msg.connectedEntities.map((entity, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-2.5 py-1.5 text-xs"
                            >
                              <span className="flex items-center gap-1.5">
                                <ArrowRight className="h-3 w-3 text-ai-light" />
                                <span className="text-foreground">{entity.label}</span>
                              </span>
                              {entity.risk && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[9px]",
                                    /HIGH|91|Tor/i.test(entity.risk)
                                      ? "bg-red-500/15 text-red-400 border-red-500/30"
                                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                  )}
                                >
                                  {entity.risk}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.recommendation && (
                        <div className="mt-3 rounded-lg border border-ai/20 bg-ai/5 p-3">
                          <p className="text-xs leading-relaxed text-foreground">
                            {msg.recommendation.join(" ")}
                          </p>
                        </div>
                      )}

                      {msg.role === "ai" && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="sm" className="h-7 text-[11px]">
                            <FolderSearch className="mr-1.5 h-3 w-3" />
                            Create Investigation
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-[11px]">
                            <Eye className="mr-1.5 h-3 w-3" />
                            View Customer Profile
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-[11px]">
                            <Network className="mr-1.5 h-3 w-3" />
                            View Network
                          </Button>
                        </div>
                      )}

                      {msg.role === "ai" && (
                        <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/40 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background p-1.5 focus-within:border-ai/50 transition-colors">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder="Ask about transactions, customers, patterns..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0 rounded-lg bg-ai text-white hover:bg-ai/90"
                onClick={() => handleSend(input)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between px-1">
              <p className="text-[10px] text-muted-foreground">
                AI can make mistakes. Verify critical findings before acting.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] text-muted-foreground"
                onClick={() => {
                  setMessages(initialMessages)
                  setShowSuggestions(true)
                }}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Context panel */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Context
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                  <div className="flex items-center gap-2">
                    <FolderSearch className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-semibold text-foreground">INV-00001</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Multi-Account Fraud Ring — Petrov & Wright Network
                  </p>
                  <Badge variant="outline" className="mt-2 text-[9px] bg-amber-500/15 text-amber-400 border-amber-500/30">
                    In Progress · Risk 97
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </p>
              <div className="space-y-1.5">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-border/40 px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted/40"
                  >
                    <action.icon className={cn("h-4 w-4", action.color)} />
                    {action.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Queries
              </p>
              <div className="space-y-1.5">
                {recentQueries.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                  >
                    <Search className="mt-0.5 h-3 w-3 shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Platform Stats
              </p>
              <div className="grid grid-cols-2 gap-2">
                {platformStats.map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-muted/30 p-2.5">
                    <stat.icon className={cn("h-4 w-4 mb-1", stat.color)} />
                    <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
