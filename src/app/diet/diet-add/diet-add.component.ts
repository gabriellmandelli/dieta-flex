import { Component, OnInit } from '@angular/core';
import { Diet } from '../diet-data.model';
import { ModalController, ToastController } from '@ionic/angular';
import { DietModalComponent } from '../diet-modal/diet-modal.component';
import { FoodData } from '../../food/food-data.model';
import { FoodService } from '../../food/food.service';
import { DietService } from '../diet.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-diet',
  templateUrl: './diet-add.component.html',
})
export class DietComponent implements OnInit {

  public diet = {} as Diet
  public generatedDiet: boolean = true;
  public isEditing: boolean = false;
  public dateInvalid = false
  public minSelectableDate

  constructor(
    private router: Router,
    private foodService: FoodService,
    private dietService: DietService,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private toastController: ToastController
  ) { }

  ngOnInit() {

    this.initializeMimDate()

    this.activatedRoute.params.subscribe(params => {
      let date = params.date
      if (date) {
        this.getDietByDate(date)
        this.isEditing = true
      } else {

        this.isEditing = false
        this.initializeDate()
        this.generateDietBalance()
      }
    });
  }

  async generateDietBalance() {
    this.dietService.diet.id = this.diet.id
    this.dietService.diet.date = this.diet.date
    this.dietService.diet.dateFormatted = this.diet.dateFormatted
    this.diet.dietBalance = await this.dietService.generateDietBalance()

    if (!this.diet.foods) {
      this.diet.foods = []
      this.dietService.diet.foods = []
    }
  }

  async generateDietFoods() {
    this.generatedDiet = false;

    this.generatedDiet = await this.dietService.generateDietFoods()

    if (this.generatedDiet) {
      this.diet = this.dietService.diet
    } else {
      this.presentToastInvalidProfile()
    }
  }

  getDietByDate(date) {
    this.dietService.getDietByDate(date).subscribe((result) => {
      if (result[0]) {
        this.diet = result[0]
        this.dietService.diet = result[0]
        this.verifyDateValid()
      } else {
        this.initializeDate()
      }
    })
  }

  async saveDiet() {
    let isDataValid: boolean = true

    const invalidFoods = this.diet.foods.find(({ amount }) => amount == undefined || amount < 0)

    if (invalidFoods) {
      isDataValid = false
    }

    if (isDataValid) {
      this.diet.date = this.diet.date.substr(0, 10)

      if (this.diet.id) {
        await this.dietService.createDiet(this.diet)
      } else {
        const diet = await this.dietService.getDietByDate(this.diet.date).toPromise()

        if (diet && diet.length == 1) {
          this.diet.id = diet[0].id
        } else {
          this.diet.id = ""
        }

        if (!this.diet.dateFormatted) {
          this.diet.dateFormatted = new Date()
        }

        this.dietService.createDiet(this.diet)
      }

      await this.presentToast();

      this.router.navigate(['diet-list']);
    } else {
      await this.presentToastFormInvalid()
    }
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Dados cadastrados com sucesso!',
      duration: 4000
    });
    toast.present();
  }

  async presentToastFormInvalid() {
    const toast = await this.toastController.create({
      message: 'Existem alimentos sem quantidade de gramas/porção informado!',
      duration: 4000
    });
    toast.present();
  }

  async presentToastInvalidProfile() {
    const toast = await this.toastController.create({
      message: 'Não é possível gerar a dieta pois a quantidade calórica diária é menor do que a quantidade de calorias geradas pela quantidade de proteína e gordura diária. Para ser possível gerar a dieta é necessário alterar o objetivo em "Perfil usuário".',
      duration: 4000
    });
    toast.present();
  }

  openModal() {
    this.presentModal();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: DietModalComponent
    });

    modal.onDidDismiss().then((detail) => {
      if (detail !== null) {
        let foodSelected: FoodData;

        foodSelected = detail.data;

        if (foodSelected.portion) {
          foodSelected.amount = 1
        }
        else {
          foodSelected.amount = 100
        }

        this.diet.foods.push(foodSelected)

        this.diet.dietBalance.currentCalories = +this.diet.dietBalance.currentCalories ? this.diet.dietBalance.currentCalories + foodSelected.calorie : foodSelected.calorie
        this.diet.dietBalance.currentFat = +this.diet.dietBalance.currentFat ? this.diet.dietBalance.currentFat + foodSelected.fat : foodSelected.fat
        this.diet.dietBalance.currentProtein = +this.diet.dietBalance.currentProtein ? this.diet.dietBalance.currentProtein + foodSelected.protein : foodSelected.protein
        this.diet.dietBalance.currentCarbohydrate = +this.diet.dietBalance.currentCarbohydrate ? this.diet.dietBalance.currentCarbohydrate + foodSelected.carbohydrate : foodSelected.carbohydrate
      }
    });

    return await modal.present();
  }

  changedAmount(foodChange) {
    let newAmount: number
    let food: FoodData
    let newFood = {} as FoodData
    let baseFood: FoodData

    baseFood = this.foodService.getBaseFood(foodChange.food.id)

    newAmount = foodChange.food.amount

    food = foodChange.food

    this.diet.dietBalance.currentCalories -= food.calorie
    this.diet.dietBalance.currentFat -= food.fat
    this.diet.dietBalance.currentProtein -= food.protein
    this.diet.dietBalance.currentCarbohydrate -= food.carbohydrate

    newFood.amount = newAmount

    if (food.portion) {
      newFood.calorie = newAmount * baseFood.calorie
      newFood.fat = newAmount * baseFood.fat
      newFood.protein = newAmount * baseFood.protein
      newFood.carbohydrate = newAmount * baseFood.carbohydrate
    } else {
      newFood.calorie = (newAmount * baseFood.calorie) / 100
      newFood.fat = (newAmount * baseFood.fat) / 100
      newFood.protein = (newAmount * baseFood.protein) / 100
      newFood.carbohydrate = (newAmount * baseFood.carbohydrate) / 100
    }

    this.diet.dietBalance.currentCalories += newFood.calorie
    this.diet.dietBalance.currentFat += newFood.fat
    this.diet.dietBalance.currentProtein += newFood.protein
    this.diet.dietBalance.currentCarbohydrate += newFood.carbohydrate

    this.diet.foods[foodChange.indice].amount = newFood.amount
    this.diet.foods[foodChange.indice].calorie = newFood.calorie
    this.diet.foods[foodChange.indice].fat = newFood.fat
    this.diet.foods[foodChange.indice].protein = newFood.protein
    this.diet.foods[foodChange.indice].carbohydrate = newFood.carbohydrate
  }

  initializeDate() {
    let dateNow = new Date()
    let lFormattedDate = `${dateNow.getFullYear()}-${('0' + (dateNow.getMonth() + 1)).slice(-2)}-${('0' + dateNow.getDate()).slice(-2)}`

    this.diet.date = lFormattedDate
    this.dietService.diet.date = lFormattedDate
  }

  initializeMimDate() {
    let dateNow = new Date()
    this.minSelectableDate = new Date(dateNow + " GMT-0000").toISOString()
  }

  verifyDateValid() {
    let dateNow = new Date()
    dateNow.setHours(0)
    dateNow.setMinutes(0)
    dateNow.setSeconds(0)
    dateNow.setMilliseconds(0)

    if (this.diet.dateFormatted < dateNow) {
      this.dateInvalid = true
    }
  }

  removeDiet(foodChange) {
    foodChange.food.amount = 0

    this.changedAmount(foodChange)
    this.diet.foods.splice(foodChange.indice, 1)
  }

  ionViewWillLeave() {
    this.diet = {} as Diet;
  }
}
