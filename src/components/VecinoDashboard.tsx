import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../lib/StoreContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Ticket, Vecino } from '../types';
import { Ticket as TicketIcon, PlusCircle, CheckCircle2, Clock, MapPin, MessageCircle, Send, Bell } from 'lucide-react';

export default function VecinoDashboard() {
  const { currentUser, tickets, createTicket, logout } = useStore();
  const vecino = currentUser as Vecino;
  const myTickets = tickets.filter(t => t.vecino_id === vecino.id);
  
  const [view, setView] = useState<'mis-tickets' | 'nuevo-ticket' | 'whatsapp'>('mis-tickets');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // WhatsApp Simulator State
  const [waMessages, setWaMessages] = useState<{id: string, text: string, sender: 'user' | 'bot', time: Date}[]>([
    { id: '1', text: `¡Hola ${vecino.full_name?.split(' ')[0]}! Soy SIGMI, el asistente virtual de la Municipalidad 🤖. ¿Qué problema te gustaría reportar hoy? (Ej: "Hay un bache en mi calle")`, sender: 'bot', time: new Date() }
  ]);
  const [waInput, setWaInput] = useState('');
  const [waStep, setWaStep] = useState(0); 
  const [waTempData, setWaTempData] = useState({ problem: '', address: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'whatsapp') {
      scrollToBottom();
    }
  }, [waMessages, view]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 5);

    createTicket({
      municipality_id: 'muni-abc-123',
      vecino_id: vecino.id,
      titulo: newTitle,
      descripcion: newDesc,
      estado: 'nuevo',
      prioridad: 3, 
      current_dept_id: 'dept-1', 
      sla_deadline: deadlineDate.toISOString(),
    });

    setNewTitle(''); 
    setNewDesc('');
    setView('mis-tickets');
    alert("Solicitud ingresada exitosamente. Recibirá notificaciones en su portal.");
  };

  const handleWaSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waInput.trim()) return;

    const userMsg = { id: Date.now().toString(), text: waInput, sender: 'user' as const, time: new Date() };
    setWaMessages(prev => [...prev, userMsg]);
    setWaInput('');

    // Simulate Bot response delay
    setTimeout(() => {
      let botText = '';
      if (waStep === 0) {
        setWaTempData(prev => ({ ...prev, problem: userMsg.text }));
        botText = 'Entendido. Para derivar a la cuadrilla correcta, ¿me podrías indicar la dirección exacta o una referencia del lugar? 📍';
        setWaStep(1);
      } else if (waStep === 1) {
        botText = '¡Perfecto! Estoy procesando tu solicitud con nuestra Inteligencia Artificial... ⚙️';
        setWaStep(2);
        
        // Finalize after 1.5s
        setTimeout(() => {
          const deadlineDate = new Date();
          deadlineDate.setDate(deadlineDate.getDate() + 5);
          
          createTicket({
            municipality_id: 'muni-abc-123',
            vecino_id: vecino.id,
            titulo: 'Reporte vía WhatsApp',
            descripcion: `Problema: ${waTempData.problem}\nDirección: ${userMsg.text}`,
            estado: 'nuevo',
            prioridad: 3, 
            current_dept_id: 'dept-1', 
            sla_deadline: deadlineDate.toISOString(),
          });

          setWaMessages(prev => [...prev, { 
            id: Date.now().toString() + 'x', 
            text: '✅ ¡Listo! Hemos generado tu ticket exitosamente. Los equipos municipales ya fueron notificados. Puedes revisar el estado en la sección "Mis Solicitudes". ¿Hay algo más en lo que pueda ayudarte?', 
            sender: 'bot', 
            time: new Date() 
          }]);
          setWaStep(3);
        }, 1500);
      } else {
        botText = 'Tu solicitud anterior ya fue registrada. Si deseas reportar otro inconveniente, cuéntame de qué se trata.';
        setWaStep(0);
        setWaTempData({ problem: '', address: '' });
      }

      const botMsg = { id: (Date.now() + 1).toString(), text: botText, sender: 'bot' as const, time: new Date() };
      setWaMessages(prev => [...prev, botMsg]);
    }, 800);
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
            <h1 className="text-lg font-bold leading-tight">Portal Ciudadano</h1>
            <p className="text-[10px] uppercase tracking-wider opacity-60 font-medium">Gestión Municipal</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setView('mis-tickets')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${view === 'mis-tickets' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}
          >
            <TicketIcon className="w-4 h-4" /> Mis Solicitudes
          </button>
          <button 
            onClick={() => setView('nuevo-ticket')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${view === 'nuevo-ticket' ? 'bg-white/10 font-bold' : 'hover:bg-white/5 opacity-80'}`}
          >
            <PlusCircle className="w-4 h-4" /> Formulario Web
          </button>
          <button 
            onClick={() => setView('whatsapp')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${view === 'whatsapp' ? 'bg-[#25D366]/20 text-[#25D366] font-bold' : 'hover:bg-white/5 opacity-80'}`}
          >
            <MessageCircle className="w-4 h-4" /> Bot WhatsApp
          </button>
        </nav>
        <div className="p-4 mt-auto bg-[#001f3f] border-t border-[#ffffff1a] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 border border-white/20 overflow-hidden flex items-center justify-center text-white font-bold">
            {vecino.full_name?.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold leading-none truncate">{vecino.full_name}</p>
            <p className="text-[10px] text-white/50 mt-1 uppercase tracking-tighter truncate">{vecino.direccion}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#f0f2f5] overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
             <div className="md:hidden">
               <h1 className="text-sm font-bold text-slate-800">Portal Ciudadano</h1>
             </div>
             <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-slate-500 font-medium">Bienvenido, <span className="text-slate-800 font-bold">{vecino.full_name}</span></span>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative p-2 rounded-full hover:bg-slate-100 cursor-pointer mr-2">
               <Bell className="w-5 h-5 text-slate-500" />
               {myTickets.filter(t => t.estado === 'resuelto' || t.estado === 'cerrado').length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
             </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700 text-xs font-medium">
              ClaveÚnica Verificada ✔
            </div>
            <button 
              onClick={logout}
              className="px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors border border-transparent hover:border-slate-200"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-0 md:p-6 max-w-5xl mx-auto w-full overflow-hidden flex flex-col h-full">
           {view === 'mis-tickets' && (
             <div className="space-y-6 overflow-y-auto h-full p-6 md:p-0">
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold text-slate-800">Mis Solicitudes</h2>
                   <Button onClick={() => setView('whatsapp')} className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold h-9">
                      <MessageCircle className="w-4 h-4 mr-2" /> Reportar vía WA
                   </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {myTickets.length === 0 && (
                     <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
                        <TicketIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No tienes solicitudes activas</h3>
                        <p className="text-sm">Si tienes algún problema en tu sector, envíanos un reporte.</p>
                     </div>
                   )}
                   {myTickets.map(t => (
                      <Card key={t.id} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow bg-white rounded-xl overflow-hidden flex flex-col">
                         <div className="h-2 w-full bg-blue-100">
                            {t.estado === 'resuelto' || t.estado === 'cerrado' ? (
                               <div className="h-full bg-emerald-500 w-full" />
                            ) : t.estado === 'en_proceso' || t.estado === 'derivado' ? (
                               <div className="h-full bg-blue-500 w-1/2" />
                            ) : (
                               <div className="h-full bg-amber-500 w-1/4" />
                            )}
                         </div>
                         <CardHeader className="py-4 pb-2 border-b border-slate-100 flex-none">
                            <div className="flex justify-between items-start mb-2">
                               <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight text-slate-500">{t.id}</Badge>
                               <Badge className={`flex items-center gap-1.5 ${
                                 t.estado === 'resuelto' || t.estado === 'cerrado' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' :
                                 t.estado === 'en_proceso' || t.estado === 'derivado' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                               }`}>
                                 {t.estado === 'resuelto' || t.estado === 'cerrado' ? <CheckCircle2 className="w-3 h-3" /> :
                                  t.estado === 'en_proceso' || t.estado === 'derivado' ? <Clock className="w-3 h-3" /> :
                                  <Clock className="w-3 h-3" />}
                                 {t.estado.replace('_', ' ')}
                               </Badge>
                            </div>
                            <CardTitle className="text-base font-bold text-slate-800 line-clamp-2">{t.titulo}</CardTitle>
                         </CardHeader>
                         <CardContent className="py-4 text-sm text-slate-600 flex-1 flex flex-col justify-between">
                            <p className="line-clamp-3 mb-4">{t.descripcion}</p>
                            <div className="flex items-center justify-between text-xs font-medium text-slate-400 mt-auto pt-2 border-t border-slate-50">
                               <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(t.created_at).toLocaleDateString()}</span>
                               <span className="uppercase tracking-widest text-[9px] font-bold text-slate-500">Hash: {t.uuid.substring(0, 8)}</span>
                            </div>
                         </CardContent>
                      </Card>
                   ))}
                </div>
             </div>
           )}

           {view === 'nuevo-ticket' && (
             <div className="space-y-6 max-w-2xl mx-auto overflow-y-auto h-full p-6 md:p-0">
                 <div className="flex items-center gap-4">
                   <Button variant="ghost" className="px-2" onClick={() => setView('mis-tickets')}>
                     ← Volver
                   </Button>
                   <h2 className="text-xl font-bold text-slate-800">Formulario Web Tradicional</h2>
                 </div>

                 <Card className="shadow-sm border-slate-200 bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                       <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-tight flex items-center gap-2">
                         <MapPin className="w-4 h-4" /> Detalle de la Solicitud
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                       <form onSubmit={handleCreate} className="space-y-5">
                          <div className="space-y-2">
                             <Label className="text-xs font-bold text-slate-600 uppercase tracking-tight">Motivo / Título de la Solicitud</Label>
                             <Input 
                                placeholder="Ej: Luminaria apagada, Microbasural, etc." 
                                value={newTitle} 
                                onChange={e => setNewTitle(e.target.value)} 
                                required 
                                className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                              />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs font-bold text-slate-600 uppercase tracking-tight">Descripción Detallada</Label>
                             <Textarea 
                                placeholder="Por favor describa el problema con el mayor detalle posible, incluyendo dirección exacta si corresponde." 
                                value={newDesc} 
                                onChange={e => setNewDesc(e.target.value)} 
                                required 
                                className="min-h-[120px] bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                              />
                          </div>

                          <div className="space-y-2">
                             <Label className="text-xs font-bold text-slate-600 uppercase tracking-tight">Evidencia Fotográfica / PDF (Opcional)</Label>
                             <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                               <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2">
                                 <PlusCircle className="w-5 h-5 text-slate-400" />
                               </div>
                               <p className="text-sm font-medium text-slate-600">Haz clic para subir archivos o arrastra y suelta</p>
                               <p className="text-[10px] text-slate-400 mt-1">Soporta JPG, PNG, PDF (Máx 10MB)</p>
                               <input type="file" className="hidden" accept="image/*,.pdf" multiple />
                             </div>
                          </div>

                          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-2">
                             <p className="font-bold uppercase tracking-tight flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Confirmación de Identidad</p>
                             <p>Al enviar este formulario, usted confirma que la solicitud está vinculada a su RUT: <strong>{vecino.rut}</strong> mediante ClaveÚnica.</p>
                          </div>

                          <div className="pt-2">
                             <Button type="submit" className="w-full bg-[#002d5d] hover:bg-[#001f3f] text-white font-bold h-11 text-sm uppercase tracking-wide rounded-xl shadow-md transition-all">
                                Enviar Solicitud Oficial
                             </Button>
                          </div>
                       </form>
                    </CardContent>
                 </Card>
             </div>
           )}

           {view === 'whatsapp' && (
             <div className="flex flex-col h-full bg-[#E5DDD5] max-w-lg mx-auto w-full relative sm:rounded-t-2xl overflow-hidden mt-0 sm:mt-6 shadow-xl border border-slate-200">
               {/* WA Header */}
               <div className="bg-[#075E54] text-white p-3 flex items-center gap-3 shrink-0 z-10 shadow-md">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-xl">🤖</div>
                 </div>
                 <div>
                   <h2 className="font-semibold leading-tight text-[15px]">MuniBot SIGMI</h2>
                   <p className="text-[11px] text-white/80">en línea</p>
                 </div>
               </div>

               {/* WA Messages Area */}
               <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-cover bg-center">
                 {waMessages.map(msg => (
                   <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] rounded-lg p-2 px-3 shadow-sm relative text-sm ${msg.sender === 'user' ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                        <p className="text-slate-800 leading-snug whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-[10px] text-right mt-1 opacity-60 ${msg.sender === 'user' ? 'text-emerald-800' : 'text-slate-500'}`}>
                           {msg.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           {msg.sender === 'user' && <span className="ml-1 text-blue-500">✓✓</span>}
                        </p>
                     </div>
                   </div>
                 ))}
                 <div ref={messagesEndRef} />
               </div>

               {/* WA Input Form */}
               <form onSubmit={handleWaSend} className="bg-[#f0f0f0] p-2 px-3 flex gap-2 items-end shrink-0 z-10">
                 <div className="bg-white rounded-full flex-1 min-h-[40px] flex items-center px-4 shadow-sm border border-slate-200">
                   <input 
                     type="text" 
                     className="w-full outline-none text-sm bg-transparent"
                     placeholder="Escribe un mensaje..."
                     value={waInput}
                     onChange={e => setWaInput(e.target.value)}
                   />
                 </div>
                 <button 
                   type="submit"
                   disabled={!waInput.trim()}
                   className="w-10 h-10 rounded-full bg-[#00897B] text-white flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity pr-1 shadow-sm"
                 >
                   <Send className="w-4 h-4 ml-1" />
                 </button>
               </form>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
