import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const clientes = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  nombre: [
    "Juan Pérez",
    "María García",
    "Carlos López",
    "Ana Martínez",
    "Roberto Díaz",
    "Lucía Fernández",
    "Pedro Sánchez",
    "Sofía López",
  ][i % 8],
  tipo: ["Persona Natural", "Persona Jurídica", "PEP", "ONG"][i % 4],
  documento: `${(i % 10) + 1}.${String((i * 123) % 1000).padStart(3, "0")}.${String((i * 45) % 10)}-${i}`,
  email: `cliente${i + 1}@email.com`,
  riesgo: ["bajo", "medio", "alto", "critico"][i % 4],
  expedientes: (i % 5) + 1,
  estado: i % 3 === 0 ? "Bloqueado" : "Activo",
  fecha: `2026-0${(i % 9) + 1}-${String((i * 2) % 28 + 1).padStart(2, "0")}`,
}));

const riskVariant: Record<string, "danger" | "destructive" | "warning" | "success"> = {
  critico: "danger",
  alto: "destructive",
  medio: "warning",
  bajo: "success",
};

export default function ClientesPage() {
  const [search, setSearch] = useState("");

  const filtered = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.documento.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm">
            Base de datos de clientes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, documento o email..."
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
                <TableHead>Tipo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead>Exp.</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell>{c.tipo}</TableCell>
                  <TableCell className="font-mono text-xs">{c.documento}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>
                    <Badge variant={riskVariant[c.riesgo]}>{c.riesgo}</Badge>
                  </TableCell>
                  <TableCell>{c.expedientes}</TableCell>
                  <TableCell>
                    <Badge variant={c.estado === "Activo" ? "success" : "destructive"}>
                      {c.estado}
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
