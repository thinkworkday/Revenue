import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChartDataInterface } from '../../models/chartData.interface';

const API_PERION_URL = `${environment.apiUrl}/stats/admin/perion`;

@Injectable({
  providedIn: 'root',
})
export class PerionService {
  constructor(private http: HttpClient) { }

  testingRoute() {
    console.log('being tested');
    console.log(API_PERION_URL);
    return this.http.get<any>(`${environment.apiUrl}/stats/admin/perion/asd`);
  }

  getAllPerionStats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_PERION_URL + '/', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
  getPerTagPerionStats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_PERION_URL + '/per-tag-stat', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
  getAllDashboardStats(company): Observable<any> {
    return this.http.get<any>(API_PERION_URL + '/all-stat', { params: { company: company } });
  }
  updateAllPerionStats(company, startDate, endDate): Observable<any> {
    var data = {
      "company": company,
      'startDate': startDate,
      'endDate': endDate
    }
    return this.http.put<any>(API_PERION_URL + '/', data);
  }

  getSummaryMetrics(company, startDate, endDate) {
    return this.http.get<any>(API_PERION_URL + '/summary_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getChartMetrics(company, startDate, endDate): Observable<ChartDataInterface> {
    return this.http.get<any>(API_PERION_URL + '/chart_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getPerionChart(company) {
    return this.http.get<any>(API_PERION_URL + '/chart_perion_stat', {
      params: { company: company },
    });
  }
}
