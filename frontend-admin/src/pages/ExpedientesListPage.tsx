import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "default" }> = {
  pendiente: { label: "Pendiente", variant: "warning" },
  en_revision: { label: "En Revisión", variant: "default" },
  aprobado: { label: "Aprobado", variant: "success" },
  rechazado: { label: "Rechazado", variant: "destructive" },
  documentacion: { label: "Doc. Requerida", variant: "secondary" },
};

const riskMap: Record<string, { label: string; variant: "danger" | "destructive" | "warning" | "success" }> = {
  alto: { label: "Alto", variant: "destructive" },
  medio: { label: "Medio", variant: "warning" },
  bajo: { label: "Bajo", variant: "success" },
  critico: { label: "Crítico", variant: "danger" },
};

const mockExpedientes = Array.from({ length: 25 }, (_, i) => ({
  id: `EXP-${String(i + 1).padStart(4, "0")}`,
  cliente: ["Juan Pérez", "María García", "Carlos López", "Ana Martínez", "Roberto Díaz"][i % 5],
  tipo: ["Persona Natural", "Persona Jurídica", "PEP", "ONG"][i % 4],
  estado: Object.keys(statusMap)[i % 5],
  riesgo: Object.keys(riskMap)[i % 4],
  fecha: `2026-0${(i % 9) + 1}-${String((i * 3) % 28 + 1).padStart(2, "0")}`,
  oficial: ["Laura S.", "Pedro M.", "Carmen R.", "Luis A."][i % 4],
}));

export default function ExpedientesListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = mockExpedientes.filter(
    (e) =>
      e.cliente.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expedientes</h1>
          <p className="text-muted-foreground text-sm">
            Gestión de expedientes AML/KYC
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Expediente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o ID..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
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
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Oficial</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-mono text-xs">{exp.id}</TableCell>
                  <TableCell className="font-medium">{exp.cliente}</TableCell>
                  <TableCell>{exp.tipo}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[exp.estado].variant}>
                      {statusMap[exp.estado].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={riskMap[exp.riesgo].variant}>
                      {riskMap[exp.riesgo].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{exp.fecha}</TableCell>
                  <TableCell>{exp.oficial}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/expedientes/${exp.id}`}>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={page === p ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    </span>
                  ))}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
