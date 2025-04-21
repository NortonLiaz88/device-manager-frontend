import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { PaginatedResponse } from '../models/paginated.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private baseUrl = 'http://localhost:3000/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  create(category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  update(id: number, data: { name: string }): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAllPaginated(
    page = 1,
    limit = 10,
    search = '',
    orderBy: 'id' | 'name' = 'id',
    orderDir: 'ASC' | 'DESC' = 'ASC'
  ): Observable<PaginatedResponse<Category>> {
    console.log('getAllPaginated', {
      page,
      limit,
      search,
      orderBy,
      orderDir,
    });
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('orderBy', orderBy)
      .set('orderDir', orderDir);

    if (search) {
      params = params.set('name', search);
    }
    return this.http.get<PaginatedResponse<Category>>(
      `${this.baseUrl}/paginated`,
      { params }
    );
  }
}
