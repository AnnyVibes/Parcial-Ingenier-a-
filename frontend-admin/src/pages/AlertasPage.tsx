import { useState } from "react";
import { Search, Filter, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const alertas = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  cliente: ["Juan Pérez", "María García", "Carlos López", "Ana Martínez", "Roberto Díaz"][i % 5],
  tipo: ["PEP", "Sanctions", "Transacción", "Documento", "Geográfica"][i % 5],
  nivel: ["Crítico", "Alto", "Medio", "Bajo"][i % 4],
  descripcion: [
    "Coincidencia con lista PEP nacional",
    "Transacción a país sancionado",
    "Patrón transaccional inusual",
    "Documento vencido no actualizado",
    "Origen de fondos en paraíso fiscal",
  ][i % 5],
  fecha: `2026-05-${String((i % 28) + 1).padStart(2, "0")}`,
  estado: ["Pendiente", "En Revisión", "Resuelto", "Falso Positivo"][i % 4],
  asignado: ["Laura S.", "Pedro M.", "Carmen R.", "—"][i % 4],
}));

const nivelVariant: Record<string, "danger" | "destructive" | "warning" | "secondary"> = {
  Crítico: "danger",
  Alto: "destructive",
  Medio: "warning",
  Bajo: "secondary",
};

const estadoVariant: Record<string, "warning" | "default" | "success" | "secondary"> = {
  Pendiente: "warning",
  "En Revisión": "default",
  Resuelto: "success",
  "Falso Positivo": "secondary",
};

export default function AlertasPage() {
  const [search, setSearch] = useState("");

  const filtered = alertas.filter(
    (a) =>
      a.cliente.toLowerCase().includes(search.toLowerCase()) ||
      a.tipo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
          <p className="text-muted-foreground text-sm">
            Monitoreo de alertas AML/KYC
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Marcar Revisadas
          </Button>
          <Button>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Nueva Alerta
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar alertas..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Asignado</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.cliente}</TableCell>
                  <TableCell>{a.tipo}</TableCell>
                  <TableCell>
                    <Badge variant={nivelVariant[a.nivel]}>{a.nivel}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {a.descripcion}
                  </TableCell>
                  <TableCell>{a.fecha}</TableCell>
                  <TableCell>{a.asignado}</TableCell>
                  <TableCell>
                    <Badge variant={estadoVariant[a.estado]}>{a.estado}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
