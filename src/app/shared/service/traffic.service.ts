import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TrafficQueryInterface } from '../models/trafficQueries.interface';

const API_TRAFFIC_QUERY_URL = `${environment.apiUrl}/traffic-query`;

@Injectable({
  providedIn: 'root'
})
export class TrafficService {

  constructor(
    private http: HttpClient
  ) { }

  getAllTrafficQueries(): Observable<TrafficQueryInterface[]> {
    return this.http.get<TrafficQueryInterface[]>(API_TRAFFIC_QUERY_URL);
  }
}
