import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArchivoResponse, PropiedadRequest, PropiedadResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/propiedades`;
  private readonly filesUrl = `${environment.apiUrl}/api/archivos`;

  getProperties(): Observable<PropiedadResponse[]> {
    return this.http.get<PropiedadResponse[]>(this.baseUrl);
  }

  getPropertyById(id: number): Observable<PropiedadResponse> {
    return this.http.get<PropiedadResponse>(`${this.baseUrl}/${id}`);
  }

  createProperty(data: PropiedadRequest): Observable<PropiedadResponse> {
    return this.http.post<PropiedadResponse>(this.baseUrl, data);
  }

  updateProperty(id: number, data: PropiedadRequest): Observable<PropiedadResponse> {
    return this.http.put<PropiedadResponse>(`${this.baseUrl}/${id}`, data);
  }

  deleteProperty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadPhotos(propertyId: number, files: File[]): Observable<ArchivoResponse[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('fotos', file, file.name);
    }
    return this.http.post<ArchivoResponse[]>(`${this.baseUrl}/${propertyId}/fotos`, formData);
  }

  getPropertyPhotos(propertyId: number): Observable<ArchivoResponse[]> {
    return this.http.get<ArchivoResponse[]>(`${this.baseUrl}/${propertyId}/fotos`);
  }

  getFileBlob(fileId: number): Observable<Blob> {
    return this.http.get(`${this.filesUrl}/${fileId}`, { responseType: 'blob' });
  }
}
