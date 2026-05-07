import React from 'react';
import { useStore } from '../lib/StoreContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building2, User, UserCircle, Users } from 'lucide-react';

export default function Login() {
  const { login } = useStore();

  const handleLogin = (rut: string) => {
    login(rut);
  };

  const profiles = [
    { rut: '18123456-7', name: 'Oficina de Partes', description: 'Gestión general y derivaciones', icon: User, color: 'bg-sky-100 text-sky-700 hover:bg-sky-50', border: 'hover:border-sky-300' },
    { rut: '10987654-3', name: 'Jefatura de Depto', description: 'Atención y resolución de tickets', icon: Users, color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-50', border: 'hover:border-indigo-300' },
    { rut: '9123456-7', name: 'Alcaldía', description: 'Monitoreo e ingreso prioritario', icon: Building2, color: 'bg-violet-100 text-violet-800 hover:bg-violet-50', border: 'hover:border-violet-300' },
    { rut: '15111222-3', name: 'Portal Ciudadano', description: 'Ingreso e historial de solicitudes', icon: UserCircle, color: 'bg-teal-100 text-teal-700 hover:bg-teal-50', border: 'hover:border-teal-300' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100/40 blur-3xl" />

      <div className="max-w-xl w-full flex flex-col gap-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/10 ring-4 ring-white">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">SIGM</h1>
            <p className="text-slate-500 mt-2 font-medium tracking-wide text-sm">Sistema Inteligente de Gestión Municipal</p>
          </div>
        </div>

        <Card className="w-full shadow-2xl shadow-slate-200/50 border-0 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl ring-1 ring-slate-100">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 pt-8">
            <CardTitle className="text-lg font-semibold text-slate-800 text-center tracking-tight">Acceso Rápido al Sistema</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profiles.map((profile) => (
                <button
                  key={profile.rut}
                  onClick={() => handleLogin(profile.rut)}
                  className={`flex flex-col text-left items-start p-5 rounded-2xl border-2 border-slate-100 bg-white shadow-sm ring-offset-2 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-slate-400 ${profile.border} ${profile.color.split(' ')[2]}`}
                >
                  <div className={`w-12 h-12 ${profile.color.split(' ').slice(0, 2).join(' ')} rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:-translate-y-1`}>
                    <profile.icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-slate-900 text-sm mb-1">{profile.name}</span>
                  <span className="text-[11px] text-slate-500 mb-4 leading-relaxed">{profile.description}</span>
                  <div className="mt-auto pt-3 border-t border-slate-100 w-full flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                      RUT Demo
                    </span>
                    <span className="text-[10px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {profile.rut}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            <p className="text-center text-xs text-slate-400 mt-8 font-medium">
              V 2.0.1 • Entorno de Pruebas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
