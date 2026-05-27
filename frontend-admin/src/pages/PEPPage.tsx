import { useState } from "react";
import { Search, Filter, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const pepList = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  nombre: [
    "José Martínez",
    "Elena Rodríguez",
    "Ricardo Fernández",
    "Patricia González",
    "Fernando López",
    "Gabriela Silva",
  ][i % 6],
  cargo: [
    "Diputado Nacional",
    "Senador",
    "Ministro",
    "Juez de Corte",
    "Alcalde",
    "Director de Entidad Estatal",
    "Gerente de Banco Público",
    "Embajador",
  ][i % 8],
  entidad: [
    "Poder Legislativo",
    "Poder Judicial",
    "Ministerio de Economía",
    "Intendencia Municipal",
    "Empresa Estatal",
    "Servicio Exterior",
  ][i % 6],
  pais: "Uruguay",
  nivel: ["Alto", "Medio", "Bajo", "Alto", "Medio", "Bajo"][i % 6],
  vinculo: ["Directo", "Familiar", "Socio comercial", "Directo"][i % 4],
  fecha_detectado: `2026-0${(i % 9) + 1}-${String((i * 5) % 28 + 1).padStart(2, "0")}`,
  estado: ["Activo", "Activo", "Cerrado"][i % 3],
  expediente: i % 2 === 0 ? `EXP-${String((i % 25) + 1).padStart(4, "0")}` : "—",
}));

const nivelVariant: Record<string, "destructive" | "warning" | "secondary"> = {
  Alto: "destructive",
  Medio: "warning",
  Bajo: "secondary",
};

export default function PEPPage() {
  const [search, setSearch] = useState("");

  const filtered = pepList.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.cargo.toLowerCase().includes(search.toLowerCase()) ||
      p.entidad.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Personas Expuestas Políticamente</h1>
            <p className="text-muted-foreground text-sm">
              Registro PEP y personas vinculadas
            </p>
          </div>
          <Badge variant="warning" className="text-xs">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Requiere atención
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar PEP..."
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
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Vínculo</TableHead>
                <TableHead>Detectado</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell>{p.cargo}</TableCell>
                  <TableCell>{p.entidad}</TableCell>
                  <TableCell>{p.pais}</TableCell>
                  <TableCell>
                    <Badge variant={nivelVariant[p.nivel]}>{p.nivel}</Badge>
                  </TableCell>
                  <TableCell>{p.vinculo}</TableCell>
                  <TableCell className="text-xs">{p.fecha_detectado}</TableCell>
                  <TableCell>
                    <Badge variant={p.estado === "Activo" ? "warning" : "secondary"}>
                      {p.estado}
                    </Badge>
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
