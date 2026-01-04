'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, CheckCircle2, Mail, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface InvitationDetails {
  email: string
  role: string
  agency_name: string
  expires_at: string
}

export default function InvitationPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const token = params?.token as string

  // Form state
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validate invitation on mount
  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/v1/settings/invitations/${token}`,
          { method: 'GET' }
        )

        if (!response.ok) {
          const data = await response.json()
          if (response.status === 410) {
            setError('This invitation has expired. Please contact your administrator to request a new one.')
          } else {
            setError(data.message || 'Invalid invitation link')
          }
          setIsLoading(false)
          return
        }

        const data = await response.json()
        setInvitationDetails(data.invitation)
        setError(null)
      } catch (err) {
        setError('Failed to validate invitation. Please try again later.')
        console.error('Invitation validation error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    validateInvitation()
  }, [token])

  const validateForm = (): string | null => {
    if (!firstName.trim()) return 'First name is required'
    if (!lastName.trim()) return 'Last name is required'
    if (firstName.trim().length < 2) return 'First name must be at least 2 characters'
    if (lastName.trim().length < 2) return 'Last name must be at least 2 characters'
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (password !== confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/v1/settings/invitations/${token}/accept`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            password,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to accept invitation')
      }

      const data = await response.json()

      toast({
        title: 'Account created successfully',
        description: 'You can now log in to your account',
      })

      // Redirect to login or dashboard
      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to accept invitation. Please try again.'

      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Validating your invitation...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !invitationDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h1 className="text-xl font-semibold mb-2">Invitation Invalid</h1>
              <p className="text-sm text-muted-foreground mb-6">{error}</p>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!invitationDetails) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-6 w-6 text-white" />
            <h1 className="text-2xl font-bold text-white">Welcome!</h1>
          </div>
          <p className="text-purple-100 text-sm">
            Create your account to join {invitationDetails.agency_name}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Invitation Details */}
          <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Email:</span>{' '}
              {invitationDetails.email}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
              <span className="font-semibold">Role:</span>{' '}
              <span className="capitalize">{invitationDetails.role}</span>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2 py-3 px-3 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-500">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-9"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="h-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                At least 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="h-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 gap-2"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Create Account & Accept Invitation
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="hover:underline text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="hover:underline text-primary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
