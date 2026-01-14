import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@/lib/supabase'
import { withRateLimit, withCsrfProtection, sanitizeString, createErrorResponse } from '@/lib/security'
import { withPermission, type AuthenticatedRequest } from '@/lib/rbac/with-permission'
import { GoogleGenAI } from '@google/genai'

/**
 * POST /api/v1/cartridges/brand/blueprint
 * Generate 112-point marketing blueprint using AI
 */
export const POST = withPermission({ resource: 'ai-features', action: 'write' })(
  async (request: AuthenticatedRequest) => {
    const rateLimitResponse = withRateLimit(request, { maxRequests: 5, windowMs: 60000 })
    if (rateLimitResponse) return rateLimitResponse

    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    try {
      const body = await request.json()
      const { coreMessaging } = body
      const agencyId = request.user.agencyId

      if (!coreMessaging || typeof coreMessaging !== 'string') {
        return createErrorResponse(400, 'Core messaging is required')
      }

      const apiKey = process.env.GOOGLE_AI_API_KEY
      if (!apiKey) {
        return createErrorResponse(500, 'AI service not configured')
      }

      // Use Gemini to generate blueprint from core messaging
      const client = new GoogleGenAI({ apiKey })
      const model = client.getGenerativeModel({ model: 'gemini-3-flash-preview' })

      const prompt = `Based on the following marketing messaging, generate a comprehensive 112-point marketing blueprint in JSON format following Jon Benson's framework. Include sections for: bio, positioning, pain and objections, lies and truths, offer, hooks, sales, social proof, consumption, page, service, tips, and lessons.

Core Messaging:
${coreMessaging}

Return a valid JSON object matching this structure:
{
  "bio": { "name": "", "credentials": [], "backstory": "", "uniqueJourney": "" },
  "positioning": { "niche": "", "targetAvatars": [{ "name": "", "painPoints": [], "desiredOutcome": "" }], "marketPosition": "", "competitiveDifferentiator": "" },
  "painAndObjections": { "painPoints": [], "commonObjections": [], "fearsTriggers": [], "desiresTriggers": [] },
  "liesAndTruths": { "industryLies": [], "truthBombs": [], "mythBusters": [] },
  "offer": { "mainOffer": "", "pricing": "", "guarantees": [], "bonuses": [], "urgencyTriggers": [], "scarcityElements": [] },
  "hooks": { "attentionGrabbers": [], "openingLines": [], "curiosityHooks": [], "controversialHooks": [] },
  "sales": { "closingTechniques": [], "persuasionTriggers": [], "testimonialTypes": [], "proofElements": [] },
  "socialProof": { "caseStudies": [], "results": [], "endorsements": [], "mediaAppearances": [] },
  "consumption": { "deliveryMethod": "", "contentFormat": [], "engagementStrategies": [] },
  "page": { "headlineFormulas": [], "subheadlineFormulas": [], "ctaVariations": [] },
  "service": { "deliverables": [], "processSteps": [], "timelineExpectations": "" },
  "tips": { "quickWins": [], "bestPractices": [], "commonMistakes": [] },
  "lessons": { "keyInsights": [], "transformationStories": [], "lessonsTaught": [] }
}`

      const response = await model.generateContent(prompt)
      const text = response.response.text()

      // Extract JSON from response (may be wrapped in markdown code blocks)
      let blueprint
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No JSON found in response')
        }
        blueprint = JSON.parse(jsonMatch[0])
      } catch {
        return createErrorResponse(500, 'Failed to parse AI response')
      }

      // Update the brand cartridge with the blueprint
      const supabase = await createRouteHandlerClient(cookies)

      const { error: updateError } = await supabase
        .from('brand_cartridges')
        .update({
          benson_blueprint: blueprint,
          updated_at: new Date().toISOString(),
        })
        .eq('agency_id', agencyId)

      if (updateError) throw updateError

      return NextResponse.json({ blueprint }, { status: 200 })
    } catch (error) {
      console.error('[Brand Blueprint POST]', error)
      return createErrorResponse(500, 'Failed to generate blueprint')
    }
  }
)
