import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

const API_SYSTEM1_URL = `${environment.apiUrl}/stats/admin/system1`;

@Injectable({
  providedIn: 'root'
})
export class System1Service {

  constructor(private http: HttpClient) { }

  getAllSystem1Stats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_SYSTEM1_URL + '/', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getAllDashboardStats(): Observable<any> {
    return this.http.get<any>(API_SYSTEM1_URL + '/all-stat');
  }

  getSystem1PublisherStats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_SYSTEM1_URL + '/all-publishers', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getSummaryMetrics(company, startDate, endDate) {
    return this.http.get<any>(API_SYSTEM1_URL + '/summary_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
}
