"use client"

import { SettingsLayout, SettingsContent } from "@/components/settings"

export function SettingsView() {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-[12px] text-muted-foreground">
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
