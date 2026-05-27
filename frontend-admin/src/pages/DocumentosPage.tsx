import { useState } from "react";
import { Search, Upload, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const documentos = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  nombre: [
    "Cédula de Identidad",
    "Comprobante de Domicilio",
    "Referencia Bancaria",
    "Declaración de Ingresos",
    "Pasaporte",
    "Certificado Laboral",
  ][i % 6],
  expediente: `EXP-${String((i % 25) + 1).padStart(4, "0")}`,
  cliente: ["Juan Pérez", "María García", "Carlos López"][i % 3],
  tipo: ["PDF", "PDF", "PDF", "JPG", "PDF", "PDF"][i % 6],
  tamaño: [`${(i + 1) * 120} KB`, `${(i + 2) * 80} KB`, `${(i + 1) * 200} KB`][i % 3],
  fecha: `2026-05-${String((i % 28) + 1).padStart(2, "0")}`,
  estado: ["Verificado", "Pendiente", "Rechazado"][i % 3],
}));

const estadoVariant: Record<string, "success" | "warning" | "destructive"> = {
  Verificado: "success",
  Pendiente: "warning",
  Rechazado: "destructive",
};

export default function DocumentosPage() {
  const [search, setSearch] = useState("");

  const filtered = documentos.filter(
    (d) =>
      d.nombre.toLowerCase().includes(search.toLowerCase()) ||
      d.expediente.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground text-sm">
            Repositorio de documentos de expedientes
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Subir Documento
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Expediente</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {doc.nombre}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{doc.expediente}</TableCell>
                  <TableCell>{doc.cliente}</TableCell>
                  <TableCell>{doc.tipo}</TableCell>
                  <TableCell>{doc.tamaño}</TableCell>
                  <TableCell>{doc.fecha}</TableCell>
                  <TableCell>
                    <Badge variant={estadoVariant[doc.estado]}>{doc.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
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
