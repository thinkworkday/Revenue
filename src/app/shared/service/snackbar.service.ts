import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private _snackBar: MatSnackBar) { }

  info(message: string): void {
    this._snackBar.open(message, null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }
  notAccess(message: string): void {
    this._snackBar.open(message, null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'not-allowed-access'
    });
  }
  error(message: string): void {
    this._snackBar.open(message, null, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'not-allowed-access'
    });
  }

}
