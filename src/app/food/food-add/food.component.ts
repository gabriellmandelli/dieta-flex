import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodService } from '../food.service';
import { ToastController } from '@ionic/angular';
import { FoodData } from '../food-data.model';

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
})
export class FoodComponent implements OnInit {

  foodForm: FormGroup;
  food: FoodData;
  submitAttempt: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private foodService: FoodService,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.initFoodForm();
  }
  ngOpen() {
    this.initFoodForm();
  }

  private initFoodForm() {

    let lbExisteParam: boolean;

    this.activatedRoute.params.subscribe(params => {
      lbExisteParam = (params.id != undefined)

      this.foodForm = new FormGroup({
        'id': new FormControl(lbExisteParam ? params.id : null),
        'name': new FormControl(lbExisteParam ? params.name : '', Validators.required),
        'calorie': new FormControl(lbExisteParam ? Number.parseInt(params.calorie) : '', Validators.required),
        'carbohydrate': new FormControl(lbExisteParam ? Number.parseInt(params.carbohydrate) : '', Validators.required),
        'protein': new FormControl(lbExisteParam ? Number.parseInt(params.protein) : '', Validators.required),
        'fat': new FormControl(lbExisteParam ? Number.parseInt(params.fat) : '', Validators.required),
        'portion': new FormControl(lbExisteParam ? params.portion : false, Validators.required),
        'food_type': new FormControl(lbExisteParam ? Number.parseInt(params.food_type) : 1, Validators.required),        
      });
    });
  }

  onSubmit() {
    this.submitAttempt = true;
    if (this.foodForm.valid) {
      this.foodService.createFood(this.foodForm.value)
        .then(() => {
          this.router.navigate(['food-list'])
        })
    }
  }

  async presentToast(messageTitle: string) {
    const toast = await this.toastController.create({
      message: messageTitle,
      duration: 2000
    });

    toast.present();
  }
}