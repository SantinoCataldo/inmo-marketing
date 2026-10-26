import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PublicacionRequest,
  PublicacionResponse,
  SugerenciaTextoResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/publicaciones`;

  getPublications(): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(this.baseUrl);
  }

  getPublicationById(id: number): Observable<PublicacionResponse> {
    return this.http.get<PublicacionResponse>(`${this.baseUrl}/${id}`);
  }

  createDraft(data: PublicacionRequest): Observable<PublicacionResponse> {
    return this.http.post<PublicacionResponse>(this.baseUrl, data);
  }

  deletePublication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  suggestImageText(id: number): Observable<SugerenciaTextoResponse> {
    return this.http.post<SugerenciaTextoResponse>(`${this.baseUrl}/${id}/sugerir-texto-imagen`, {});
  }

  updateImageText(
    id: number,
    textoImagen: string,
    estiloImagen: string
  ): Observable<PublicacionResponse> {
    const params = new HttpParams()
      .set('textoImagen', textoImagen)
      .set('estiloImagen', estiloImagen);

    return this.http.patch<PublicacionResponse>(
      `${this.baseUrl}/${id}/texto-imagen`,
      null,
      { params }
    );
  }

  generateCopy(id: number): Observable<PublicacionResponse> {
    return this.http.post<PublicacionResponse>(`${this.baseUrl}/${id}/generar`, {});
  }

  generateImage(id: number): Observable<PublicacionResponse> {
    return this.http.post<PublicacionResponse>(`${this.baseUrl}/${id}/generar-imagen`, {});
  }

  markAsPublished(id: number): Observable<PublicacionResponse> {
    return this.http.post<PublicacionResponse>(`${this.baseUrl}/${id}/publicada`, {});
  }
}
