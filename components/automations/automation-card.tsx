'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Edit2, Zap, Play, Clock, CheckCircle2, XCircle } from 'lucide-react'
import type { Workflow, WorkflowTrigger, WorkflowAction } from '@/types/workflow'
import { getTriggerMetadata } from '@/lib/workflows/trigger-registry'
import { getActionMetadata } from '@/lib/workflows/action-registry'
import { cn } from '@/lib/utils'

interface AutomationCardProps {
  workflow: Workflow
  onToggle: (id: string, isActive: boolean) => void
  onEdit: (workflow: Workflow) => void
}

export function AutomationCard({ workflow, onToggle, onEdit }: AutomationCardProps) {
  const triggers = workflow.triggers as unknown as WorkflowTrigger[]
  const actions = workflow.actions as unknown as WorkflowAction[]
  const successRate =
    workflow.run_count > 0
      ? Math.round((workflow.success_count / workflow.run_count) * 100)
      : 0

  // Get first trigger metadata for display
  const firstTrigger = triggers[0]
  const triggerMeta = firstTrigger ? getTriggerMetadata(firstTrigger.type) : null

  // Format last run time
  const formatLastRun = (dateStr: string | null) => {
    if (!dateStr) return 'Never run'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <Card
      className={cn(
        'bg-card border-border hover:border-primary/30 transition-all cursor-pointer group',
        !workflow.is_active && 'opacity-60'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Zap className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{workflow.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {workflow.description || `${triggers.length} trigger${triggers.length > 1 ? 's' : ''}, ${actions.length} action${actions.length > 1 ? 's' : ''}`}
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={workflow.is_active}
            onCheckedChange={(checked) => onToggle(workflow.id, checked)}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Trigger Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">
              {triggers.length > 1 ? `${triggers.length} TRIGGERS` : 'TRIGGER'}
            </span>
          </div>
          <div className="pl-5 space-y-1">
            {triggers.map((trigger) => (
              <Badge key={trigger.id} variant="outline" className="text-xs mr-1">
                {getTriggerMetadata(trigger.type)?.name || trigger.type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Play className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">
              {actions.length} ACTION{actions.length > 1 ? 'S' : ''}
            </span>
          </div>
          <div className="pl-5 space-y-1">
            {actions.slice(0, 3).map((action) => (
              <Badge key={action.id} variant="outline" className="text-xs mr-1">
                {getActionMetadata(action.type)?.name || action.type}
              </Badge>
            ))}
            {actions.length > 3 && (
              <span className="text-xs text-muted-foreground">+{actions.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatLastRun(workflow.last_run_at)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {successRate >= 90 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : successRate >= 70 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
              ) : workflow.run_count > 0 ? (
                <XCircle className="h-3.5 w-3.5 text-rose-500" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">
                {workflow.run_count > 0
                  ? `${successRate}% (${workflow.run_count} runs)`
                  : 'No runs yet'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Button (shown on hover) */}
        <Button
          variant="outline"
          size="sm"
          className="w-full opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(workflow)
          }}
        >
          <Edit2 className="h-3 w-3 mr-2" />
          Edit Workflow
        </Button>
      </CardContent>
    </Card>
  )
}
