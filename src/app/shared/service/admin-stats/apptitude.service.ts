import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChartDataInterface } from '../../models/chartData.interface';

const API_APPTITDE_URL = `${environment.apiUrl}/stats/admin/apptitude`;

@Injectable({
  providedIn: 'root',
})

export class ApptitudeService {
  constructor(private http: HttpClient) { }

  getChartMetrics(company, startDate, endDate): Observable<ChartDataInterface> {
    return this.http.get<any>(API_APPTITDE_URL + '/chart_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
  getPublisherApptitudeStats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_APPTITDE_URL + '/all-publishers', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getApptitudeStats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_APPTITDE_URL + '/', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getSummaryMetrics(company, startDate, endDate) {
    return this.http.get<any>(API_APPTITDE_URL + '/summary_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
  getAllDashboardStats(): Observable<any> {
    return this.http.get<any>(API_APPTITDE_URL + '/all-stat');
  }
}