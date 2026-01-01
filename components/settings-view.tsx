"use client"

import { SettingsLayout, SettingsContent } from "@/components/settings"

export function SettingsView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your agency, team, and notification preferences
        </p>
      </div>

      {/* Settings Layout with Sidebar Navigation */}
      <SettingsLayout>
        <SettingsContent />
      </SettingsLayout>
    </div>
  )
}
