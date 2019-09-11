import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { FoodService } from '../food.service';
import { debounceTime, map, take } from 'rxjs/operators';
import { FoodData } from '../food-data.model';

@Component({
  selector: 'app-food-list',
  templateUrl: './food-list.component.html',
})
export class FoodListComponent implements OnInit {

  public searchControl: FormControl;
  listFood: Observable<any[]>
  listFoodBase: Observable<any[]>

  constructor(
    private FoodService: FoodService,
    private router: Router
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

  getListFood() {
    this.listFood = this.FoodService.getFood();
    this.listFoodBase = this.listFood;
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
