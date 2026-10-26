export type RedSocial = 'INSTAGRAM' | 'FACEBOOK';
export type Formato = 'IMAGEN';
export type EstadoPublicacion = 'BORRADOR' | 'LISTA' | 'PUBLICADA' | 'ERROR';

export interface PublicacionRequest {
  propiedadId: number;
  red: RedSocial;
  formato: Formato;
  indicaciones?: string;
  estiloImagen?: string;
  textoImagen?: string;
  fotoIds?: number[];
}

export interface PublicacionResponse {
  id: number;
  propiedadId: number;
  propiedadTitulo?: string;
  red: RedSocial;
  formato: Formato;
  indicaciones: string;
  texto: string;
  textoImagen: string;
  estiloImagen: string;
  estado: EstadoPublicacion;
  publicadaEn?: string;
  fotoIds: number[];
  imagenGeneradaId?: number;
  creadoEn?: string;
}

export interface SugerenciaTextoResponse {
  publicacionId: number;
  textoSugerido: string;
}
