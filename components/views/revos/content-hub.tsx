"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PenTool, Plus, FileText, Image, Video, Sparkles } from "lucide-react"

export function ContentHub() {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <PenTool className="w-6 h-6 text-orange-500" />
            Content Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            Create AI-powered content for your campaigns
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Content
        </Button>
      </div>

      {/* RevOS Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-gradient-to-r from-orange-500/10 to-green-500/10 border-orange-500/30">
          RevOS Feature
        </Badge>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>

      {/* Content Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-orange-500/50 transition-colors cursor-pointer">
          <CardHeader className="text-center">
            <FileText className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <CardTitle className="text-lg">LinkedIn Posts</CardTitle>
            <CardDescription>
              AI-generated posts optimized for engagement
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-orange-500/50 transition-colors cursor-pointer">
          <CardHeader className="text-center">
            <Image className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <CardTitle className="text-lg">Carousels</CardTitle>
            <CardDescription>
              Multi-slide content for higher reach
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-orange-500/50 transition-colors cursor-pointer">
          <CardHeader className="text-center">
            <Video className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <CardTitle className="text-lg">Video Scripts</CardTitle>
            <CardDescription>
              Scripts and hooks for video content
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-orange-500/50 transition-colors cursor-pointer">
          <CardHeader className="text-center">
            <Sparkles className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <CardDescription>
              Generate any content with AI help
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Content</CardTitle>
          <CardDescription>Your latest drafts and published content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No content yet. Create your first piece of content to get started.
          </div>
        </CardContent>
      </Card>

      {/* Integration Notice */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">RevOS Integration Pending</CardTitle>
          <CardDescription>
            This feature will be available once RevOS is fully integrated.
            Content generation powered by your brand cartridges and AI training will be accessible here.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
