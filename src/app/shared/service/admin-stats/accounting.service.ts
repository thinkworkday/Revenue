import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

const API_ACCOUNTING_URL = `${environment.apiUrl}/stats/admin/accounting`;

@Injectable({
  providedIn: 'root',
})

export class AccountingService {
  constructor(private http: HttpClient) { }

  getRubiStats(company: any, startDate: any, endDate: any): Observable<any> {
    return this.http.get<any>(API_ACCOUNTING_URL + '/rubi', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getPerionStats(company: any, startDate: any, endDate: any): Observable<any> {
    return this.http.get<any>(API_ACCOUNTING_URL + '/perion', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getLyonStats(company: any, startDate: any, endDate: any): Observable<any> {
    return this.http.get<any>(API_ACCOUNTING_URL + '/lyons', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
  getApptitudeStats(company: any, startDate: any, endDate: any): Observable<any> {
    return this.http.get<any>(API_ACCOUNTING_URL + '/apptitude', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getSolexBCStats(company: any, startDate: any, endDate: any): Observable<any> {
    return this.http.get<any>(API_ACCOUNTING_URL + '/solex-bc', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getVerizonDirectStats(company: any, startDate: any, endDate: any): Observable<any> {
    return this.http.get<any>(API_ACCOUNTING_URL + '/verizon-direct', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }

  getSystem1Stats(company: any, startDate: any, endDate: any): Observable<any> {
    return this.http.get<any>(API_ACCOUNTING_URL + '/system1', {
      params: { company: company, startDate: startDate, endDate: endDate },
    });
  }
}