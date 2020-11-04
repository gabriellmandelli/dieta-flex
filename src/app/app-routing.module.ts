import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { UserProfileComponent } from './user-profile/user-profile-add/user-profile.component';
import { DietComponent } from './diet/diet-add/diet-add.component';
import { TipsAddComponent } from './tips/tips-add/tips-add.component';
import { FoodComponent } from './food/food-add/food.component';
import { TipsListComponent } from './tips/tips-list/tips-list.component';
import { FoodListComponent } from './food/food-list/food-list.component';
import { HistoricListComponent } from './historic/historic-list/historic-list.component';
import { HistoricAddComponent } from './historic/historic-add/historic-add.component';
import { DietListComponent } from './diet/diet-list/diet-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule', canActivate: [AuthGuard] },
  { path: 'user-profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'diet-list/diet-add', component: DietComponent, canActivate: [AuthGuard] },
  { path: 'diet-list', component: DietListComponent, canActivate: [AuthGuard] },
  { path: 'food-list', component: FoodListComponent, canActivate: [AuthGuard] },
  { path: 'food-list/food-add', component: FoodComponent, canActivate: [AuthGuard] },
  { path: 'historic-list', component: HistoricListComponent, canActivate: [AuthGuard] },
  { path: 'historic-list/historic-add', component: HistoricAddComponent, canActivate: [AuthGuard] },
  { path: 'tips-list/tips-add', component: TipsAddComponent, canActivate: [AuthGuard] },
  { path: 'tips-list', component: TipsListComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  providers: [
    AuthGuard
  ]
})
export class AppRoutingModule { }