// Types mirroring the imSystem backend contract (control_web_interface_prompt.xml)

export interface AuthUser {
  role: "control";
  first_name: string;
  last_name: string;
}

// --- Notificaciones (FCM) ---

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  receivedAt: Date;
}

// --- Personal ---

export interface PersonalListItem {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  rut: string;
  is_active: boolean;
  rol_nombre: string | null;
  last_login: string | null;
}

export interface AddStaffRequest {
  username: string;
  first_name: string;
  last_name: string;
  rut: string;
  rol_id: number;
}

export interface AddStaffResponse {
  success: string;
  totp_uri: string;
  password: string;
  usuario_id: number;
}

// --- Pacientes ---

export interface Paciente {
  id?: number;
  rut: string;
  nombre_completo?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  condicion_paciente?: string;
  telefono?: string;
  comuna?: string;
}

// --- Grupos ---

export interface GrupoMiembro {
  nombre: string;
  rut: string;
  rol: string | null;
  dia_ingresado: string;
  dia_salida: string | null;
}

export interface Grupo {
  grupo_id: number;
  grupo_nombre: string;
  miembros: GrupoMiembro[];
}

// --- Despachos ---

export type DespachoEstado =
  | "recibido"
  | "asignado"
  | "finalizado"
  | "cancelado"
  | "programado"
  | "emergencia";

export interface DespachoPersonal {
  id: number;
  first_name: string;
  last_name: string;
  rut: string;
  rol: string | null;
}

export interface Despacho {
  id: number;
  estado: DespachoEstado;
  direccion_origen: string;
  direccion_destino: string | null;
  descripcion_llamado: string | null;
  fecha_llamado: string;
  fecha_asignacion: string | null;
  fecha_programada?: string | null;
  fecha_finalizacion?: string | null;
  ambulancia_id: number | null;
  paciente: { nombre_completo: string; rut: string } | null;
  personal: DespachoPersonal[];
  creado_por_id?: number;
  asignado_por_id?: number;
}

export interface CursorPage<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AddDespachoResponse {
  success: string;
  despacho: {
    id: number;
    paciente: { rut: string; nombre: string };
  };
}

export interface AsignarDespachoResponse {
  success: string;
  despacho_data: {
    id: number;
    grupo: {
      nombre: string;
      personal: {
        personal_id: number;
        personal_rut: string;
        personal_name: string;
      }[];
    };
  };
}

// --- Ambulancias ---

// Valores literales reales de Ambulancia.ESTADOS en el backend (models.py).
export type AmbulanciaEstado =
  | "Lista para un nuevo despacho"
  | "Actualmente en despacho"
  | "Preparación previa para operar"
  | "En mantención"
  | "Fuera de servicio temporalmente";

export interface AmbulanciaStockItem {
  presentacion_id: number;
  insumo_nombre: string;
  insumo_cantidad: number;
  categoria: string;
  unidad_medida: string;
  stock: number;
}

export interface Ambulancia {
  ambulancia_id: number;
  patente: string;
  estado: AmbulanciaEstado;
  stock: AmbulanciaStockItem[];
}

export interface RegisterAmbulanciaRequest {
  patente: string;
  modelo: string;
  estado_disponibilidad?: AmbulanciaEstado;
}

export interface RegisterAmbulanciaResponse {
  success: string;
  ambulancia_id: number;
}

// --- Inventario ---

export interface InventarioRow {
  presentacion: {
    id: number;
    nombre: string;
    categoria: string;
    categoria_id: number;
    cantidad: number;
    unidad_medida: string;
  };
  ambulancia: {
    patente: string;
    stock: number;
  };
}

export interface AddInventarioItem {
  nombre_insumo: string;
  categoria_id: number;
  cantidad: number;
  unidad_medida_id: number;
  stock: number;
  ambulancia_id: number;
}

// --- Atenciones ---

export type EstadoSello = "Pendiente" | "Firmado";

export interface AtencionListItem {
  atencion_id: number;
  hora_salida: string;
  hora_llegada: string | null;
  estado_sello: EstadoSello;
  firma_digital: string;
  despacho: {
    despacho_id: number;
    paciente: { nombre: string; rut: string } | null;
  } | null;
}

// --- Auditoria ---

export type LogTipo =
  | "atencion"
  | "inventario"
  | "ambulancia"
  | "despacho"
  | "grupo"
  | "paciente"
  | "informacion";

export interface LogEntry {
  id: number;
  tipo: LogTipo;
  atencion_id: number | null;
  usuario: number;
  rut_usuario: string;
  descripcion: string;
  timestamp: string;
}

// --- Documento Atención (firmado, S3) ---

export interface SignosVitales {
  hora: string;
  presion_sistolica: number;
  presion_diastolica: number;
  frecuencia_cardiaca: number;
  saturacion_oxigeno: number;
  temperatura: number;
  fr: number;
  fio2: number;
  hgt: number;
  gcs: number;
  eva: number;
  observaciones?: string;
}

export interface PreInforme {
  pre_informe: string;
  motivo_llamado: string;
  estado_paciente: string;
}

export interface Cronologia {
  hora_llamada: string;
  despacho_movil: string;
  llegada_qth1: string;
  salida_qth1: string;
  llegada_qth2: string;
  salida_qth2: string;
  categoria: string;
}

export interface InsumoUtilizado {
  insumo__insumo__nombre_insumo: string;
  cantidad_usada: number;
  observaciones: string;
}

export interface RegistradoPor {
  nombre_completo: string;
  rut: string;
  rol: string;
}

export interface DocumentoAtencion {
  atencion: {
    id: number;
    ambulancia: number;
    despacho: number;
    hora_salida: string;
    hora_llegada: string;
    sello_electronico: string;
    estado_sello: string;
  };
  paciente: { nombre_completo: string; rut: string };
  registrado_por: RegistradoPor;
  recibido_por: string;
  signos_vitales: SignosVitales[];
  preinforme: PreInforme;
  cronologia: Cronologia;
  insumos_utilizados: InsumoUtilizado[];
  Hash: string;
  Firma: string;
}
