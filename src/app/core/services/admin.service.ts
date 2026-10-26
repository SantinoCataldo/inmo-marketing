import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InmobiliariaResponse,
  RegisterRequest,
  UserResponse,
  UserUpdateRequest
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly adminUrl = `${environment.apiUrl}/api/admin`;
  private readonly usersUrl = `${environment.apiUrl}/api/users`;

  getAgencies(): Observable<InmobiliariaResponse[]> {
    return this.http.get<InmobiliariaResponse[]>(`${this.adminUrl}/inmobiliarias`);
  }

  blockUser(userId: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.adminUrl}/usuarios/${userId}/bloquear`, {});
  }

  activateUser(userId: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.adminUrl}/usuarios/${userId}/activar`, {});
  }

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.usersUrl);
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.usersUrl}/${id}`);
  }

  createUser(data: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.usersUrl, data);
  }

  updateUser(id: number, data: UserUpdateRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.usersUrl}/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }
}
