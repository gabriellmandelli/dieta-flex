import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthData } from './auth-data.model';
import { map } from "rxjs/operators";
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore'
import { Subject, Observable } from 'rxjs';
import { UserProfileData } from '../user-profile/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userCollection: AngularFirestoreCollection<any>;

  private user: UserProfileData;
  userChanged = new Subject<UserProfileData>();

  constructor(
    private afAuth: AngularFireAuth,
    private afFirestore: AngularFirestore
  ) {

    this.userCollection = this.afFirestore.collection('user');
  }

  createuser(user) {
    this.userCollection.add(user);
  }

  registerUser(authData: AuthData) {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
        .then(userData => {
          resolve(userData);

          this.createuser(authData);
        },
          err => reject(err));
    });
  }

  login(authData: AuthData) {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(authData.email, authData.password)
        .then(userData => resolve(userData),
          err => reject(err));
    });
  }

  getAuth() {
    return this.afAuth.authState.pipe(
      map(auth => auth)
    )
  }

  setUser(user: UserProfileData) {
    this.user = user;

    this.userChanged.next(this.user);
  }

  getUser() {
    return this.user;
  }

  retrieveUser(userEmail: string): Observable<UserProfileData[]> {
    return this.afFirestore.collection('user', ref => {
      let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;

      if (userEmail) {
        query = query.where('email', '==', userEmail);
      }

      return query;
    })
      .snapshotChanges()
      .pipe(
        map(data => {
          return data.map(action => ({ id: action.payload.doc.id, ...action.payload.doc.data() as UserProfileData }));
        })
      )
  }

  logout() {
    this.afAuth.auth.signOut().then(() => {
      location.reload();
    });
  }
}
