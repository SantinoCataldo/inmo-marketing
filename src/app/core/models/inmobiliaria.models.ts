export interface InmobiliariaRequest {
  nombre: string;
  telefono?: string;
  instagram?: string;
  direccion?: string;
  logoUrl?: string;
}

export interface InmobiliariaResponse {
  id: number;
  nombre: string;
  telefono?: string;
  instagram?: string;
  direccion?: string;
  logoUrl?: string;
  creadaEn?: string;
  cantidadUsuarios?: number;
}
