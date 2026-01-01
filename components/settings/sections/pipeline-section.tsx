"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSettingsStore } from "@/stores/settings-store"
import {
  Workflow,
  GripVertical,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react"

// Default pipeline stages
const DEFAULT_STAGES = [
  "Onboarding",
  "Installation",
  "Audit",
  "Live",
  "Needs Support",
  "Off-Boarding",
]

export function PipelineSection() {
  const { toast } = useToast()
  const { agencySettings, updateAgencySettings, setHasUnsavedChanges } = useSettingsStore()

  // Local state
  const [stages, setStages] = useState<string[]>(DEFAULT_STAGES)
  const [yellowDays, setYellowDays] = useState(7)
  const [redDays, setRedDays] = useState(14)
  const [isSaving, setIsSaving] = useState(false)
  const [newStageName, setNewStageName] = useState("")

  // Sync with store
  useEffect(() => {
    if (agencySettings) {
      setStages(agencySettings.pipeline_stages || DEFAULT_STAGES)
      setYellowDays(agencySettings.health_thresholds?.yellow_days || 7)
      setRedDays(agencySettings.health_thresholds?.red_days || 14)
    }
  }, [agencySettings])

  const handleAddStage = () => {
    if (newStageName.trim() && !stages.includes(newStageName.trim())) {
      setStages([...stages, newStageName.trim()])
      setNewStageName("")
      setHasUnsavedChanges(true)
    }
  }

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 3) {
      toast({
        title: "Cannot remove stage",
        description: "Minimum 3 pipeline stages required",
        variant: "destructive",
      })
      return
    }
    setStages(stages.filter((_, i) => i !== index))
    setHasUnsavedChanges(true)
  }

  const handleStageRename = (index: number, newName: string) => {
    const updated = [...stages]
    updated[index] = newName
    setStages(updated)
    setHasUnsavedChanges(true)
  }

  const handleMoveStage = (fromIndex: number, toIndex: number) => {
    const updated = [...stages]
    const [removed] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, removed)
    setStages(updated)
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    // Validation
    if (stages.length < 3) {
      toast({
        title: "Validation error",
        description: "Minimum 3 pipeline stages required",
        variant: "destructive",
      })
      return
    }

    if (yellowDays >= redDays) {
      toast({
        title: "Validation error",
        description: "Yellow threshold must be less than red threshold",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateAgencySettings({
      pipeline_stages: stages,
      health_thresholds: { yellow_days: yellowDays, red_days: redDays },
    })

    setIsSaving(false)
    setHasUnsavedChanges(false)
    toast({
      title: "Pipeline settings saved",
      description: "Your pipeline configuration has been updated.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Pipeline Stages
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure client pipeline stages and health thresholds
        </p>
      </div>

      {/* Pipeline Stages Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Pipeline Stages</CardTitle>
          <CardDescription>
            Drag to reorder. Each client moves through these stages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stages.map((stage, index) => (
            <div
              key={`${stage}-${index}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border"
            >
              <button
                className="cursor-grab hover:bg-muted rounded p-1"
                title="Drag to reorder"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="w-6 text-sm text-muted-foreground font-mono">
                {index + 1}.
              </span>
              <Input
                value={stage}
                onChange={(e) => handleStageRename(index, e.target.value)}
                className="flex-1 bg-transparent border-0 h-8 focus-visible:ring-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveStage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Add New Stage */}
          <div className="flex items-center gap-2 pt-2">
            <Input
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="New stage name..."
              className="bg-secondary border-border"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddStage()
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddStage}
              disabled={!newStageName.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Thresholds Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Health Thresholds
          </CardTitle>
          <CardDescription>
            Define when clients are flagged as yellow or red based on days in stage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Yellow Threshold */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-amber-500" />
              <Label className="text-sm font-medium">Yellow Warning</Label>
            </div>
            <div className="flex items-center gap-3 pl-7">
              <span className="text-sm text-muted-foreground">After</span>
              <Input
                type="number"
                min={1}
                max={redDays - 1}
                value={yellowDays}
                onChange={(e) => {
                  setYellowDays(parseInt(e.target.value) || 7)
                  setHasUnsavedChanges(true)
                }}
                className="w-20 bg-secondary border-border"
              />
              <span className="text-sm text-muted-foreground">days in the same stage</span>
            </div>
          </div>

          {/* Red Threshold */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <Label className="text-sm font-medium">Red Alert</Label>
            </div>
            <div className="flex items-center gap-3 pl-7">
              <span className="text-sm text-muted-foreground">After</span>
              <Input
                type="number"
                min={yellowDays + 1}
                value={redDays}
                onChange={(e) => {
                  setRedDays(parseInt(e.target.value) || 14)
                  setHasUnsavedChanges(true)
                }}
                className="w-20 bg-secondary border-border"
              />
              <span className="text-sm text-muted-foreground">days in the same stage</span>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <strong>Preview:</strong> Clients will turn yellow after{" "}
              <span className="text-amber-500 font-medium">{yellowDays} days</span> and red
              after <span className="text-red-500 font-medium">{redDays} days</span> in any
              stage.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
