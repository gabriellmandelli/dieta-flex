import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HistoricData } from '../historic/historic.model';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoricService {

  constructor(private afFirestore: AngularFirestore, private authService: AuthService) { }

  userId = this.authService.getUser().id

  createHistoric(historicData: HistoricData, result) {
    let returnCreated;

    if (result.length > 0) {
      historicData.id = result[0]["id"]
    }

    if (historicData["id"]) {
      returnCreated = this.afFirestore.collection(`user/${this.userId}/historic`).doc(historicData["id"]).update(historicData)
    } else {
      returnCreated = this.afFirestore.collection(`user/${this.userId}/historic`).add(historicData);
    }

    return returnCreated;
  }

  documentExists(historicData): Observable<any> {
    return this.afFirestore.collection(`user/${this.userId}/historic`, ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      query = query.where("time", "==", historicData.time)

      return query
    })
      .snapshotChanges()
      .pipe(
        map(data => {
          return data.map(action => ({ ...action.payload.doc.data() as any, id: action.payload.doc.id }));
        }),
        take(1)
      )
  }

  getHistoric(): Observable<HistoricData[]> {
    return this.afFirestore.collection(`user/${this.userId}/historic`)
      .snapshotChanges()
      .pipe(
        map(data => {
          return data.map(action => (
            { ...action.payload.doc.data() as HistoricData, id: action.payload.doc.id, timeOrderBy: this.formatDate(action.payload.doc.data()["time"]) } as HistoricData
          ));
        })
      )
  }

  getLastHistoric(): Observable<HistoricData[]> {
    return this.afFirestore.collection(`user/${this.userId}/historic`)
      .snapshotChanges()
      .pipe(
        map(data => {
          return data.map(action => (
            { ...action.payload.doc.data() as HistoricData, id: action.payload.doc.id, timeOrderBy: this.formatDate(action.payload.doc.data()["time"]) } as HistoricData
          ));
        }),
        take(1)
      )
  }

  deleteHistoric(idHistoric: string) {
    return this.afFirestore.collection(`user/${this.userId}/historic`).doc(idHistoric).delete();
  }

  formatDate(date: string) {
    let lDateFormatted = new Date(`${date.substr(6, 4)}-${date.substr(3, 2)}-${date.substr(0, 2)} GMT-0300`)

    return lDateFormatted
  }
}
