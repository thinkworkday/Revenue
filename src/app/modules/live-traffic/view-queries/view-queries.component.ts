import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TrafficQueryInterface } from 'src/app/shared/models/trafficQueries.interface';
import { TrafficService } from 'src/app/shared/service/traffic.service';

@Component({
  selector: 'app-view-queries',
  templateUrl: './view-queries.component.html',
  styleUrls: ['./view-queries.component.scss'],
})
export class ViewQueriesComponent implements OnInit {
  rows: Array<TrafficQueryInterface>;
  loadingIndicator = true;
  constructor(
    private trafficService: TrafficService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.getAllTrafficQuery();
  }

  getAllTrafficQuery() {
    this.trafficService.getAllTrafficQueries().subscribe((x) => {
      console.log(x);
      this.rows = x;
      this.loadingIndicator = false;
      this.cdr.detectChanges();
    });
  }
}
