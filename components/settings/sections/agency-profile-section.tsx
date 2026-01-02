"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSettingsStore } from "@/stores/settings-store"
import { useAuthStore } from "@/lib/store"
import { Building2, Upload, Clock, Globe, CheckCircle2, Loader2 } from "lucide-react"
import type { AgencySettings } from "@/types/settings"

// Common timezones
const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (AZ)" },
  { value: "America/Anchorage", label: "Alaska (AK)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HI)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
]

// Default agency settings for demo
const DEFAULT_AGENCY: AgencySettings = {
  id: "demo-agency",
  name: "Acme Marketing Agency",
  slug: "acme-marketing",
  logo_url: null,
  domain: "acme-marketing.com",
  timezone: "America/New_York",
  business_hours: {
    start: "09:00",
    end: "17:00",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  },
  pipeline_stages: ["Onboarding", "Installation", "Audit", "Live", "Needs Support", "Off-Boarding"],
  health_thresholds: {
    yellow_days: 7,
    red_days: 14,
  },
}

export function AgencyProfileSection() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const {
    agencySettings,
    setAgencySettings,
    updateAgencySettings,
    isLoadingAgency,
    isSavingAgency,
    setSavingAgency,
    setHasUnsavedChanges,
  } = useSettingsStore()

  const isAdmin = user?.role === "admin"

  // Local form state
  const [formData, setFormData] = useState<Partial<AgencySettings>>({})

  // Initialize with default data if no settings loaded
  useEffect(() => {
    if (!agencySettings) {
      // In production, this would be an API call
      setAgencySettings(DEFAULT_AGENCY)
    }
  }, [agencySettings, setAgencySettings])

  // Sync form data with store
  useEffect(() => {
    if (agencySettings) {
      setFormData(agencySettings)
    }
  }, [agencySettings])

  const handleInputChange = (field: keyof AgencySettings, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleBusinessHoursChange = (field: "start" | "end", value: string) => {
    setFormData((prev) => ({
      ...prev,
      business_hours: {
        ...(prev.business_hours || { start: "09:00", end: "17:00" }),
        [field]: value,
      },
    }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setSavingAgency(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateAgencySettings(formData)
    setHasUnsavedChanges(false)
    setSavingAgency(false)

    toast({
      title: "Settings saved",
      description: "Agency profile has been updated successfully.",
    })
  }

  const handleCancel = () => {
    if (agencySettings) {
      setFormData(agencySettings)
      setHasUnsavedChanges(false)
    }
  }

  if (isLoadingAgency) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <h2 className="text-[12px] font-medium text-foreground flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          Agency Profile
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Configure your agency's identity and default settings
        </p>
      </div>

      {/* Basic Info Card */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-[11px] font-medium">Basic Information</CardTitle>
          <CardDescription className="text-[10px]">Your agency's public identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-3 pb-3">
          {/* Logo Upload */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-foreground">Logo</Label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-muted border-2 border-dashed border-border flex items-center justify-center">
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    alt="Agency logo"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <Button variant="outline" disabled={!isAdmin} className="gap-1.5 h-7 text-[10px] bg-transparent">
                <Upload className="h-3 w-3" />
                Upload Logo
              </Button>
              {!isAdmin && (
                <p className="text-[9px] text-muted-foreground">Admin only</p>
              )}
            </div>
          </div>

          {/* Agency Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="agency-name" className="text-[10px] text-foreground">
                Agency Name
              </Label>
              <Input
                id="agency-name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isAdmin}
                className="bg-secondary border-border text-foreground h-7 text-[11px]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="agency-slug" className="text-[10px] text-foreground">
                URL Slug
              </Label>
              <Input
                id="agency-slug"
                value={formData.slug || ""}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                disabled={!isAdmin}
                className="bg-secondary border-border text-foreground h-7 text-[11px]"
              />
            </div>
          </div>

          {/* Domain */}
          <div className="space-y-1">
            <Label htmlFor="domain" className="text-[10px] text-foreground">
              Custom Domain
            </Label>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-muted-foreground" />
              <Input
                id="domain"
                value={formData.domain || ""}
                onChange={(e) => handleInputChange("domain", e.target.value)}
                disabled={!isAdmin}
                placeholder="youragency.com"
                className="bg-secondary border-border text-foreground h-7 text-[11px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timezone & Business Hours */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-[11px] font-medium flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Timezone & Business Hours
          </CardTitle>
          <CardDescription className="text-[10px]">
            Set your agency's timezone and operating hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-3 pb-3">
          {/* Timezone */}
          <div className="space-y-1">
            <Label htmlFor="timezone" className="text-[10px] text-foreground">
              Timezone
            </Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => handleInputChange("timezone", value)}
              disabled={!isAdmin}
            >
              <SelectTrigger className="w-full bg-secondary border-border h-7 text-[11px]">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value} className="text-[11px]">
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="business-start" className="text-[10px] text-foreground">
                Business Hours Start
              </Label>
              <Input
                id="business-start"
                type="time"
                value={formData.business_hours?.start || "09:00"}
                onChange={(e) => handleBusinessHoursChange("start", e.target.value)}
                disabled={!isAdmin}
                className="bg-secondary border-border text-foreground h-7 text-[11px]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="business-end" className="text-[10px] text-foreground">
                Business Hours End
              </Label>
              <Input
                id="business-end"
                type="time"
                value={formData.business_hours?.end || "17:00"}
                onChange={(e) => handleBusinessHoursChange("end", e.target.value)}
                disabled={!isAdmin}
                className="bg-secondary border-border text-foreground h-7 text-[11px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isAdmin && (
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={handleCancel} disabled={isSavingAgency} className="h-7 text-[10px] bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSavingAgency} className="h-7 text-[10px]">
            {isSavingAgency ? (
              <>
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
