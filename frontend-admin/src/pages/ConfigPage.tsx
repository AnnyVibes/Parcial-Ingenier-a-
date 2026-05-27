import { useState } from "react";
import { Save, Shield, Bell, Users, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const configSections = [
  {
    id: "general",
    title: "Configuración General",
    icon: Sliders,
    fields: [
      { id: "nombre_sistema", label: "Nombre del Sistema", value: "AML/KYC Compliance" },
      { id: "timeout_sesion", label: "Timeout de Sesión (minutos)", value: "30" },
      { id: "intentos_max", label: "Intentos máximos de login", value: "5" },
    ],
  },
  {
    id: "seguridad",
    title: "Seguridad",
    icon: Shield,
    fields: [
      { id: "mfa_obligatorio", label: "MFA Obligatorio", value: "Sí" },
      { id: "politica_pass", label: "Política de Contraseñas", value: "Alta" },
      { id: "bloqueo_temp", label: "Bloqueo temporal (minutos)", value: "15" },
    ],
  },
  {
    id: "notificaciones",
    title: "Notificaciones",
    icon: Bell,
    fields: [
      { id: "email_alerta", label: "Email para alertas críticas", value: "alertas@amlkyc.com" },
      { id: "alertas_auto", label: "Alertas automáticas", value: "Activado" },
    ],
  },
  {
    id: "usuarios",
    title: "Gestión de Usuarios",
    icon: Users,
    fields: [
      { id: "max_analistas", label: "Máximo de analistas", value: "10" },
      { id: "auto_asignar", label: "Asignación automática", value: "Sí" },
    ],
  },
];

export default function ConfigPage() {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    configSections.forEach((sec) => sec.fields.forEach((f) => (init[f.id] = f.value)));
    return init;
  });

  function handleChange(id: string, val: string) {
    setValues((prev) => ({ ...prev, [id]: val }));
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground text-sm">
            Administración del sistema AML/KYC
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>

      {configSections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <section.icon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">{section.title}</CardTitle>
            </div>
            <CardDescription>
              Configure los parámetros de {section.title.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.id} className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor={field.id} className="text-right">
                  {field.label}
                </Label>
                <Input
                  id={field.id}
                  className="col-span-2"
                  value={values[field.id]}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
