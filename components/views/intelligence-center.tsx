"use client"

import React, { useState } from "react"
import {
  SettingsLayout,
  SettingsContentSection,
  FeatureCard,
  IntegrationCard,
  integrationIcons,
  intelligenceSettingsGroups,
} from "@/components/linear"
import { CartridgesPage } from "@/components/cartridges"
import { ChatInterface } from "@/components/chat/chat-interface"
import { useAuth } from "@/hooks/use-auth"
import {
  MessageSquare,
  FileSearch,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  History,
  Boxes,
} from "lucide-react"

interface IntelligenceCenterProps {
  onBack?: () => void
}

export function IntelligenceCenter({ onBack }: IntelligenceCenterProps) {
  const [activeSection, setActiveSection] = useState("overview")
  const { agencyId, isLoading: authLoading } = useAuth()

  const aiCapabilities = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Client Communication",
      description: "Draft professional responses to client messages across Slack and email",
      primaryAction: "Try now",
      accentColor: "blue" as const,
    },
    {
      icon: <FileSearch className="w-5 h-5" />,
      title: "Knowledge Search",
      description: "Search across all client documents, conversations, and notes instantly",
      primaryAction: "Search",
      accentColor: "purple" as const,
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "At-Risk Detection",
      description: "Automatically identify clients showing signs of churn or dissatisfaction",
      primaryAction: "View alerts",
      accentColor: "pink" as const,
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Performance Insights",
      description: "Get AI-powered summaries of ad performance and optimization suggestions",
      primaryAction: "View insights",
      accentColor: "green" as const,
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Workflow Automation",
      description: "Create intelligent automations that adapt to client behavior patterns",
      primaryAction: "Create workflow",
      accentColor: "orange" as const,
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Goal Tracking",
      description: "Monitor client goals and get proactive alerts when targets are at risk",
      primaryAction: "Set up goals",
      accentColor: "blue" as const,
    },
  ]

  const dataSources = [
    {
      name: "Slack",
      description: "Connect to sync client conversations",
      icon: integrationIcons.slack,
      iconBgColor: "bg-[#4A154B]",
      connected: true,
    },
    {
      name: "Gmail",
      description: "Import client email threads",
      icon: integrationIcons.gmail,
      iconBgColor: "bg-[#EA4335]",
      connected: true,
    },
    {
      name: "Google Ads",
      description: "Sync campaign performance data",
      icon: integrationIcons.googleAds,
      iconBgColor: "bg-[#4285F4]",
      connected: false,
    },
    {
      name: "Meta Ads",
      description: "Import Facebook & Instagram ad data",
      icon: integrationIcons.meta,
      iconBgColor: "bg-[#1877F2]",
      connected: false,
    },
  ]

  return (
    <SettingsLayout
      title="Intelligence Center"
      description="AI-powered insights and automation for your agency"
      groups={intelligenceSettingsGroups}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onBack={onBack}
    >
      {activeSection === "overview" && (
        <>
          <SettingsContentSection title="AI Capabilities">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiCapabilities.map((capability, index) => (
                <FeatureCard key={index} {...capability} />
              ))}
            </div>
          </SettingsContentSection>

          <SettingsContentSection
            title="Connected Data Sources"
            action={
              <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                Browse all integrations
              </button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dataSources.map((source, index) => (
                <IntegrationCard key={index} {...source} />
              ))}
            </div>
          </SettingsContentSection>
        </>
      )}

      {activeSection === "chat" && (
        <SettingsContentSection title="Chat">
          {authLoading ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : agencyId ? (
            <ChatInterface agencyId={agencyId} />
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">
                Please sign in to use the chat interface.
              </p>
            </div>
          )}
        </SettingsContentSection>
      )}

      {activeSection === "activity" && (
        <SettingsContentSection title="Activity">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Activity Feed</h3>
            <p className="text-muted-foreground mb-4">
              View your chat history and AI interactions.
            </p>
          </div>
        </SettingsContentSection>
      )}

      {activeSection === "cartridges" && (
        <SettingsContentSection title="Cartridges">
          <CartridgesPage />
        </SettingsContentSection>
      )}

      {activeSection === "prompts" && (
        <SettingsContentSection title="Custom Prompts">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <FileSearch className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Custom Prompts</h3>
            <p className="text-muted-foreground mb-4">
              Create and manage custom AI prompts for your agency workflows.
            </p>
          </div>
        </SettingsContentSection>
      )}

      {activeSection === "knowledge" && (
        <SettingsContentSection title="Knowledge Base">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <FileSearch className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Knowledge Base</h3>
            <p className="text-muted-foreground mb-4">
              Upload documents and data sources for AI to reference.
            </p>
          </div>
        </SettingsContentSection>
      )}

      {activeSection === "api" && (
        <SettingsContentSection title="API Keys">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">API Keys</h3>
            <p className="text-muted-foreground mb-4">
              Manage your API keys for external integrations.
            </p>
          </div>
        </SettingsContentSection>
      )}

      {activeSection === "preferences" && (
        <SettingsContentSection title="Preferences">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Account Preferences</h3>
            <p className="text-muted-foreground mb-4">
              Configure your account settings and preferences.
            </p>
          </div>
        </SettingsContentSection>
      )}

      {!["overview", "chat", "activity", "cartridges", "prompts", "knowledge", "api", "preferences"].includes(activeSection) && (
        <SettingsContentSection title="Coming Soon">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              This section is under development.
            </p>
          </div>
        </SettingsContentSection>
      )}
    </SettingsLayout>
  )
}
