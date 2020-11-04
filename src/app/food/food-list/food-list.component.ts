import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { FoodService } from '../food.service';
import { debounceTime, map } from 'rxjs/operators';
import { FoodData } from '../food-data.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-food-list',
  templateUrl: './food-list.component.html',
})
export class FoodListComponent implements OnInit {

  public searchControl: FormControl;
  listFood: Observable<FoodData[]>
  listFoodBase: Observable<FoodData[]>

  constructor(
    private FoodService: FoodService,
    private router: Router,
    private toastController: ToastController,
  ) {
    this.searchControl = new FormControl();
  }

  ngOnInit() {
    this.getListFood();

    this.searchControl.valueChanges
      .pipe(debounceTime(700))
      .subscribe(search => {
        this.setFilteredItems(search);
      });
  }

  openEditFood(food: FoodData) {
    this.router.navigate(['food-list/food-add', food])
  }

  async getListFood() {
    this.listFood = this.FoodService.getFood();
    this.listFoodBase = this.listFood;

    if (!this.listFood) {
      const toast = await this.toastController.create({
        message: 'Sem alimentos cadastrados.',
        duration: 4000
      })
      toast.present()
    }
  }

  removeFood(food: FoodData) {
    this.FoodService.deleteFood(food.id)
  }

  setFilteredItems(searchTerm) {

    if (!searchTerm) {
      return this.listFood = this.listFoodBase;
    }

    this.listFood = this.listFoodBase
      .pipe(
        map(listFood => listFood.filter((filtering) => {
          if (filtering.name && searchTerm) {
            return filtering.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
          }
        }))
      );
  }

  ionViewWillEnter() {
    this.getListFood();
  }
}
