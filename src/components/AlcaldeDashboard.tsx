import React, { useState } from 'react';
import { useStore } from '../lib/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { differenceInHours, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { AlertTriangle, TrendingUp, Users, FileText, Activity, ExternalLink, PenTool, Bell, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Ticket } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AlcaldeDashboard() {
  const { tickets, departamentos, vecinos, acciones, users, createTicket, updateTicketStatus, logout } = useStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [interventionNote, setInterventionNote] = useState('');
  const [isInterventionOpen, setIsInterventionOpen] = useState(false);

  const handleIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedTicket) {
      updateTicketStatus(selectedTicket.uuid, selectedTicket.estado, `[INTERVENCIÓN ALCALDÍA]: ${interventionNote}`);
      setInterventionNote('');
      setIsInterventionOpen(false);
      alert('Instrucción registrada en el historial del ticket.');
    }
  };

  const activeTickets = tickets.filter(t => t.estado !== 'cerrado');
  const criticalTickets = activeTickets.filter(t => t.prioridad === 1);
  const resolvedTickets = tickets.filter(t => t.estado === 'resuelto' || t.estado === 'cerrado');

  const deptData = departamentos.map(dept => {
      const deptoTickets = tickets.filter(t => t.current_dept_id === dept.id);
      const resueltos = deptoTickets.filter(t => t.estado === 'resuelto' || t.estado === 'cerrado').length;
      const pendientes = deptoTickets.length - resueltos;
      return { 
        name: dept.nombre.split(' ')[0], 
        resueltos: resueltos,
        pendientes: pendientes 
      };
  });

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f8fafc] font-sans overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">Dashboard Ejecutivo (Alcalde)</h1>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border border-slate-200">
              MULTI-TENANT: REGIÓN METROPOLITANA
            </Badge>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-widest hidden md:inline">HEALTH SCORE</span>
              <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden hidden md:block">
                <div className="h-full bg-[#20c997] rounded-full" style={{ width: '88%' }}></div>
              </div>
              <span className="text-sm font-black text-[#20c997]">88%</span>
            </div>
            <div 
               title="Cerrar sesión" 
               onClick={logout} 
               className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors flex flex-col items-center justify-center font-bold text-slate-600 cursor-pointer text-xs"
            >
              A
            </div>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 p-6 md:p-8">
          
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div onClick={() => alert('Mostrando listado de todas las solicitudes...')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-slate-200 cursor-pointer hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest group-hover:text-slate-600 transition-colors">TOTAL SOLICITUDES INGRESADAS</p>
                      <p className="text-3xl font-black text-slate-800 mt-2">{tickets.length}</p>
                    </div>
                    <Activity className="text-slate-400 w-5 h-5 group-hover:text-slate-600"/>
                  </div>
                  <p className="text-[11px] text-emerald-500 font-bold mt-4">+12% respecto al mes pasado</p>
               </div>

               <div onClick={() => alert('Filtrando pendientes y atrasadas...')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-red-500 cursor-pointer hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest group-hover:text-red-500 transition-colors">PENDIENTES Y ATRASADAS</p>
                      <p className="text-3xl font-black text-slate-800 mt-2">{activeTickets.length}</p>
                    </div>
                    <Clock className="text-red-500 w-5 h-5"/>
                  </div>
                  <p className="text-[11px] text-red-500 font-bold mt-4">{criticalTickets.length} requieren atención Inmediata (Anti-Peloteo)</p>
               </div>

               <div onClick={() => alert('Reporte de resolutividad en camino...')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest group-hover:text-emerald-500 transition-colors">CASOS RESUELTOS</p>
                      <p className="text-3xl font-black text-slate-800 mt-2">{resolvedTickets.length}</p>
                    </div>
                    <CheckCircle2 className="text-emerald-500 w-5 h-5"/>
                  </div>
                  <p className="text-[11px] text-emerald-500 font-bold mt-4">Efectividad general: {((resolvedTickets.length / (tickets.length || 1)) * 100).toFixed(1)}%</p>
               </div>

               <div onClick={() => alert('Mostrando listado de re-derivaciones múltiples...')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-orange-500 cursor-pointer hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest group-hover:text-orange-500 transition-colors">ALERTAS ANTI-PELOTEO</p>
                      <p className="text-3xl font-black text-slate-800 mt-2">{tickets.filter(t => t.hops >= 3).length}</p>
                    </div>
                    <AlertTriangle className="text-orange-500 w-5 h-5"/>
                  </div>
                  <p className="text-[11px] text-orange-500 font-bold mt-4">Tickets re-derivados múltiples veces</p>
               </div>
            </div>

            {/* Main Dashboard Rows */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                 
                 {/* Map Panel */}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[380px] overflow-hidden relative">
                    <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-sm rounded-md shadow px-3 py-1.5 border border-slate-200">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#2f3640]">VISTA SATELITAL: INCIDENCIAS</span>
                    </div>
                    <div className="flex-1 w-full relative z-0">
                       <MapContainer center={[-33.42, -70.60]} zoom={11} style={{ width: '100%', height: '100%' }} zoomControl={false}>
                          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
                          <Marker position={[-33.42, -70.60]}>
                            <Popup>Zona caliente detectada (Semáforos).</Popup>
                          </Marker>
                       </MapContainer>
                    </div>
                    <div className="p-4 border-t border-slate-200 bg-white z-[400]">
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">ZONA CALIENTE: SECTOR NORTE</p>
                       <p className="text-sm font-semibold text-slate-800">Incremento de reclamos lumínicos en los últimos 45 min.</p>
                    </div>
                 </div>

                 {/* Bar Chart Panel */}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[320px]">
                    <h3 className="text-base font-extrabold text-[#2f3640] tracking-tight">Resolutividad por Dirección Municipal</h3>
                    <div className="flex-1 w-full mt-6 -ml-4">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }} barSize={35}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
                           <YAxis fontSize={10} tickLine={false} axisLine={false} />
                           <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                           <Bar dataKey="pendientes" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                           <Bar dataKey="resueltos" fill="#20c997" radius={[4, 4, 0, 0]} />
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

              </div>

              {/* Right Column: AI Assistant */}
              <div className="lg:col-span-4 bg-[#3b3486] rounded-2xl shadow-md border border-[#2b2568] flex flex-col overflow-hidden lg:h-[724px]">
                 <div className="p-6 flex-1 flex flex-col">
                   <h2 className="text-xl font-bold text-white flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black tracking-widest text-[#d6d2fc]">AI</span> 
                     Asistente de Estrategia
                   </h2>
                   
                   <div className="mt-8 space-y-4 flex-1">
                      <div className="bg-white/10 border border-white/5 rounded-xl p-5 shadow-inner">
                        <p className="text-[13px] text-[#e0deff] leading-relaxed">
                          <span className="font-bold text-[#b5aeff]">Tendencia Detectada:</span> Se observa un patrón recurrente de reclamos por semáforos en <span className="underline decoration-[#8376ff]">Av. Kennedy</span>. Sugiero derivar cuadrilla preventiva de Obras.
                        </p>
                      </div>
                      <div className="bg-white/10 border border-white/5 rounded-xl p-5 shadow-inner">
                        <p className="text-[13px] text-[#e0deff] leading-relaxed">
                          <span className="font-bold text-[#20c997]">Optimización de Procesos:</span> DIDECO ha reducido el tiempo de respuesta en un 15% tras implementar la derivación automática por IA.
                        </p>
                      </div>

                      <div className="mt-8 border-t border-white/10 pt-6">
                         <h4 className="text-[13px] font-bold text-[#d6d2fc]">Métricas IA Semanales</h4>
                         <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center bg-[#2b2568] px-4 py-2.5 rounded-lg border border-white/5">
                               <span className="text-[10px] font-extrabold text-[#d6d2fc] uppercase tracking-widest">SENTIMIENTO VECINAL</span>
                               <span className="text-xs font-bold text-[#ff6b6b]">Tenso (62% Negativo)</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#2b2568] px-4 py-2.5 rounded-lg border border-white/5">
                               <span className="text-[10px] font-extrabold text-[#d6d2fc] uppercase tracking-widest">SPAM DETECTADO</span>
                               <span className="text-xs font-bold text-white">42 tickets</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#2b2568] px-4 py-2.5 rounded-lg border border-white/5">
                               <span className="text-[10px] font-extrabold text-[#d6d2fc] uppercase tracking-widest">PRECISIÓN DERIVACIÓN</span>
                               <span className="text-xs font-bold text-[#20c997]">92.5%</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 mt-8">
                      <button onClick={() => alert('Generando instrucción manual general desde módulo IA...')} className="bg-[#665dff] hover:bg-[#5b52eb] transition-colors text-white text-[10px] font-black uppercase tracking-widest py-3.5 px-3 rounded-lg text-center shadow">GENERAR INSTRUCCIÓN</button>
                      <button onClick={() => alert('Mostrando predicciones generativas de tendencia...')} className="bg-[#463da8] hover:bg-[#3f3796] transition-colors text-[#d6d2fc] text-[10px] font-black uppercase tracking-widest py-3.5 px-3 rounded-lg text-center shadow">VER PREDICCIONES</button>
                   </div>
                 </div>
              </div>

            </div>
          </div>
          
          {/* Footer StatusBar */}
          <div className="mt-8 border-t border-slate-200 py-3 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Database: Online</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> WebSockets: Connected</span>
            </div>
            <div>SIGM v2.4.0 (Enterprise) • Node.js Backend • PostgreSQL Live Analytics</div>
          </div>
        </main>
    </div>
  );
}
