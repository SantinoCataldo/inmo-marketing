import { ArchivoResponse } from './archivo.models';

export type TipoPropiedad = 'CASA' | 'DEPARTAMENTO' | 'PH' | 'TERRENO' | 'LOCAL';
export type TipoOperacion = 'VENTA' | 'ALQUILER';
export type EstadoPropiedad = 'DISPONIBLE' | 'RESERVADA' | 'VENDIDA';

export interface PropiedadRequest {
  titulo: string;
  tipo: TipoPropiedad;
  operacion: TipoOperacion;
  estado?: EstadoPropiedad;
  precio: number;
  direccion?: string;
  ambientes: number;
  metrosCuadrados: number;
  descripcion?: string;
}

export interface PropiedadResponse {
  id: number;
  titulo: string;
  tipo: TipoPropiedad;
  operacion: TipoOperacion;
  estado: EstadoPropiedad;
  precio: number;
  direccion: string;
  ambientes: number;
  metrosCuadrados: number;
  descripcion: string;
  inmobiliariaId?: number;
  fotos?: ArchivoResponse[];
  creadoEn?: string;
  actualizadoEn?: string;
}
