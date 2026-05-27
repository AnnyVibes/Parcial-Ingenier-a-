import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Shield,
  Clock,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Download,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const exp = {
  id: "EXP-0001",
  cliente: "Juan Pérez",
  tipo: "Persona Natural",
  estado: "en_revision",
  riesgo: "medio",
  fecha: "2026-05-15",
  oficial: "Laura S.",
  email: "juan@email.com",
  telefono: "+598 99 123 456",
  direccion: "Av. 18 de Julio 1234, Montevideo",
  empresa: "Tech Solutions S.A.",
  ocupacion: "Ingeniero de Sistemas",
  pais: "Uruguay",
  docId: "3.456.789-0",
};

const documentos = [
  { id: 1, nombre: "Cédula de Identidad", tipo: "PDF", fecha: "2026-05-15", estado: "Verificado" },
  { id: 2, nombre: "Comprobante de Domicilio", tipo: "PDF", fecha: "2026-05-15", estado: "Pendiente" },
  { id: 3, nombre: "Referencia Bancaria", tipo: "PDF", fecha: "2026-05-16", estado: "Verificado" },
];

const auditoria = [
  { id: 1, accion: "Creación de expediente", usuario: "Laura S.", fecha: "2026-05-15 09:30", detalle: "Expediente creado" },
  { id: 2, accion: "Documentos adjuntados", usuario: "Laura S.", fecha: "2026-05-15 09:35", detalle: "3 documentos agregados" },
  { id: 3, accion: "Asignación de oficial", usuario: "Sistema", fecha: "2026-05-15 10:00", detalle: "Asignado a Laura S." },
  { id: 4, accion: "Revisión de riesgo", usuario: "Carlos M.", fecha: "2026-05-16 14:20", detalle: "Riesgo medio asignado" },
];

export default function ExpedienteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary" | "default"> = {
    pendiente: "warning",
    en_revision: "default",
    aprobado: "success",
    rechazado: "destructive",
    documentacion: "secondary",
  };

  const riskVariant: Record<string, "danger" | "destructive" | "warning" | "success"> = {
    critico: "danger",
    alto: "destructive",
    medio: "warning",
    bajo: "success",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/expedientes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{id || exp.id}</h1>
            <Badge variant={statusVariant[exp.estado]}>
              {exp.estado.replace("_", " ")}
            </Badge>
            <Badge variant={riskVariant[exp.riesgo]}>
              Riesgo {exp.riesgo}
            </Badge>
          </div>
          <p className="text-muted-foreground">{exp.cliente}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>Editar</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="info" className="w-full">
        <Tabs.List className="flex border-b gap-0">
          {["info", "documentos", "auditoria", "riesgo"].map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className="px-4 py-2 text-sm font-medium text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
            >
              {tab === "info" && "Información"}
              {tab === "documentos" && "Documentos"}
              {tab === "auditoria" && "Auditoría"}
              {tab === "riesgo" && "Riesgo"}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Info Tab */}
        <Tabs.Content value="info" className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Datos Personales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Nombre</span><span>{exp.cliente}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Documento</span><span>{exp.docId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span>{exp.tipo}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">País</span><span>{exp.pais}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ocupación</span><span>{exp.ocupacion}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{exp.email}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{exp.telefono}</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{exp.direccion}</span></div>
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span>{exp.empresa}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Estado AML/KYC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Oficial asignado</span><span>{exp.oficial}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fecha de creación</span><span>{exp.fecha}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><Badge variant={statusVariant[exp.estado]}>{exp.estado.replace("_", " ")}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Nivel de riesgo</span><Badge variant={riskVariant[exp.riesgo]}>Riesgo {exp.riesgo}</Badge></div>
              </CardContent>
            </Card>
          </div>
        </Tabs.Content>

        {/* Documentos Tab */}
        <Tabs.Content value="documentos" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentos.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.nombre}</TableCell>
                      <TableCell>{doc.tipo}</TableCell>
                      <TableCell>{doc.fecha}</TableCell>
                      <TableCell>
                        <Badge variant={doc.estado === "Verificado" ? "success" : "warning"}>
                          {doc.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Ver</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Auditoría Tab */}
        <Tabs.Content value="auditoria" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Historial de Auditoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Acción</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditoria.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.accion}</TableCell>
                      <TableCell>{entry.usuario}</TableCell>
                      <TableCell>{entry.fecha}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.detalle}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Riesgo Tab */}
        <Tabs.Content value="riesgo" className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evaluación de Riesgo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Score general</span><span className="font-bold text-warning">62/100</span></div>
                  <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-warning w-[62%]" /></div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Riesgo país</span><span className="text-success">Bajo</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Riesgo ocupación</span><span className="text-success">Bajo</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Riesgo transaccional</span><span className="text-warning">Medio</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vinculación PEP</span><span className="text-success">No detectada</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Sanciones/Listas</span><span className="text-success">Sin coincidencias</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-md border p-3">
                  <p className="font-medium">Verificación adicional de ingresos</p>
                  <p className="text-muted-foreground text-xs mt-1">Solicitar declaración de ingresos de los últimos 6 meses.</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="font-medium">Referencia bancaria</p>
                  <p className="text-muted-foreground text-xs mt-1">Confirmar origen de fondos con el banco emisor.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
