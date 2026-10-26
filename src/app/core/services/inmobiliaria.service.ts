import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InmobiliariaRequest, InmobiliariaResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InmobiliariaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/inmobiliaria`;

  getProfile(): Observable<InmobiliariaResponse> {
    return this.http.get<InmobiliariaResponse>(this.baseUrl);
  }

  updateProfile(data: InmobiliariaRequest): Observable<InmobiliariaResponse> {
    return this.http.put<InmobiliariaResponse>(this.baseUrl, data);
  }
}
