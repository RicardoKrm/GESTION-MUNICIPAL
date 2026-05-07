import React, { useState } from 'react';
import { useStore } from '../lib/StoreContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket } from '../types';
import { differenceInBusinessDays, differenceInHours, parseISO } from 'date-fns';
import { Clock, AlertTriangle, ArrowRightCircle, CheckCircle2, Bell, FileImage, Download } from 'lucide-react';

export default function FuncionarioDashboard() {
  const { currentUser, users, tickets, departamentos, vecinos, acciones, updateTicketStatus, createTicket, logout } = useStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [comentario, setComentario] = useState('');
  const [targetDept, setTargetDept] = useState<string>('');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newVecino, setNewVecino] = useState(vecinos[0]?.id || '');
  const [newDept, setNewDept] = useState('');
  const [newPriority, setNewPriority] = useState('2');
  const [newSlaDate, setNewSlaDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  const [view, setView] = useState<'bandeja' | 'oficina'>('bandeja');
  const [searchTerm, setSearchTerm] = useState('');

  const myDept = departamentos.find(d => d.id === currentUser?.dept_id);
  const myTickets = tickets.filter(t => t.current_dept_id === currentUser?.dept_id && t.estado !== 'cerrado');

  const getHealthScore = (ticket: Ticket) => {
    const start = parseISO(ticket.created_at);
    const deadline = parseISO(ticket.sla_deadline);
    const totalHours = differenceInHours(deadline, start) || 1;
    const hoursElapsed = differenceInHours(new Date(), start);
    
    // HS = (TiempoTranscurrido/TiempoSLA) * 0.7 + (Hops/3) * 0.3
    const timeRatio = Math.max(0, Math.min(1, hoursElapsed / totalHours));
    const hopRatio = Math.min(1, ticket.hops / 3);
    const hs = (timeRatio * 0.7) + (hopRatio * 0.3);
    return hs;
  };

  const getStatusColor = (hs: number) => {
    if (hs > 0.85) return 'bg-red-100 border-red-500 text-red-700';
    if (hs > 0.6) return 'bg-yellow-100 border-yellow-500 text-yellow-700';
    return 'bg-emerald-50 border-emerald-500 text-emerald-800';
  };

  const handleUpdate = (estado: Ticket['estado']) => {
    if (!selectedTicket) return;
    if (selectedTicket.current_dept_id !== currentUser?.dept_id) {
      alert("No tienes permisos para modificar este ticket porque no pertenece a tu departamento.");
      return;
    }
    if (estado === 'derivado' && !targetDept) {
      alert("Debe seleccionar un departamento de destino");
      return;
    }
    updateTicketStatus(selectedTicket.uuid, estado, comentario, targetDept);
    setDetailOpen(false);
    setComentario('');
    setTargetDept('');
    setSelectedTicket(null);
  };

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
    link.setAttribute('download', `sigm_tickets_oficina_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    let deadlineDate = new Date();
    if (newSlaDate) {
      deadlineDate = new Date(`${newSlaDate}T23:59:59`);
    } else {
      deadlineDate.setDate(deadlineDate.getDate() + 3);
    }

    createTicket({
      municipality_id: currentUser.municipality_id,
      vecino_id: newVecino,
      titulo: newTitle,
      descripcion: newDesc,
      estado: 'nuevo',
      prioridad: parseInt(newPriority) as any,
      current_dept_id: newDept,
      sla_deadline: deadlineDate.toISOString(),
    });

    setNewTitle(''); setNewDesc('');
    alert("Ticket creado exitosamente");
  };

  return (
    <div className="flex h-screen w-full bg-[#f4f7f9] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#002d5d] text-white flex flex-col border-r border-[#001f3f] shrink-0 hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-[#ffffff1a]">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <div className="w-4 h-4 bg-[#002d5d] rounded-full"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Gestión Municipal</h1>
            <p className="text-[10px] uppercase tracking-wider opacity-60 font-medium">Portal Funcionario</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setView('bandeja')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${view === 'bandeja' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}
          >
            <Clock className="w-4 h-4" /> Bandeja de Entrada
          </button>
          <button 
            onClick={() => setView('oficina')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${view === 'oficina' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}
          >
            <CheckCircle2 className="w-4 h-4" /> Oficina de Partes
          </button>
        </nav>
        <div className="p-4 mt-auto bg-[#001f3f] border-t border-[#ffffff1a] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-500 border border-white/20 overflow-hidden flex items-center justify-center">
            <span className="text-xs font-bold text-white">{currentUser?.full_name?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold leading-none truncate">{currentUser?.full_name}</p>
            <p className="text-[10px] text-white/50 mt-1 uppercase tracking-tighter truncate">{myDept?.nombre}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-[#f0f2f5] overflow-hidden">
        <header className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium hidden sm:inline">Estado del Sistema: <span className="text-emerald-600 font-bold">● Operacional</span></span>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Depto: {myDept?.nombre}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative p-2 rounded-full hover:bg-slate-100 cursor-pointer mr-2">
               <Bell className="w-5 h-5 text-slate-500" />
               {myTickets.filter(t => getHealthScore(t) > 0.85).length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
             </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700 text-xs font-medium">
              🔑 ClaveÚnica Inst.
            </div>
            <button 
              onClick={logout}
              className="px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors border border-transparent hover:border-slate-200"
            >
              Salir
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 max-w-5xl mx-auto w-full overflow-y-auto">
          
          {view === 'oficina' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            <div className="lg:col-span-5 space-y-6">
              <Card className="shadow-sm border-slate-200 bg-white sticky top-6">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-tight">Ventanilla Única Digital</CardTitle>
                  <CardDescription className="text-xs">Ingreso de solicitudes físicas y digitales.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600">Vecino</Label>
                      <Select value={newVecino} onValueChange={setNewVecino}>
                        <SelectTrigger className="text-xs"><SelectValue placeholder="Seleccione Ciudadano"/></SelectTrigger>
                        <SelectContent>
                          {vecinos.map(v => <SelectItem key={v.id} value={v.id} className="text-xs">{v.rut} - {v.full_name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600">Título / Tipo Trámite</Label>
                      <Input className="text-xs" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600">Descripción</Label>
                      <Textarea className="text-xs" value={newDesc} onChange={e => setNewDesc(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-600">Prioridad</Label>
                        <Select value={newPriority} onValueChange={setNewPriority}>
                          <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1" className="text-xs">1 - Crítica</SelectItem>
                            <SelectItem value="2" className="text-xs">2 - Alta</SelectItem>
                            <SelectItem value="3" className="text-xs">3 - Media</SelectItem>
                            <SelectItem value="4" className="text-xs">4 - Baja</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-600">Fecha Vencimiento (SLA)</Label>
                        <Input className="text-xs" type="date" min={new Date().toISOString().split('T')[0]} value={newSlaDate} onChange={e => setNewSlaDate(e.target.value)} required />
                      </div>
                    </div>
                     <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-600">Derivar a Depto Inicial</Label>
                      <Select value={newDept} onValueChange={setNewDept} required>
                        <SelectTrigger className="text-xs"><SelectValue placeholder="Seleccione Depto"/></SelectTrigger>
                        <SelectContent>
                          {departamentos.map(d => <SelectItem key={d.id} value={d.id} className="text-xs">{d.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full mt-4 text-xs font-bold uppercase tracking-wide bg-[#002d5d] hover:bg-[#001f3f]">Ingresar Ticket</Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Registro General</h2>
                    <p className="text-xs text-slate-500">Últimos tickets ingresados al municipio</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 px-3 text-xs bg-slate-50 font-bold uppercase" onClick={exportToCSV}>Exportar CSV</Button>
                    <Input 
                      className="text-xs w-48" 
                      placeholder="Buscar por ID o RUT..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  {tickets.filter(t => {
                    const searchLower = searchTerm.toLowerCase();
                    if (!searchLower) return true;
                    if (t.id.toLowerCase().includes(searchLower)) return true;
                    const v = vecinos.find(vec => vec.id === t.vecino_id);
                    if (v && v.rut.toLowerCase().includes(searchLower)) return true;
                    return false;
                  }).slice(0, 15).map(t => {
                    const deptoAsignado = departamentos.find(d => d.id === t.current_dept_id);
                    return (
                      <div key={t.uuid} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{t.id}</span>
                             <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-tight ${
                               t.estado === 'nuevo' ? 'text-amber-600 bg-amber-50 border-amber-200' : 
                               t.estado === 'resuelto' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 
                               'text-blue-600 bg-blue-50 border-blue-200'
                             }`}>
                               {t.estado}
                             </Badge>
                           </div>
                           <p className="font-medium text-slate-800 line-clamp-1">{t.titulo}</p>
                           <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                             Derivado a: <span className="font-medium text-slate-600">{deptoAsignado?.nombre || 'Desconocido'}</span>
                           </p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end">
                           <span className="text-xs font-bold text-slate-400">{new Date(t.created_at).toLocaleDateString()}</span>
                           <Button variant="link" className="text-xs px-0 h-auto text-blue-600 hover:text-blue-800 font-bold" onClick={() => { setSelectedTicket(t); setDetailOpen(true); }}>Ver Detalle →</Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          )}

          {view === 'bandeja' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-tight flex items-center gap-2">
                Bandeja de Entrada
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">{myTickets.length} Activos</Badge>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {myTickets.length === 0 && (
                <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm text-sm font-medium">
                  No hay tickets asignados a este departamento.
                </div>
              )}
              {myTickets.map(t => {
                const hs = getHealthScore(t);
                const colorClass = getStatusColor(hs);
                return (
                  <Card key={t.uuid} className={`border-l-4 ${colorClass.split(' ')[1]} cursor-pointer hover:shadow-md transition shadow-sm border-slate-200 rounded-xl bg-white`} onClick={() => { setSelectedTicket(t); setDetailOpen(true); }}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-slate-400">{t.id}</span>
                            <Badge variant="outline" className="uppercase text-[9px] tracking-wider font-bold text-slate-600 border-slate-200">{t.estado}</Badge>
                            {t.prioridad === 1 && <Badge variant="destructive" className="uppercase text-[9px] tracking-wider font-bold">Crítico</Badge>}
                          </div>
                          <CardTitle className="text-sm font-bold text-slate-800">{t.titulo}</CardTitle>
                        </div>
                        <div className={`p-2 rounded-full border ${colorClass}`}>
                          {hs > 0.85 ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 pb-4 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <span className="truncate max-w-[60%]">{t.descripcion}</span>
                        <div className="text-right flex flex-col items-end">
                          <span className="font-bold text-slate-700">SLA Score: {(hs * 100).toFixed(0)} / 100</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Derivaciones: {t.hops}/3</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          )}
        </div>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl border-slate-200 shadow-xl rounded-xl">
            <DialogHeader>
               <div className="flex items-center justify-between pr-6">
                  <DialogTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Manejo de Ticket {selectedTicket?.id}</DialogTitle>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-600">{selectedTicket?.estado}</Badge>
               </div>
            </DialogHeader>
            
            {selectedTicket && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                  <h4 className="font-bold text-slate-800 mb-1">{selectedTicket.titulo}</h4>
                  <p className="text-slate-600">{selectedTicket.descripcion}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 space-y-1">
                     <div><span className="font-bold uppercase tracking-tight text-slate-400">Creado:</span> {new Date(selectedTicket.created_at).toLocaleString()}</div>
                     <div><span className="font-bold uppercase tracking-tight text-slate-400">Vence (SLA):</span> {new Date(selectedTicket.sla_deadline).toLocaleString()}</div>
                     <div><span className="font-bold uppercase tracking-tight text-slate-400">Solicitante ID:</span> {selectedTicket.vecino_id}</div>
                     <div><span className="font-bold uppercase tracking-tight text-slate-400">Derivaciones (Hops):</span> <span className={selectedTicket.hops >= 2 ? "text-red-500 font-bold" : "text-slate-700 font-bold"}>{selectedTicket.hops}/3</span></div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <span className="font-bold uppercase tracking-tight text-slate-400 text-xs mb-2 block">Evidencia Adjunta:</span>
                    <div className="flex gap-3">
                       <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden relative group cursor-pointer border border-slate-300">
                          <img src="https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg" className="w-full h-full object-cover" alt="Evidencia 1" />
                          <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                             <Download className="w-5 h-5 text-white" />
                          </div>
                       </div>
                       <div className="w-20 h-20 bg-slate-100 rounded-lg flex flex-col items-center justify-center border border-slate-300 border-dashed text-slate-400 text-[10px] font-medium font-mono group cursor-pointer hover:bg-slate-200 hover:text-slate-600 transition-colors">
                          <FileImage className="w-6 h-6 mb-1 opacity-50 group-hover:opacity-100" />
                          PDF
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4">
                   <h4 className="font-bold text-sm text-slate-800 uppercase tracking-tight">Historial de Acciones</h4>
                   <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                     {acciones.filter(a => a.ticket_id === selectedTicket.uuid).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(accion => {
                       const user = users.find(u => u.id === accion.usuario_id) || vecinos.find(v => v.id === accion.usuario_id);
                       return (
                         <div key={accion.id} className="text-xs bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                           <div className="flex justify-between items-start mb-1.5">
                             <span className="font-bold text-slate-700">{user ? user.full_name : accion.usuario_id}</span>
                             <span className="text-[10px] text-slate-400 font-mono">{new Date(accion.timestamp).toLocaleString()}</span>
                           </div>
                           <div className="flex items-center gap-2 mb-1">
                             <Badge variant="secondary" className="text-[9px] uppercase tracking-wider bg-slate-100 text-slate-600">{accion.accion}</Badge>
                             {accion.estado_nuevo && <span className="text-slate-500 text-[10px] uppercase font-bold">→ {accion.estado_nuevo}</span>}
                           </div>
                           {accion.comentario && <p className="text-slate-600 mt-1.5 border-l-2 border-slate-200 pl-2">"{accion.comentario}"</p>}
                         </div>
                       )
                     })}
                     {acciones.filter(a => a.ticket_id === selectedTicket.uuid).length === 0 && (
                       <p className="text-xs text-slate-400 italic">No hay historial registrado para este ticket.</p>
                     )}
                   </div>
                </div>

                {selectedTicket.current_dept_id === currentUser?.dept_id ? (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                     <h4 className="font-bold text-sm text-slate-800 uppercase tracking-tight">Acción Requerida</h4>
                     <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Comentario Adicional</Label>
                        <Textarea className="text-xs" placeholder="Indique el motivo de la derivación o resolución..." value={comentario} onChange={e => setComentario(e.target.value)} />
                     </div>
                     
                     <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Derivar a otro departamento</Label>
                          <div className="flex gap-2">
                            <Select value={targetDept} onValueChange={setTargetDept}>
                              <SelectTrigger className="text-xs"><SelectValue placeholder="Seleccione Depto"/></SelectTrigger>
                              <SelectContent>
                                 {departamentos.filter(d => d.id !== myDept?.id).map(d => (
                                   <SelectItem key={d.id} value={d.id} className="text-xs">{d.nombre}</SelectItem>
                                 ))}
                              </SelectContent>
                            </Select>
                            <Button variant="secondary" className="flex gap-2 text-xs font-bold uppercase tracking-tight" onClick={() => handleUpdate('derivado')}>
                               <ArrowRightCircle className="w-3 h-3"/> Derivar
                            </Button>
                          </div>
                          {selectedTicket.hops >= 2 && <p className="text-[10px] uppercase font-bold text-red-500 tracking-tight mt-1">⚠️ Atención: Próxima derivación escalará automáticamente a Administración Municipal.</p>}
                        </div>
                     </div>
  
                     <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
                        <Button variant="outline" className="text-xs font-bold uppercase tracking-tight text-slate-600" onClick={() => handleUpdate('en_proceso')}>Marcar En Proceso</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2 text-xs font-bold uppercase tracking-tight" onClick={() => handleUpdate('resuelto')}>
                          <CheckCircle2 className="w-4 h-4"/> Resolver Ticket
                        </Button>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                     <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                        <p className="text-sm text-slate-600 font-medium">Este ticket se encuentra asignado a otro departamento.</p>
                        <p className="text-xs text-slate-400 mt-1">No tienes permisos para modificarlo.</p>
                     </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
