import { useState } from 'react';
import { useStore } from '../lib/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { differenceInHours, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, Users, FileText, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AlcaldeDashboard() {
  const { tickets, departamentos, logout } = useStore();
  const [view, setView] = useState('dashboard');

  const exportToCSV = () => {
    const headers = ['ID', 'UUID', 'Título', 'Descripción', 'Estado', 'Prioridad', 'Departamento ID', 'Creado', 'Vence (SLA)'];
    const rows = tickets.map(t => [
      t.id,
      t.uuid,
      `"${t.titulo.replace(/"/g, '""')}"`,
      `"${t.descripcion.replace(/"/g, '""')}"`,
      t.estado,
      t.prioridad,
      t.current_dept_id,
      new Date(t.created_at).toISOString(),
      new Date(t.sla_deadline).toISOString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sigm_tickets_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeTickets = tickets.filter(t => t.estado !== 'cerrado');
  const criticalTickets = activeTickets.filter(t => t.prioridad === 1);
  const resolvedThisWeek = tickets.filter(t => {
      const d = parseISO(t.created_at);
      const start = startOfWeek(new Date());
      const end = endOfWeek(new Date());
      return t.estado === 'resuelto' && isWithinInterval(d, { start, end });
  });

  const getHealthScore = (ticket: any) => {
    const start = parseISO(ticket.created_at);
    const deadline = parseISO(ticket.sla_deadline);
    const totalHours = differenceInHours(deadline, start) || 1;
    const hoursElapsed = differenceInHours(new Date(), start);
    const timeRatio = Math.max(0, Math.min(1, hoursElapsed / totalHours));
    const hopRatio = Math.min(1, ticket.hops / 3);
    return (timeRatio * 0.7) + (hopRatio * 0.3);
  };

  const highRiskTickets = activeTickets.filter(t => getHealthScore(t) > 0.85);

  // Group tickets by dept for chart
  const deptData = departamentos.map(dept => {
      const count = activeTickets.filter(t => t.current_dept_id === dept.id).length;
      return { name: dept.nombre.substring(0, 15), count };
  });

  // Mock Briefing (Would be LLM generated)
  const iaBriefing = {
     date: new Date().toLocaleDateString(),
     content: `Alcalde, durante esta semana se han ingresado ${tickets.length} solicitudes. Existe una tendencia al alza (35%+) en reportes sobre "Baches y Estado de Calles" concentrados en el sector norte. El departamento de Tránsito se encuentra con sobrecarga operativa con un índice de retardo SLA del 12%. Se sugiere derivar equipo de apoyo temporal.`,
     sentiment: 'critical',
     keywords: ['Baches', 'Tránsito', 'Sobrecarga']
  };

  return (
    <div className="flex h-screen w-full bg-[#f4f7f9] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#002d5d] text-white flex flex-col border-r border-[#001f3f] shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-[#ffffff1a]">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <div className="w-4 h-4 bg-[#002d5d] rounded-full"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">SIGM</h1>
            <p className="text-[10px] uppercase tracking-wider opacity-60 font-medium">Gestión Municipal</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setView('dashboard')} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${view === 'dashboard' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}>
            <Activity className="w-4 h-4" /> Dashboard Principal
          </button>
          <button onClick={() => setView('oficina')} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${view === 'oficina' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}>
            <FileText className="w-4 h-4" /> Oficina de Partes
          </button>
          <button onClick={() => setView('tickets')} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${view === 'tickets' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}>
            <AlertTriangle className="w-4 h-4" /> Gestión de Tickets
          </button>
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase font-bold text-white/40 tracking-widest">Auditoría & Normativa</div>
          <button onClick={() => setView('transparencia')} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${view === 'transparencia' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}>
            <Users className="w-4 h-4" /> Transparencia Activa
          </button>
        </nav>
        <div className="p-4 mt-auto bg-[#001f3f] border-t border-[#ffffff1a] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-500 border border-white/20 overflow-hidden flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold leading-none">Alcaldía Santiago</p>
            <p className="text-[10px] text-white/50 mt-1 uppercase tracking-tighter">Admin Senior GovTech</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#f0f2f5] overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium">Estado del Sistema: <span className="text-emerald-600">● Operacional</span></span>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <span className="text-xs text-slate-400 font-mono">Multi-tenant ID: mun-scl-001</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700 text-xs font-medium">
              🔑 Autenticado vía <strong>ClaveÚnica</strong>
            </div>
            <button 
              onClick={logout}
              className="px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Content Section */}
        {view === 'dashboard' && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-y-auto w-full">
          
          {/* Left Column: Metrics & Summaries */}
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* KPI Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Total Tickets</p>
                <p className="text-2xl font-bold text-slate-800">{activeTickets.length}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">+4% esta semana</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Críticos (HS &gt; 0.85)</p>
                <p className="text-2xl font-bold text-red-600">{highRiskTickets.length}</p>
                <p className="text-[10px] text-red-500 font-semibold">Acción Requerida</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Prioridad Crítica</p>
                <p className="text-2xl font-bold text-slate-800">{criticalTickets.length}</p>
                <p className="text-[10px] text-slate-400 font-medium">Meta: 0</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Resueltos Semana</p>
                <p className="text-2xl font-bold text-slate-800">{resolvedThisWeek.length}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">-12h prom</p>
              </div>
            </div>

            {/* AI Morning Briefing (Claude 3.5 Insight) */}
            <div className="bg-gradient-to-br from-[#002d5d] to-[#004a8f] text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    ✨ Briefing Inteligente (IA)
                    <span className="px-2 py-0.5 bg-blue-400/20 rounded text-[10px] uppercase font-bold tracking-widest border border-blue-300/30">Análisis RAG Activo</span>
                  </h2>
                  <span className="text-xs opacity-60 font-mono">Hoy, {iaBriefing.date}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                    <p className="text-[11px] font-bold uppercase text-blue-200 mb-1">Resumen del Estado</p>
                    <p className="text-sm leading-snug">{iaBriefing.content}</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                    <p className="text-[11px] font-bold uppercase text-orange-200 mb-1">Riesgo Operativo</p>
                    <p className="text-sm leading-snug">Dpto. Obras presenta 4 tickets con 'Anti-Peloteo' activo (3+ derivaciones). Escalamiento automático a Administrador Municipal.</p>
                    <div className="flex flex-wrap gap-2 pt-3">
                      {iaBriefing.keywords.map(k => (
                        <span key={k} className="px-2 py-0.5 bg-slate-800/50 text-slate-200 rounded text-[10px] uppercase">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* High Density Ticket Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Tickets Críticos (Zona Roja)</h3>
                <div className="flex gap-2">
                  <button className="px-2 py-1 text-[10px] border rounded bg-slate-50 hover:bg-slate-100 font-bold">FILTRAR</button>
                  <button className="px-2 py-1 text-[10px] border rounded bg-slate-50 hover:bg-slate-100 font-bold uppercase" onClick={exportToCSV}>Exportar Auditoría</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold sticky top-0">
                    <tr>
                      <th className="px-4 py-3">UUID/Hash</th>
                      <th className="px-4 py-3">Departamento</th>
                      <th className="px-4 py-3">Asunto</th>
                      <th className="px-4 py-3">Health Score</th>
                      <th className="px-4 py-3 text-center">Derivaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {highRiskTickets.map(t => {
                        const hs = getHealthScore(t);
                        const dept = departamentos.find(d => d.id === t.current_dept_id);
                        return (
                          <tr key={t.uuid} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-[9px] opacity-70">
                              {t.id} <span className="text-emerald-500">✔</span>
                            </td>
                            <td className="px-4 py-3">{dept?.nombre}</td>
                            <td className="px-4 py-3 font-medium truncate max-w-[200px]">{t.titulo}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full">
                                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, hs * 100)}%` }}></div>
                                </div>
                                <span className="font-bold text-red-600">{(hs).toFixed(2)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-700">{t.hops}/3</td>
                          </tr>
                        );
                    })}
                    {highRiskTickets.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500 bg-slate-50/50">Todos los tickets bajo control.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Maps & Perf */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* Spatial Health Heatmap (PostGIS Concept) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight mb-4">Inteligencia Territorial</h3>
              <div className="aspect-square bg-slate-50 rounded-lg border border-dashed border-slate-300 relative flex items-center justify-center overflow-hidden">
                <div className="absolute w-full h-full opacity-20 pointer-events-none">
                   <div className="absolute top-10 left-10 w-24 h-24 bg-red-500 blur-2xl rounded-full"></div>
                   <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-400 blur-3xl rounded-full"></div>
                   <div className="absolute top-40 right-40 w-16 h-16 bg-red-600 blur-xl rounded-full"></div>
                </div>
                <div className="relative flex flex-col items-center gap-2">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center px-4">Mapa de calor simulado (PostGIS)</p>
                   <div className="flex gap-1">
                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
                     <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                     <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                   </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Cluster Crítico A:</span>
                  <span className="font-bold">Barrio Bellas Artes</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Nivel de Severidad:</span>
                  <span className="text-red-600 font-bold">MUY ALTO</span>
                </div>
              </div>
            </div>

            {/* Department Performance */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col relative h-[250px]">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight mb-4">Carga Operativa</h3>
              <div className="flex-1 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.count > 5 ? '#f43f5e' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Sentiment Analysis Signal */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-3">Sentiment Analysis Ciudadano</p>
               <div className="flex items-center gap-4">
                 <div className="text-center">
                   <div className="text-lg">😠</div>
                   <p className="text-[9px] font-bold">22%</p>
                 </div>
                 <div className="text-center">
                   <div className="text-lg">😐</div>
                   <p className="text-[9px] font-bold">56%</p>
                 </div>
                 <div className="text-center">
                   <div className="text-lg">😊</div>
                   <p className="text-[9px] font-bold">22%</p>
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] leading-tight text-slate-500 italic">"Grave tendencia negativa en reportes de estado de calles. Aumento sostenido de frustración ciudadana."</p>
                 </div>
               </div>
            </div>

          </div>
        </div>
        )}

        {view !== 'dashboard' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
             <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                <AlertTriangle className="w-8 h-8" />
             </div>
             <h2 className="text-xl font-bold text-slate-700 uppercase tracking-tight">Módulo en Desarrollo</h2>
             <p className="text-slate-500 mt-2 max-w-sm text-sm">Este módulo de acceso exclusivo para la alcaldía se encuentra en fase de integración con los sistemas centrales. Próximamente disponible.</p>
             <button onClick={() => setView('dashboard')} className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-800">
                ← Volver al Dashboard Principal
             </button>
          </div>
        )}
      </main>
    </div>
  );
}
