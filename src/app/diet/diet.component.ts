import { Component, OnInit } from '@angular/core';
import { NewDietService, DietResult, DietAmount } from './new-diet.service';
import { ModalController } from '@ionic/angular';
import { DietModalComponent } from './diet-modal/diet-modal.component';
import { FoodData } from '../food/food-data.model';
import { map, switchMap } from 'rxjs/operators';
import { FoodService } from '../food/food.service';

@Component({
  selector: 'app-diet',
  templateUrl: './diet.component.html',
})
export class DietComponent implements OnInit {

  public dietResult: DietResult[];
  public dietAmount = {} as DietAmount;
  public totalDietAmount = {} as DietAmount;
  public food = [] as FoodData[];
  public foodOriginal = [] as FoodData[];
  public dietReady: boolean = true;
  public dietId: String;

  constructor(
    private foodService: FoodService,
    private dietService: NewDietService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.dietService.getDiet()
      .pipe(
        map(result => {
          if (result[0]) {
            this.dietResult = result[0]["alimentos"];
            this.totalDietAmount = result[0]["detalhes"];
            this.food = result[0]["food"];
            this.dietId = result[0]["id"];

            this.loadDietAmount();
          }
        }),
        switchMap(() => {
          return this.foodService.getFood()
        })
      ).subscribe((result) => {
        result.forEach(result => {
          this.food.forEach(food => {
            if (result["id"] == food.id) {
              this.foodOriginal.push(JSON.parse(JSON.stringify(result)));
            }
          })
        })
      })
  }

  generateDiet() {
    this.dietReady = false;
    this.food = [];
    this.foodOriginal = [];
    this.dietService.generateDiet();

    this.dietService.resultO.subscribe((result) => {
      this.dietResult = result as DietResult[];

      this.loadDietAmount();

      this.totalDietAmount = this.dietService.dietAmount;

      this.dietReady = true;
    });
  }

  loadDietAmount() {
    this.dietAmount.calories = 0;
    this.dietAmount.fat = 0;
    this.dietAmount.protein = 0;
    this.dietAmount.carbohydrate = 0;

    this.dietResult.forEach((food) => {
      this.dietAmount.calories += (food.amount * food.calorie) / 100;
      this.dietAmount.fat += food.fat;
      this.dietAmount.protein += food.protein;
      this.dietAmount.carbohydrate += food.carbohydrate;
    });
  }

  saveDiet() {
    let lDadosSalvar = {
      alimentos: this.dietResult,
      food: this.food,
      detalhes: this.totalDietAmount
    };

    if (this.dietId) {
      lDadosSalvar["id"] = this.dietId
    }

    this.dietService.createDiet(lDadosSalvar)
  }

  openModal() {
    this.presentModal();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: DietModalComponent,
      componentProps: { value: 123 }
    });

    modal.onDidDismiss().then((detail) => {
      if (detail !== null) {
        let lFood: FoodData;

        lFood = detail.data;
        this.food.push(lFood);
        this.foodOriginal.push(JSON.parse(JSON.stringify(lFood)));

        this.dietAmount.calories += lFood.calorie;
        this.dietAmount.fat += lFood.fat;
        this.dietAmount.protein += lFood.protein;
        this.dietAmount.carbohydrate += lFood.carbohydrate;
      }
    });

    return await modal.present();
  }

  changedAmount(event) {
    let lFood: FoodData;
    let lNewFood = {} as FoodData;
    let lNewAmount: number;

    lNewAmount = 0;
    lNewAmount = event.value;

    lFood = event.food;

    this.dietAmount.calories -= lFood.calorie;
    this.dietAmount.fat -= lFood.fat;
    this.dietAmount.protein -= lFood.protein;
    this.dietAmount.carbohydrate -= lFood.carbohydrate;

    lNewFood.calorie = 0;
    lNewFood.fat = 0;
    lNewFood.protein = 0;
    lNewFood.carbohydrate = 0;
    lNewFood.amount = lNewAmount;

    if (lFood.portion) {
      lNewFood.calorie = lNewAmount * this.foodOriginal[event.indice].calorie;
      lNewFood.fat = lNewAmount * this.foodOriginal[event.indice].fat;
      lNewFood.protein = lNewAmount * this.foodOriginal[event.indice].protein;
      lNewFood.carbohydrate = lNewAmount * this.foodOriginal[event.indice].carbohydrate;
    } else {
      lNewFood.calorie = (lNewAmount * this.foodOriginal[event.indice].calorie) / 100;
      lNewFood.fat = (lNewAmount * this.foodOriginal[event.indice].fat) / 100;
      lNewFood.protein = (lNewAmount * this.foodOriginal[event.indice].protein) / 100;
      lNewFood.carbohydrate = (lNewAmount * this.foodOriginal[event.indice].carbohydrate) / 100;
    }

    this.dietAmount.calories += lNewFood.calorie;
    this.dietAmount.fat += lNewFood.fat;
    this.dietAmount.protein += lNewFood.protein;
    this.dietAmount.carbohydrate += lNewFood.carbohydrate;

    this.food[event.indice].calorie = lNewFood.calorie;
    this.food[event.indice].fat = lNewFood.fat;
    this.food[event.indice].protein = lNewFood.protein;
    this.food[event.indice].carbohydrate = lNewFood.carbohydrate;
  }
}
