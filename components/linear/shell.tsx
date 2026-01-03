"use client"

import React from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { LinearSidebar, type LinearView } from "./sidebar"

interface LinearShellProps {
  activeView: LinearView
  onViewChange: (view: LinearView) => void
  onQuickCreate?: () => void
  children: React.ReactNode
  detailPanel?: React.ReactNode
}

export function LinearShell({
  activeView,
  onViewChange,
  onQuickCreate,
  children,
  detailPanel,
}: LinearShellProps) {
  const prefersReducedMotion = useReducedMotion()

  // Animation settings - instant when reduced motion is preferred
  const slideTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }

  // Only show detail panel when:
  // - "clients" view: always show the aside (persistent panel)
  // - "pipeline" view: only show when detailPanel has content (click to open)
  const showDetailPanel = activeView === "clients" || (activeView === "pipeline" && detailPanel)

  return (
    <div className="flex h-screen bg-background text-foreground">
      <LinearSidebar activeView={activeView} onViewChange={onViewChange} onQuickCreate={onQuickCreate} />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      <AnimatePresence mode="wait">
        {showDetailPanel && (
          <motion.aside
            key="detail-panel"
            initial={{ x: 384, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 384, opacity: 0 }}
            transition={slideTransition}
            className="w-96 bg-card border-l border-border flex flex-col overflow-hidden"
          >
            {detailPanel}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
