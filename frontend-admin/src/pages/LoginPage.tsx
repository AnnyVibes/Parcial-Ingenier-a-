import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, verifyMFA } = useAuth();

  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [tempToken, setTempToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.mfa_required) {
        setTempToken(result.temp_token!);
        setStep("mfa");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Credenciales inválidas. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMFA(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyMFA(tempToken, mfaCode);
      navigate("/dashboard");
    } catch {
      setError("Código MFA inválido. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle>AML/KYC Compliance</CardTitle>
          <CardDescription>Panel de Administración</CardDescription>
        </CardHeader>
        <CardContent>
          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMFA} className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                Ingrese el código de verificación de su aplicación autenticadora.
              </div>
              <div className="space-y-2">
                <Label htmlFor="mfa">Código MFA</Label>
                <Input
                  id="mfa"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  className={cn("text-center text-2xl tracking-[0.5em]")}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("credentials")}
              >
                Volver
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
