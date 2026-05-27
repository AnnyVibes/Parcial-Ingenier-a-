import { useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const logs = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  usuario: ["Laura S.", "Pedro M.", "Carmen R.", "Luis A.", "Sistema"][i % 5],
  accion: [
    "Inicio de sesión",
    "Verificación de expediente",
    "Cambio de estado",
    "Descarga de documento",
    "Modificación de riesgo",
    "Creación de usuario",
    "Asignación de oficial",
  ][i % 7],
  detalle: [
    "Acceso desde IP 192.168.1.100",
    "EXP-0045 verificado",
    "EXP-0032 → Aprobado",
    "Documento: Cédula.pdf",
    "Riesgo actualizado a Medio",
    "Usuario: nuevo_analista@correo.com",
    "Expediente EXP-0067 asignado",
  ][i % 7],
  entidad: ["Expediente", "Usuario", "Documento", "Configuración"][i % 4],
  fecha: `2026-05-${String((i % 28) + 1).padStart(2, "0")} ${String(8 + (i % 8)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
  ip: `192.168.1.${(i % 254) + 1}`,
}));

export default function AuditoriaPage() {
  const [search, setSearch] = useState("");

  const filtered = logs.filter(
    (l) =>
      l.usuario.toLowerCase().includes(search.toLowerCase()) ||
      l.accion.toLowerCase().includes(search.toLowerCase()) ||
      l.detalle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoría</h1>
          <p className="text-muted-foreground text-sm">
            Registro de actividades del sistema
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar en auditoría..."
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
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.usuario}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.accion}</Badge>
                  </TableCell>
                  <TableCell>{log.entidad}</TableCell>
                  <TableCell className="text-xs">{log.fecha}</TableCell>
                  <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {log.detalle}
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
