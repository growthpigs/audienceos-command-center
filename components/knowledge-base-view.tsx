"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, BookOpen, FileText, Video, ExternalLink, Clock, ChevronRight } from "lucide-react"

interface SOPArticle {
  id: string
  title: string
  category: string
  type: "document" | "video" | "guide"
  readTime: string
  lastUpdated: string
  description: string
}

const sopArticles: SOPArticle[] = [
  {
    id: "1",
    title: "Meta Pixel Installation Guide",
    category: "Installation",
    type: "guide",
    readTime: "8 min",
    lastUpdated: "Nov 25, 2024",
    description: "Step-by-step guide for installing Meta Pixel on Shopify stores with custom themes.",
  },
  {
    id: "2",
    title: "GTM Container Setup Process",
    category: "Installation",
    type: "document",
    readTime: "12 min",
    lastUpdated: "Nov 20, 2024",
    description: "Complete walkthrough of Google Tag Manager container configuration and deployment.",
  },
  {
    id: "3",
    title: "iOS 17 Tracking Changes",
    category: "Technical",
    type: "document",
    readTime: "6 min",
    lastUpdated: "Nov 28, 2024",
    description: "Understanding how iOS 17 privacy changes affect ad tracking and conversions.",
  },
  {
    id: "4",
    title: "Client Onboarding Checklist",
    category: "Process",
    type: "guide",
    readTime: "5 min",
    lastUpdated: "Nov 15, 2024",
    description: "Standard operating procedure for new client onboarding from contract to kickoff.",
  },
  {
    id: "5",
    title: "Troubleshooting Pixel Misfires",
    category: "Support",
    type: "document",
    readTime: "10 min",
    lastUpdated: "Nov 22, 2024",
    description: "Common causes and solutions for pixel events not firing correctly.",
  },
  {
    id: "6",
    title: "Conversion API Setup Tutorial",
    category: "Installation",
    type: "video",
    readTime: "15 min",
    lastUpdated: "Nov 18, 2024",
    description: "Video walkthrough of Meta Conversions API server-side implementation.",
  },
]

const categories = ["All", "Installation", "Technical", "Process", "Support"]

export function KnowledgeBaseView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredArticles = sopArticles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "guide":
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30"
      case "guide":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
        <p className="text-muted-foreground">SOPs, training materials, and documentation</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              className={
                selectedCategory === category
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-transparent"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.map((article) => (
          <Card
            key={article.id}
            className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline" className={getTypeColor(article.type)}>
                  <span className="mr-1">{getTypeIcon(article.type)}</span>
                  {article.type}
                </Badge>
                <Badge variant="outline" className="text-xs border-border bg-transparent shrink-0">
                  {article.category}
                </Badge>
              </div>
              <CardTitle className="text-base text-foreground group-hover:text-primary transition-colors">
                {article.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">{article.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                  <span className="truncate">Updated {article.lastUpdated}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Links</CardTitle>
          <CardDescription>Frequently accessed resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start border-border bg-transparent h-auto py-3">
              <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
              <span className="text-sm truncate">Shopify Partner Portal</span>
            </Button>
            <Button variant="outline" className="justify-start border-border bg-transparent h-auto py-3">
              <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
              <span className="text-sm truncate">Meta Business Suite</span>
            </Button>
            <Button variant="outline" className="justify-start border-border bg-transparent h-auto py-3">
              <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
              <span className="text-sm truncate">Google Tag Manager</span>
            </Button>
            <Button variant="outline" className="justify-start border-border bg-transparent h-auto py-3">
              <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
              <span className="text-sm truncate">Training Videos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
