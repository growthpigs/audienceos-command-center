/**
 * Dynamic route handler for all main app views
 * Routes: /dashboard, /pipeline, /clients, /onboarding, /tickets,
 *         /intelligence, /knowledge, /automations, /integrations, /settings
 *
 * This is a Server Component that validates the route and renders CommandCenter
 */

import { notFound } from "next/navigation"
import CommandCenter from "../page"

// Valid view slugs that map to LinearView types
// Includes both AudienceOS and RevOS views
const VALID_VIEWS = [
  // AudienceOS views
  "dashboard",
  "pipeline",
  "clients",
  "client",
  "onboarding",
  "tickets",
  "intelligence",
  "knowledge",
  "automations",
  "integrations",
  "settings",
  // RevOS views
  "campaigns",
  "content",
  "outreach",
  "cartridges",
  "analytics",
] as const

type ViewSlug = typeof VALID_VIEWS[number]

interface PageProps {
  params: Promise<{ view: string }>
}

export default async function ViewPage({ params }: PageProps) {
  const { view } = await params

  // Validate the view slug - return 404 for invalid routes
  if (!VALID_VIEWS.includes(view as ViewSlug)) {
    notFound()
  }

  // Render the main CommandCenter
  // It reads from pathname to determine active view
  return <CommandCenter />
}

// Generate static params for all valid views (improves build performance)
export function generateStaticParams() {
  return VALID_VIEWS.map((view) => ({ view }))
}
