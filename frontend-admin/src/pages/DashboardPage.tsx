import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const kpiData = [
  {
    title: "Expedientes Activos",
    value: "1,284",
    change: "+12.5%",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Alertas Pendientes",
    value: "47",
    change: "+8.2%",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    title: "Aprobados Este Mes",
    value: "382",
    change: "+23.1%",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Tiempo Promedio",
    value: "4.2h",
    change: "-11.3%",
    icon: Clock,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

const monthlyData = [
  { name: "Ene", ingresos: 120, aprobados: 80, rechazados: 20 },
  { name: "Feb", ingresos: 150, aprobados: 110, rechazados: 25 },
  { name: "Mar", ingresos: 180, aprobados: 130, rechazados: 30 },
  { name: "Abr", ingresos: 220, aprobados: 160, rechazados: 35 },
  { name: "May", ingresos: 190, aprobados: 140, rechazados: 28 },
  { name: "Jun", ingresos: 250, aprobados: 190, rechazados: 40 },
];

const riskTrend = [
  { name: "Sem 1", alto: 15, medio: 40, bajo: 120 },
  { name: "Sem 2", alto: 12, medio: 45, bajo: 135 },
  { name: "Sem 3", alto: 18, medio: 38, bajo: 128 },
  { name: "Sem 4", alto: 10, medio: 42, bajo: 150 },
];

const recentAlerts = [
  { id: 1, cliente: "Juan Pérez", tipo: "PEP Alert", nivel: "Alto", fecha: "2026-05-27", estado: "Pendiente" },
  { id: 2, cliente: "María García", tipo: "Sanctions", nivel: "Crítico", fecha: "2026-05-27", estado: "Revisando" },
  { id: 3, cliente: "Carlos López", tipo: "Documento", nivel: "Medio", fecha: "2026-05-26", estado: "Resuelto" },
  { id: 4, cliente: "Ana Martínez", tipo: "Transacción", nivel: "Alto", fecha: "2026-05-26", estado: "Pendiente" },
  { id: 5, cliente: "Roberto Díaz", tipo: "PEP Alert", nivel: "Bajo", fecha: "2026-05-25", estado: "Resuelto" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen del sistema AML/KYC
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("rounded-lg p-2", kpi.bg)}>
                  <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    kpi.change.startsWith("+") ? "text-success" : "text-danger"
                  )}
                >
                  {kpi.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Expedientes Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aprobados" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rechazados" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clasificación de Riesgo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="alto" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="medio" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="bajo" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alertas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.cliente}</TableCell>
                  <TableCell>{alert.tipo}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        alert.nivel === "Crítico"
                          ? "danger"
                          : alert.nivel === "Alto"
                            ? "destructive"
                            : alert.nivel === "Medio"
                              ? "warning"
                              : "secondary"
                      }
                    >
                      {alert.nivel}
                    </Badge>
                  </TableCell>
                  <TableCell>{alert.fecha}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        alert.estado === "Resuelto"
                          ? "success"
                          : alert.estado === "Revisando"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {alert.estado}
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
