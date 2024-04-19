import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:1337/api/employees';

  constructor(private http: HttpClient) { }

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError) // Here's the catchError operator
      );
  }

  addEmployee(employee: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, employee)
      .pipe(
        catchError(this.handleError) // Here's the catchError operator
      );
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong; please try again later.');
  }
}
