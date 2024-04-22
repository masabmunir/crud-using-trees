import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:1337/api/customers';

  constructor(private http: HttpClient) { }

  public getEmployees(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching employees:', error);
        return throwError(error); // Re-throw the error to propagate it to the subscriber
      })
    );
  }
  

  addEmployee(data: any): Observable<any> {
    const requestData = { data:
      {node:data.field}
    };
    return this.http.post(this.apiUrl,requestData);
  }

  public deleteEmployee(itemId: number): Observable<any> {
    const apiUrl = `http://localhost:1337/api/customers/${itemId}`;
    return this.http.delete(apiUrl).pipe(
      catchError(error => {
        console.error('Error deleting item:', error);
        return throwError(error); 
      })
    );
  }
}
