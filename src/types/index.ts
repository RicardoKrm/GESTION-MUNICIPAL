export type Role = 'funcionario' | 'jefe_depto' | 'alcalde';

export interface User {
  id: string;
  municipality_id: string;
  rut: string;
  full_name: string;
  role: Role;
  dept_id?: string;
}

export interface Vecino {
  id: string;
  rut: string;
  full_name: string;
  email: string;
  telefono: string;
  direccion: string;
  role: 'vecino';
}

export interface Departamento {
  id: string;
  municipality_id: string;
  nombre: string;
}

export type TicketStatus = 'nuevo' | 'en_proceso' | 'derivado' | 'resuelto' | 'cerrado';
export type TicketPriority = 1 | 2 | 3 | 4; // 1: Critico, 2: Alta, 3: Media, 4: Baja

export interface Ticket {
  id: string;
  uuid: string;
  municipality_id: string;
  vecino_id: string;
  titulo: string;
  descripcion: string;
  estado: TicketStatus;
  prioridad: TicketPriority;
  current_dept_id: string;
  sla_deadline: string; // ISO string Date
  created_at: string; // ISO string Date
  hops: number; // For anti-peloteo logic
  metadata?: Record<string, any>;
  health_score?: number; // Calculated on the fly or precalculated
}

export interface Accion {
  id: string;
  ticket_id: string;
  usuario_id: string;
  accion: 'creacion' | 'derivacion' | 'resolucion' | 'comentario' | 'cierre' | 'reapertura';
  estado_anterior?: TicketStatus;
  estado_nuevo: TicketStatus;
  comentario: string;
  timestamp: string; // ISO string Date
}

export interface Briefing {
  date: string;
  content: string;
  sentiment: 'critical' | 'stable' | 'positive';
  key_topics: string[];
}
