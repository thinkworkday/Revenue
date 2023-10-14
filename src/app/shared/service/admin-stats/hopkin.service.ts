import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChartDataInterface } from '../../models/chartData.interface';

const API_HOPKIN_URL = `${environment.apiUrl}/stats/admin/hopkins`;

@Injectable({
  providedIn: 'root',
})

export class HopkinService {
  constructor(private http: HttpClient) { }

  getChartMetrics(company, startDate, endDate): Observable<ChartDataInterface> {
    return this.http.get<any>(API_HOPKIN_URL + '/chart_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
  getAllHopkinStats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_HOPKIN_URL + '/all-publishers', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getHopkinStats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_HOPKIN_URL + '/', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getSummaryMetrics(company, startDate, endDate) {
    return this.http.get<any>(API_HOPKIN_URL + '/summary_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
  
  getAllDashboardStats(): Observable<any> {
    return this.http.get<any>(API_HOPKIN_URL + '/all-stat');
  }
}