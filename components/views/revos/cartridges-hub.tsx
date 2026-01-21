"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Mic, Palette, Settings2, BookOpen, Building2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function RevOSCartridgesHub() {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-500" />
            Cartridges
          </h1>
          <p className="text-muted-foreground mt-1">
            Train your AI with brand voice, style, and instructions
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Cartridge
        </Button>
      </div>

      {/* RevOS Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-gradient-to-r from-orange-500/10 to-green-500/10 border-orange-500/30">
          RevOS Feature
        </Badge>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>

      {/* Cartridge Tabs */}
      <Tabs defaultValue="voice" className="space-y-4">
        <TabsList>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="w-4 h-4" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="style" className="gap-2">
            <Palette className="w-4 h-4" />
            Style
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="instructions" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Instructions
          </TabsTrigger>
          <TabsTrigger value="brand" className="gap-2">
            <Building2 className="w-4 h-4" />
            Brand
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice Cartridge</CardTitle>
              <CardDescription>
                Define your AI&apos;s personality and communication style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Voice cartridge configuration will be available after RevOS integration.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="style">
          <Card>
            <CardHeader>
              <CardTitle>Style Cartridge</CardTitle>
              <CardDescription>
                Upload documents to teach AI your writing style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Style learning from documents will be available after RevOS integration.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences Cartridge</CardTitle>
              <CardDescription>
                Set default content preferences (tone, length, emoji usage)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Content preferences will be available after RevOS integration.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>Instructions Cartridge</CardTitle>
              <CardDescription>
                Marketing frameworks and custom training documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Marketing instructions will be available after RevOS integration.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle>Brand Cartridge</CardTitle>
              <CardDescription>
                112-point marketing blueprint generator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Brand blueprint generator will be available after RevOS integration.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Notice */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">RevOS Integration Pending</CardTitle>
          <CardDescription>
            Cartridges are the core training system for RevOS AI.
            Once integrated, you can customize voice, style, preferences, instructions, and brand identity.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
