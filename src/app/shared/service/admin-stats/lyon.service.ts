import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChartDataInterface } from '../../models/chartData.interface';

const API_LYON_URL = `${environment.apiUrl}/stats/admin/lyon`;

@Injectable({
  providedIn: 'root',
})
export class LyonService {
  constructor(private http: HttpClient) { }

  getAllStats(startDate, endDate): Observable<any> {
    return this.http.get<any>(API_LYON_URL + '/all', {
      params: { startDate: startDate, endDate: endDate },
    });
  }

  getAllPublisherStats(startDate, endDate): Observable<any> {
    return this.http.get<any>(API_LYON_URL + '/all-publishers', {
      params: { startDate: startDate, endDate: endDate },
    });
  }

  getAllDashboardStats(): Observable<any> {
    return this.http.get<any>(API_LYON_URL + '/all-stat');
  }

  updateAllLyonStats(company, startDate, endDate): Observable<any> {
    let params = new HttpParams()
      .set('company', company)
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.put<any>(API_LYON_URL + '/', { params });
  }

  getSummaryMetrics(company, startDate, endDate) {
    return this.http.get<any>(API_LYON_URL + '/summary_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getChartMetrics(company, startDate, endDate): Observable<ChartDataInterface> {
    return this.http.get<any>(API_LYON_URL + '/chart_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
}
