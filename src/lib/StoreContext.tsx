import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Ticket, User, Vecino, Departamento, Accion } from '../types';
import { mockTickets, mockUsers, mockDepartamentos, mockVecinos, mockAcciones } from './mockData';

interface StoreState {
  currentUser: User | Vecino | null;
  users: User[];
  tickets: Ticket[];
  departamentos: Departamento[];
  vecinos: Vecino[];
  acciones: Accion[];
}

interface StoreActions {
  login: (rut: string) => void;
  logout: () => void;
  createTicket: (ticket: Omit<Ticket, 'id' | 'uuid' | 'created_at' | 'hops'>) => void;
  updateTicketStatus: (ticketId: string, nuevoEstado: Ticket['estado'], comentario: string, targetDeptId?: string) => void;
}

const StoreContext = createContext<(StoreState & StoreActions) | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | Vecino | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [users] = useState<User[]>(mockUsers);
  const [departamentos] = useState<Departamento[]>(mockDepartamentos);
  const [vecinos] = useState<Vecino[]>(mockVecinos);
  const [acciones, setAcciones] = useState<Accion[]>(mockAcciones);

  const login = (rut: string) => {
    const user = users.find(u => u.rut === rut);
    if (user) {
      setCurrentUser(user);
      return;
    }
    const vecino = vecinos.find(v => v.rut === rut);
    if (vecino) {
      setCurrentUser(vecino);
      return;
    }
    alert('Usuario no encontrado');
  };

  const logout = () => setCurrentUser(null);

  const createTicket = (ticketData: Omit<Ticket, 'id' | 'uuid' | 'created_at' | 'hops'>) => {
    const newId = `T-${Math.floor(Math.random() * 10000) + 1000}`;
    const newUuid = `uuid-${Date.now()}`;
    
    // Simular IA de clasificación automática si el ticket viene de vecinos o bots (por defecto dept-1 o vacío)
    let assignedDept = ticketData.current_dept_id;
    let autoAssigned = false;
    let priority = ticketData.prioridad;

    if (ticketData.vecino_id && !ticketData.titulo.includes('[ALCALDÍA]')) {
       const content = (ticketData.titulo + ' ' + ticketData.descripcion).toLowerCase();
       if (content.match(/bache|calle|hoyo|pavimento|vereda|transito|semaforo|choque/)) {
          assignedDept = 'dept-2'; // Tránsito y Obras
          autoAssigned = true;
       } else if (content.match(/basura|microbasural|limpieza|arbol|ramas|plaza|parque/)) {
          assignedDept = 'dept-3'; // Aseo y Ornato
          autoAssigned = true;
       } else if (content.match(/legal|demanda|abogado|ley/)) {
          assignedDept = 'dept-4'; // Jurídico
          autoAssigned = true;
       }
       
       if (content.match(/urgente|peligro|emergencia|grave/)) {
          priority = 1;
       } else if (content.match(/importante|pronto|rapido/)) {
          priority = 2;
       }
    }

    const newTicket: Ticket = {
      ...ticketData,
      id: newId,
      uuid: newUuid,
      current_dept_id: assignedDept,
      prioridad: priority,
      created_at: new Date().toISOString(),
      hops: 0
    };

    setTickets([...tickets, newTicket]);

    if (currentUser) {
      setAcciones([...acciones, {
        id: `acc-${Date.now()}`,
        ticket_id: newUuid,
        usuario_id: currentUser.id,
        accion: autoAssigned ? 'derivacion' : 'creacion',
        estado_nuevo: ticketData.estado,
        comentario: autoAssigned ? `[AUTO-ASIGNACIÓN IA] Ticket derivado automáticamente al depto asignado. Detalles del flujo: ${ticketData.descripcion}` : 'Ticket creado',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const updateTicketStatus = (uuid: string, nuevoEstado: Ticket['estado'], comentario: string, targetDeptId?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.uuid !== uuid) return t;
      
      let newHops = t.hops;
      let newDept = targetDeptId || t.current_dept_id;

      // Anti-Peloteo Logic
      if (nuevoEstado === 'derivado') {
        newHops += 1;
        if (newHops >= 3) {
          // Send to Admin Municipal (dept-5)
          newDept = 'dept-5';
          comentario = `[SISTEMA - ESCALADO AUTOMÁTICO] Ticket excedió límite de derivaciones (3 hops). Escalado a Administración Municipal. Original: ${comentario}`;
        }
      }

      return {
        ...t,
        estado: nuevoEstado,
        current_dept_id: newDept,
        hops: newHops
      }
    }));

    if (currentUser) {
      const t = tickets.find(t => t.uuid === uuid);
      setAcciones(prev => [...prev, {
         id: `acc-${Date.now()}`,
         ticket_id: uuid,
         usuario_id: currentUser.id,
         accion: nuevoEstado === 'derivado' ? 'derivacion' : 'resolucion',
         estado_anterior: t?.estado,
         estado_nuevo: nuevoEstado,
         comentario,
         timestamp: new Date().toISOString()
      }]);
    }
  };

  return (
    <StoreContext.Provider value={{ currentUser, users, tickets, departamentos, vecinos, acciones, login, logout, createTicket, updateTicketStatus }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
