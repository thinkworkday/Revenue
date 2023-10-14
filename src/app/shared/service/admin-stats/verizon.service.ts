import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChartDataInterface } from '../../models/chartData.interface';

const API_VERIZON_URL = `${environment.apiUrl}/stats/admin/verizon`;

@Injectable({
  providedIn: 'root',
})

export class VerizonService {
  constructor(private http: HttpClient) { }

  getChartMetrics(company, startDate, endDate): Observable<ChartDataInterface> {
    return this.http.get<any>(API_VERIZON_URL + '/chart_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
  getAllVerizonStats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_VERIZON_URL + '/', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getAllPublisherVerizonStats(company, startDate, endDate): Observable<any> {
    return this.http.get<any>(API_VERIZON_URL + '/all-publishers', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getSummaryMetrics(company, startDate, endDate) {
    return this.http.get<any>(API_VERIZON_URL + '/summary_metrics', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
  updateAllPerionStats(company, startDate, endDate): Observable<any> {
    var data = {
      "company": company,
      'startDate': startDate,
      'endDate': endDate
    }
    return this.http.put<any>(API_VERIZON_URL + '/', data);
  }
  getAllDashboardStats(): Observable<any> {
    return this.http.get<any>(API_VERIZON_URL + '/all-stat');
  }
}