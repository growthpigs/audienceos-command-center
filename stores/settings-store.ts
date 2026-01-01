import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  AgencySettings,
  UserPreferences,
  TeamMember,
  UserInvitation,
  SettingsSection,
  TokenUsageStats,
  AuditLogEntry,
} from '@/types/settings'

// =============================================================================
// SETTINGS STORE
// =============================================================================

interface SettingsState {
  // Current section
  activeSection: SettingsSection

  // Agency settings
  agencySettings: AgencySettings | null
  isLoadingAgency: boolean
  isSavingAgency: boolean

  // User preferences
  userPreferences: UserPreferences | null
  isLoadingPreferences: boolean
  isSavingPreferences: boolean

  // Team members
  teamMembers: TeamMember[]
  selectedMemberId: string | null
  isLoadingMembers: boolean

  // Invitations
  invitations: UserInvitation[]
  isLoadingInvitations: boolean
  isSendingInvitation: boolean

  // AI token usage
  tokenUsage: TokenUsageStats | null
  isLoadingTokenUsage: boolean

  // Audit log
  auditLog: AuditLogEntry[]
  isLoadingAuditLog: boolean
  auditLogCursor: string | null

  // Unsaved changes tracking
  hasUnsavedChanges: boolean

  // Actions
  setActiveSection: (section: SettingsSection) => void

  // Agency settings actions
  setAgencySettings: (settings: AgencySettings) => void
  updateAgencySettings: (updates: Partial<AgencySettings>) => void
  setLoadingAgency: (loading: boolean) => void
  setSavingAgency: (saving: boolean) => void

  // User preferences actions
  setUserPreferences: (preferences: UserPreferences) => void
  updateUserPreferences: (updates: Partial<UserPreferences>) => void
  setLoadingPreferences: (loading: boolean) => void
  setSavingPreferences: (saving: boolean) => void

  // Team member actions
  setTeamMembers: (members: TeamMember[]) => void
  addTeamMember: (member: TeamMember) => void
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void
  removeTeamMember: (id: string) => void
  setSelectedMember: (id: string | null) => void
  setLoadingMembers: (loading: boolean) => void

  // Invitation actions
  setInvitations: (invitations: UserInvitation[]) => void
  addInvitation: (invitation: UserInvitation) => void
  removeInvitation: (id: string) => void
  setLoadingInvitations: (loading: boolean) => void
  setSendingInvitation: (sending: boolean) => void

  // Token usage actions
  setTokenUsage: (usage: TokenUsageStats) => void
  setLoadingTokenUsage: (loading: boolean) => void

  // Audit log actions
  setAuditLog: (entries: AuditLogEntry[]) => void
  appendAuditLog: (entries: AuditLogEntry[]) => void
  setLoadingAuditLog: (loading: boolean) => void
  setAuditLogCursor: (cursor: string | null) => void

  // Unsaved changes
  setHasUnsavedChanges: (hasChanges: boolean) => void

  // Reset
  reset: () => void
}

const defaultUserPreferences: UserPreferences = {
  notifications: {
    email_alerts: true,
    email_tickets: true,
    email_mentions: true,
    slack_channel_id: undefined,
    digest_mode: false,
    quiet_hours_start: undefined,
    quiet_hours_end: undefined,
    muted_clients: [],
  },
  ai: {
    assistant_name: 'Chi',
    response_tone: 'professional',
    response_length: 'detailed',
  },
  display: {
    theme: 'dark',
    sidebar_collapsed: false,
    default_view: 'dashboard',
  },
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set) => ({
      // Initial state
      activeSection: 'agency_profile',

      agencySettings: null,
      isLoadingAgency: false,
      isSavingAgency: false,

      userPreferences: null,
      isLoadingPreferences: false,
      isSavingPreferences: false,

      teamMembers: [],
      selectedMemberId: null,
      isLoadingMembers: false,

      invitations: [],
      isLoadingInvitations: false,
      isSendingInvitation: false,

      tokenUsage: null,
      isLoadingTokenUsage: false,

      auditLog: [],
      isLoadingAuditLog: false,
      auditLogCursor: null,

      hasUnsavedChanges: false,

      // Actions
      setActiveSection: (activeSection) => set({ activeSection }),

      // Agency settings
      setAgencySettings: (agencySettings) => set({ agencySettings }),
      updateAgencySettings: (updates) =>
        set((state) => ({
          agencySettings: state.agencySettings
            ? { ...state.agencySettings, ...updates }
            : null,
          hasUnsavedChanges: true,
        })),
      setLoadingAgency: (isLoadingAgency) => set({ isLoadingAgency }),
      setSavingAgency: (isSavingAgency) => set({ isSavingAgency }),

      // User preferences
      setUserPreferences: (userPreferences) => set({ userPreferences }),
      updateUserPreferences: (updates) =>
        set((state) => ({
          userPreferences: state.userPreferences
            ? { ...state.userPreferences, ...updates }
            : defaultUserPreferences,
          hasUnsavedChanges: true,
        })),
      setLoadingPreferences: (isLoadingPreferences) => set({ isLoadingPreferences }),
      setSavingPreferences: (isSavingPreferences) => set({ isSavingPreferences }),

      // Team members
      setTeamMembers: (teamMembers) => set({ teamMembers }),
      addTeamMember: (member) =>
        set((state) => ({ teamMembers: [...state.teamMembers, member] })),
      updateTeamMember: (id, updates) =>
        set((state) => ({
          teamMembers: state.teamMembers.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      removeTeamMember: (id) =>
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
          selectedMemberId: state.selectedMemberId === id ? null : state.selectedMemberId,
        })),
      setSelectedMember: (selectedMemberId) => set({ selectedMemberId }),
      setLoadingMembers: (isLoadingMembers) => set({ isLoadingMembers }),

      // Invitations
      setInvitations: (invitations) => set({ invitations }),
      addInvitation: (invitation) =>
        set((state) => ({ invitations: [...state.invitations, invitation] })),
      removeInvitation: (id) =>
        set((state) => ({
          invitations: state.invitations.filter((i) => i.id !== id),
        })),
      setLoadingInvitations: (isLoadingInvitations) => set({ isLoadingInvitations }),
      setSendingInvitation: (isSendingInvitation) => set({ isSendingInvitation }),

      // Token usage
      setTokenUsage: (tokenUsage) => set({ tokenUsage }),
      setLoadingTokenUsage: (isLoadingTokenUsage) => set({ isLoadingTokenUsage }),

      // Audit log
      setAuditLog: (auditLog) => set({ auditLog }),
      appendAuditLog: (entries) =>
        set((state) => ({ auditLog: [...state.auditLog, ...entries] })),
      setLoadingAuditLog: (isLoadingAuditLog) => set({ isLoadingAuditLog }),
      setAuditLogCursor: (auditLogCursor) => set({ auditLogCursor }),

      // Unsaved changes
      setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),

      // Reset
      reset: () =>
        set({
          activeSection: 'agency_profile',
          agencySettings: null,
          isLoadingAgency: false,
          isSavingAgency: false,
          userPreferences: null,
          isLoadingPreferences: false,
          isSavingPreferences: false,
          teamMembers: [],
          selectedMemberId: null,
          isLoadingMembers: false,
          invitations: [],
          isLoadingInvitations: false,
          isSendingInvitation: false,
          tokenUsage: null,
          isLoadingTokenUsage: false,
          auditLog: [],
          isLoadingAuditLog: false,
          auditLogCursor: null,
          hasUnsavedChanges: false,
        }),
    }),
    { name: 'settings-store' }
  )
)
