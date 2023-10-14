import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChartDataInterface } from '../../models/chartData.interface';

const API_SOLEXBC_URL = `${environment.apiUrl}/stats/admin/solexbc`;

@Injectable({
  providedIn: 'root',
})

export class SolexBCService {
  constructor(private http: HttpClient) { }

  getChartMetrics(company, startDate, endDate): Observable<ChartDataInterface> {
    return this.http.get<any>(API_SOLEXBC_URL + '/chart_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
  getAllSolexBCStats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_SOLEXBC_URL + '/all-publishers', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getSolexBCStats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_SOLEXBC_URL + '/', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getSummaryMetrics(company, startDate, endDate) {
    return this.http.get<any>(API_SOLEXBC_URL + '/summary_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
  getAllDashboardStats(): Observable<any> {
    return this.http.get<any>(API_SOLEXBC_URL + '/all-stat');
  }
}