import { Ticket, User, Vecino, Departamento, Accion } from '../types';
import { addDays, subDays } from 'date-fns';

export const MOCK_MUNICIPALITY_ID = 'muni-abc-123';

export const mockDepartamentos: Departamento[] = [
  { id: 'dept-1', municipality_id: MOCK_MUNICIPALITY_ID, nombre: 'Obras Públicas' },
  { id: 'dept-2', municipality_id: MOCK_MUNICIPALITY_ID, nombre: 'Tránsito' },
  { id: 'dept-3', municipality_id: MOCK_MUNICIPALITY_ID, nombre: 'DIDECO' },
  { id: 'dept-4', municipality_id: MOCK_MUNICIPALITY_ID, nombre: 'Aseo y Ornato' },
  { id: 'dept-5', municipality_id: MOCK_MUNICIPALITY_ID, nombre: 'Administración Municipal' },
];

export const mockUsers: User[] = [
  { id: 'usr-1', municipality_id: MOCK_MUNICIPALITY_ID, rut: '18123456-7', full_name: 'Juan Funcionario', role: 'funcionario', dept_id: 'dept-1' },
  { id: 'usr-2', municipality_id: MOCK_MUNICIPALITY_ID, rut: '10987654-3', full_name: 'María Jefe', role: 'jefe_depto', dept_id: 'dept-1' },
  { id: 'usr-3', municipality_id: MOCK_MUNICIPALITY_ID, rut: '9123456-7', full_name: 'Pedro Alcalde', role: 'alcalde' },
];

export const mockVecinos: Vecino[] = [
  { id: 'vec-1', rut: '15111222-3', full_name: 'Andrea Ciudadana', email: 'andrea@mock.cl', telefono: '+56911112222', direccion: 'Calle Falsa 123', role: 'vecino' },
  { id: 'vec-2', rut: '16222333-4', full_name: 'Carlos Vecino', email: 'carlos@mock.cl', telefono: '+56922223333', direccion: 'Avenida Siempre Viva 742', role: 'vecino' },
];

const now = new Date();

export const mockTickets: Ticket[] = [
  {
    id: 'T-1001',
    uuid: 'uuid-1001',
    municipality_id: MOCK_MUNICIPALITY_ID,
    vecino_id: 'vec-1',
    titulo: 'Poda de árbol peligroso',
    descripcion: 'Un árbol está a punto de caer sobre mi techo en Calle Falsa 123.',
    estado: 'en_proceso',
    prioridad: 1,
    current_dept_id: 'dept-4',
    created_at: subDays(now, 2).toISOString(),
    sla_deadline: addDays(now, 1).toISOString(),
    hops: 1,
  },
  {
    id: 'T-1002',
    uuid: 'uuid-1002',
    municipality_id: MOCK_MUNICIPALITY_ID,
    vecino_id: 'vec-2',
    titulo: 'Bache en Avenida',
    descripcion: 'Tremendo hoyo en la calle que rompe neumáticos.',
    estado: 'nuevo',
    prioridad: 2,
    current_dept_id: 'dept-1',
    created_at: subDays(now, 1).toISOString(),
    sla_deadline: addDays(now, 3).toISOString(),
    hops: 0,
  },
  {
    id: 'T-1003',
    uuid: 'uuid-1003',
    municipality_id: MOCK_MUNICIPALITY_ID,
    vecino_id: 'vec-1',
    titulo: 'Solicitud Subsidio Habitacional',
    descripcion: 'Consulto estado de mi postulación a vivienda.',
    estado: 'derivado',
    prioridad: 3,
    current_dept_id: 'dept-3',
    created_at: subDays(now, 5).toISOString(),
    sla_deadline: subDays(now, 1).toISOString(), // Vencido!
    hops: 2,
  },
];

export const mockAcciones: Accion[] = [
  {
    id: 'acc-1',
    ticket_id: 'uuid-1001',
    usuario_id: 'usr-1',
    accion: 'creacion',
    estado_nuevo: 'nuevo',
    comentario: 'Ticket ingresado por ventanilla',
    timestamp: subDays(now, 2).toISOString(),
  },
  {
    id: 'acc-2',
    ticket_id: 'uuid-1001',
    usuario_id: 'usr-2',
    accion: 'derivacion',
    estado_anterior: 'nuevo',
    estado_nuevo: 'en_proceso',
    comentario: 'Asignado a cuadrilla de terreno',
    timestamp: subDays(now, 1).toISOString(),
  }
];
