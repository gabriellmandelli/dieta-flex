import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Diet } from './diet-data.model';

@Injectable({
  providedIn: 'root'
})
export class DietService {

  constructor(
    private authService: AuthService,
    private afFirestore: AngularFirestore
  ) { }

  createDiet(diet: Diet) {
    if (diet.id && diet.id != "") {
      return this.afFirestore.collection(`user/${this.authService.getUser().id}/diet`).doc(diet["id"]).update(diet)
    } else {
      return this.afFirestore.collection(`user/${this.authService.getUser().id}/diet`).add(diet);
    }
  }

  getDiet() {
    return this.afFirestore.collection<Diet>(`user/${this.authService.getUser().id}/diet`)
      .snapshotChanges()
      .pipe(
        map(data => {
          return data.map(action => ({...action.payload.doc.data(), id: action.payload.doc.id, dateFormatted: new Date(`${action.payload.doc.data()["date"]} GMT-0300`) }))
            .sort((a, b) => b.dateFormatted.getTime() - a.dateFormatted.getTime());
        })
      )
  }

  getDietByDate(date) {
    return this.afFirestore.collection(`user/${this.authService.getUser().id}/diet`, ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      query = query.where("date", "==", date)

      return query
    })
      .snapshotChanges()
      .pipe(
        map(data => {
          return data.map(action => (
            { ...action.payload.doc.data() as Diet, id: action.payload.doc.id, dateFormatted: new Date(`${action.payload.doc.data()["date"]} GMT-0300`) } as Diet
          ))
        }),
        take(1)
      )
  }

  deleteDiet(dietId) {
    return this.afFirestore.collection(`user/${this.authService.getUser().id}/diet`).doc(dietId).delete();
  }
}