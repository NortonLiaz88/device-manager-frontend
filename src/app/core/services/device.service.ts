import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Device } from '../models/device.model';
import { PaginatedResponse } from '../models/paginated.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private baseUrl = `http://${environment.apiUrl}:3000/devices`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Device[]> {
    return this.http.get<Device[]>(this.baseUrl);
  }

  getById(id: number): Observable<Device> {
    return this.http.get<Device>(`${this.baseUrl}/${id}`);
  }

  create(device: Omit<Device, 'id'>): Observable<Device> {
    return this.http.post<Device>(this.baseUrl, device);
  }

  update(id: number, data: Partial<Omit<Device, 'id'>>): Observable<Device> {
    return this.http.put<Device>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAllPaginated(
    page = 1,
    limit = 10,
    search = '',
    orderBy: 'id' | 'partNumber' | 'color' | 'category' = 'id',
    orderDir: 'ASC' | 'DESC' = 'ASC'
  ): Observable<PaginatedResponse<Device>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('orderBy', orderBy)
      .set('orderDir', orderDir);

    if (search) {
      params = params.set('partNumber', search);
    }

    return this.http.get<PaginatedResponse<Device>>(
      `${this.baseUrl}/paginated`,
      { params }
    );
  }
}
