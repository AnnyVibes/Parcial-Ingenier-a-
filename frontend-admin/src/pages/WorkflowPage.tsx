import { useState } from "react";
import { Clock, User, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardItem {
  id: string;
  titulo: string;
  cliente: string;
  riesgo: "bajo" | "medio" | "alto" | "critico";
  oficial: string;
  fecha: string;
  prioridad: "normal" | "urgente";
}

const columns = [
  { id: "nuevo", title: "Nuevos", color: "border-t-blue-500" },
  { id: "documentacion", title: "Documentación", color: "border-t-amber-500" },
  { id: "revision", title: "En Revisión", color: "border-t-purple-500" },
  { id: "aprobado", title: "Aprobados", color: "border-t-green-500" },
  { id: "rechazado", title: "Rechazados", color: "border-t-red-500" },
];

const initialCards: Record<string, CardItem[]> = {
  nuevo: [
    { id: "EXP-0101", titulo: "Solicitud de apertura", cliente: "Lucía Fernández", riesgo: "medio", oficial: "—", fecha: "2026-05-27", prioridad: "urgente" },
    { id: "EXP-0102", titulo: "Actualización de datos", cliente: "Pedro Sánchez", riesgo: "bajo", oficial: "—", fecha: "2026-05-26", prioridad: "normal" },
  ],
  documentacion: [
    { id: "EXP-0089", titulo: "Documentos pendientes", cliente: "Sofía López", riesgo: "medio", oficial: "Laura S.", fecha: "2026-05-24", prioridad: "normal" },
  ],
  revision: [
    { id: "EXP-0076", titulo: "Verificación de ingresos", cliente: "Martín Díaz", riesgo: "alto", oficial: "Pedro M.", fecha: "2026-05-22", prioridad: "urgente" },
    { id: "EXP-0065", titulo: "Validación PEP", cliente: "Ana García", riesgo: "critico", oficial: "Carmen R.", fecha: "2026-05-20", prioridad: "urgente" },
  ],
  aprobado: [
    { id: "EXP-0054", titulo: "Cuenta corporativa", cliente: "Global Tech", riesgo: "bajo", oficial: "Laura S.", fecha: "2026-05-18", prioridad: "normal" },
  ],
  rechazado: [
    { id: "EXP-0043", titulo: "Inconsistencias documentales", cliente: "José Martínez", riesgo: "alto", oficial: "Luis A.", fecha: "2026-05-15", prioridad: "normal" },
  ],
};

const riskVariant: Record<string, "danger" | "destructive" | "warning" | "success"> = {
  critico: "danger",
  alto: "destructive",
  medio: "warning",
  bajo: "success",
};

export default function WorkflowPage() {
  const [cards] = useState(initialCards);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workflow</h1>
        <p className="text-muted-foreground text-sm">
          Gestión visual del flujo de expedientes
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-72">
            <Card className={cn("border-t-4", col.color)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{col.title}</CardTitle>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {cards[col.id]?.length || 0}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(cards[col.id] || []).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border bg-card p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
                      {item.prioridad === "urgente" && (
                        <AlertTriangle className="h-3 w-3 text-danger" />
                      )}
                    </div>
                    <p className="text-sm font-medium leading-tight mb-1">{item.titulo}</p>
                    <p className="text-xs text-muted-foreground mb-2">{item.cliente}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={riskVariant[item.riesgo]} className="text-[10px] px-1.5 py-0">
                        {item.riesgo}
                      </Badge>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.oficial}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.fecha}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!cards[col.id] || cards[col.id].length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Sin expedientes
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
