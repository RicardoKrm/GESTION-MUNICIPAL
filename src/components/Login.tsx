import React, { useState } from 'react';
import { useStore } from '../lib/StoreContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Login() {
  const { login } = useStore();
  const [rut, setRut] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(rut);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] font-sans flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-[#002d5d] rounded-xl flex items-center justify-center mb-4">
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">SIGM</h1>
        <p className="text-slate-500 mt-2 font-medium tracking-tight">Sistema Inteligente de Gestión Municipal</p>
      </div>

      <Card className="w-full max-w-sm shadow-lg border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Acceso Oficial</CardTitle>
          <CardDescription>
            Validación de identidad institucional.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rut" className="text-xs font-bold text-slate-500 uppercase tracking-tight">RUT Autorizado</Label>
              <Input
                id="rut"
                placeholder="Ej. 18123456-7"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                required
                className="bg-slate-50"
              />
            </div>
            <div className="text-xs text-slate-500 bg-blue-50/50 border border-blue-100 p-4 rounded-xl mt-4">
              <p className="font-bold text-blue-800 mb-2 uppercase tracking-tight">Perfiles de DEMO:</p>
              <ul className="space-y-2 text-blue-700 font-medium">
                <li className="flex justify-between items-center"><span className="font-mono bg-white px-1.5 py-0.5 rounded shadow-sm">18123456-7</span> Funcionario</li>
                <li className="flex justify-between items-center"><span className="font-mono bg-white px-1.5 py-0.5 rounded shadow-sm">10987654-3</span> Jefe Depto</li>
                <li className="flex justify-between items-center"><span className="font-mono bg-white px-1.5 py-0.5 rounded shadow-sm">9123456-7</span> Alcalde</li>
                <li className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200/50"><span className="font-mono bg-white px-1.5 py-0.5 rounded shadow-sm">15111222-3</span> Ciudadano (Vecino)</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-[#002d5d] hover:bg-[#001f3f] text-white rounded-xl shadow-md font-bold transition-all">Ingresar al Sistema</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
