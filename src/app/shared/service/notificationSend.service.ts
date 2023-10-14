import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Socket } from 'ngx-socket-io';
import { Observable, Observer } from 'rxjs';
import { environment } from "src/environments/environment";

const API_NOTIFICATION_URL = `${environment.apiUrl}/notifications`;

@Injectable({
    providedIn: 'root'
})

export class NotificationSendService {
    constructor(
        private http: HttpClient,
        private socket: Socket
    ) { }

    getMessage() {
        return new Observable((observer: Observer<any>) => {
            this.socket.on('notifications', (notifications: string) => {
                observer.next(notifications)
            })
        })
    }

    sendNotitication(notiData: any) {
        return this.http.post(`${API_NOTIFICATION_URL}/new-notification`, notiData);
    }

    superAdminNotificatoins() {
        return this.http.get(`${API_NOTIFICATION_URL}/super-admin-notifications`);
    }

    publisherNotificatoins() {
        return this.http.get(`${API_NOTIFICATION_URL}/publisher-notifications`);
    }

    clearNotification(notificationKey: any) {
        return this.http.delete(API_NOTIFICATION_URL + `/${notificationKey}`);
    }

    clearSuperNotification(notificationKey: any) {
        return this.http.delete(API_NOTIFICATION_URL + `/${notificationKey}`);
    }

    getDetailNotificatoin(notificationId: any) {
        return this.http.get(`${API_NOTIFICATION_URL}/detail/${notificationId}`);
    }
}