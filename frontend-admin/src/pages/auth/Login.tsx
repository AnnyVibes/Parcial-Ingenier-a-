import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog } from '@/components/ui/dialog'
import { DemoCredentials } from '@/components/admin/DemoCredentials'
import { useAuth } from '@/contexts/AuthContext'
import { loginRequest, requestPasswordReset, verifyMfa } from '@/api/auth'
import { postAuditLog } from '@/api/audit'
import { extractErrorMessage } from '@/api/client'
import { MOCK_ENABLED } from '@/api/mock'
import { emailSchema, otpSchema, passwordSchema } from '@/lib/validators'

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})
type LoginForm = z.infer<typeof loginSchema>

const otpFormSchema = z.object({ code: otpSchema })
type OtpForm = z.infer<typeof otpFormSchema>

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
  const [tempToken, setTempToken] = useState<string | null>(null)
  const [emailCache, setEmailCache] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSubmitting, setResetSubmitting] = useState(false)

  const credForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { code: '' },
  })

  async function onSubmitCreds(values: LoginForm): Promise<void> {
    setSubmitting(true)
    try {
      const resp = await loginRequest(values.email, values.password)
      setEmailCache(values.email)
      if (resp.requires_mfa && resp.temp_token) {
        setTempToken(resp.temp_token)
        setStep('mfa')
        await postAuditLog({
          accion: 'LOGIN_INTENTO',
          resultado: 'EXITO',
          detalles: { email: values.email, requires_mfa: true },
        })
        toast.info('Ingresa el código MFA enviado a tu dispositivo.')
      } else if (resp.access && resp.refresh && resp.user) {
        login(resp.access, resp.refresh, resp.user)
        await postAuditLog({
          accion: 'LOGIN_INTENTO',
          resultado: 'EXITO',
          detalles: { email: values.email, requires_mfa: false },
        })
        const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
        navigate(from ?? '/admin/dashboard', { replace: true })
      } else {
        throw new Error('Respuesta de login inválida')
      }
    } catch (err) {
      const msg = extractErrorMessage(err)
      await postAuditLog({
        accion: 'LOGIN_INTENTO',
        resultado: 'FALLO',
        detalles: { email: values.email, error: msg },
      })
      toast.error(msg || 'Credenciales inválidas')
    } finally {
      setSubmitting(false)
    }
  }

  async function onSubmitOtp(values: OtpForm): Promise<void> {
    if (!tempToken) return
    setSubmitting(true)
    try {
      const resp = await verifyMfa(tempToken, values.code)
      login(resp.access, resp.refresh, resp.user)
      await postAuditLog({
        accion: 'LOGIN_MFA',
        resultado: 'EXITO',
        detalles: { email: emailCache },
      })
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
      navigate(from ?? '/admin/dashboard', { replace: true })
    } catch (err) {
      const msg = extractErrorMessage(err)
      await postAuditLog({
        accion: 'LOGIN_MFA',
        resultado: 'FALLO',
        detalles: { email: emailCache, error: msg },
      })
      toast.error(msg || 'Código MFA inválido')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetSubmit(): Promise<void> {
    if (!resetEmail) {
      toast.error('Ingresa un email válido')
      return
    }
    setResetSubmitting(true)
    try {
      await requestPasswordReset(resetEmail)
      toast.success('Si el email existe, recibirás instrucciones para restablecer tu contraseña.')
      setResetOpen(false)
      setResetEmail('')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setResetSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle>Debida Diligencia</CardTitle>
          <CardDescription>
            {step === 'credentials' ? 'Inicia sesión en el portal' : 'Verificación en dos pasos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'credentials' ? (
            <form onSubmit={credForm.handleSubmit(onSubmitCreds)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" required>
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!credForm.formState.errors.email}
                  {...credForm.register('email')}
                />
                {credForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {credForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" required>
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={!!credForm.formState.errors.password}
                  {...credForm.register('password')}
                />
                {credForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {credForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
              <div className="text-center text-sm">
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => setResetOpen(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="otp" required>
                  Código de verificación (6 dígitos)
                </Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="text-center text-2xl tracking-[0.5em]"
                  {...otpForm.register('code')}
                />
                {otpForm.formState.errors.code && (
                  <p className="text-xs text-destructive">{otpForm.formState.errors.code.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Verificando...' : 'Verificar'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('credentials')
                  setTempToken(null)
                  otpForm.reset()
                }}
              >
                Volver
              </Button>
            </form>
          )}
          {MOCK_ENABLED && step === 'credentials' && <DemoCredentials />}
        </CardContent>
      </Card>

      <Dialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Restablecer contraseña"
        description="Te enviaremos un enlace para restablecer tu contraseña."
        footer={
          <>
            <Button variant="outline" onClick={() => setResetOpen(false)} disabled={resetSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleResetSubmit} disabled={resetSubmitting}>
              {resetSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="reset-email" required>
            Email
          </Label>
          <Input
            id="reset-email"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="tu@email.com"
          />
        </div>
      </Dialog>
    </div>
  )
}
