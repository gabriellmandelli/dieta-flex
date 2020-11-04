import { Injectable } from '@angular/core'
import { UserProfileGoalConst, ExerciseIntensityConst } from './diet-constants'
import { AuthService } from 'src/app/auth/auth.service'
import { FoodService } from 'src/app/food/food.service'
import { Diet, DietBalance, DietFood } from './../diet-data.model'
import { UserProfileData } from 'src/app/user-profile/user-profile.model'
import { FoodTypeConst } from 'src/app/food/food-data.model'

@Injectable({
  providedIn: 'root'
})
export class DietProcess {
  public diet = {} as Diet
  private userProfile: UserProfileData

  constructor(
    private foodService: FoodService,
    private authService: AuthService
  ) { }

  async generateDietBalance(): Promise<DietBalance> {
    let lGoal: number = 0
    let lBasalMetabolicRate: number = 0
    let lIntensityExercise: number = 0

    let dietBalance = {} as DietBalance

    const MALE = 1

    this.userProfile = this.authService.getUser()

    if (this.userProfile.gender == MALE) {
      lBasalMetabolicRate = (10 * this.userProfile.weight) + (6.25 * this.userProfile.height) - (5 * this.userProfile.age) + 5
    } else {
      lBasalMetabolicRate = (10 * this.userProfile.weight) + (6.25 * this.userProfile.height) - (5 * this.userProfile.age) - 161
    }

    switch (this.userProfile.exercise_intensity) {
      case ExerciseIntensityConst.SEDENTARY:
        lIntensityExercise = 1.2
        break

      case ExerciseIntensityConst.SLIGHTLY_ACTIVE:
        lIntensityExercise = 1.375
        break

      case ExerciseIntensityConst.MODERATELY_ACTIVE:
        lIntensityExercise = 1.55
        break

      case ExerciseIntensityConst.VERY_ACTIVE:
        lIntensityExercise = 1.725
        break

      case ExerciseIntensityConst.EXTREMELY_ACTIVE:
        lIntensityExercise = 1.9
        break
    }

    switch (this.userProfile.goal) {
      case UserProfileGoalConst.AGGRESSIVE_WEIGHT_LOSS:
        lGoal -= 400

        break

      case UserProfileGoalConst.LOSE_WEIGHT:
        lGoal -= 250
        break

      case UserProfileGoalConst.DRY_EARNINGS:
        lGoal += 150
        break

      case UserProfileGoalConst.AGGRESSIVE_GAINS:
        lGoal += 300
        break
    }

    dietBalance.totalDayCalories = (lBasalMetabolicRate * lIntensityExercise) + lGoal
    dietBalance.totalDayProtein = this.userProfile.weight * 1.5
    dietBalance.totalDayFat = this.userProfile.weight

    dietBalance.totalDayCarbohydrate = (dietBalance.totalDayCalories - ((dietBalance.totalDayProtein * 4) + (dietBalance.totalDayFat * 9))) / 4

    this.diet.dietBalance = dietBalance

    return dietBalance
  }

  async generateDietFoods(): Promise<boolean> {
    let generatedDiet: boolean = true

    if (this.diet.dietBalance.totalDayCarbohydrate < 0) {
      generatedDiet = false
    }

    if (generatedDiet) {
      await this.getFood(FoodTypeConst.PROTEIN)
      await this.getFood(FoodTypeConst.CARBOHYDRATE)
      await this.getFood(FoodTypeConst.FAT)
      await this.getFood(FoodTypeConst.SNACK)
      await this.getFood(FoodTypeConst.PROTEIN)
      await this.getFood(FoodTypeConst.CARBOHYDRATE)

      this.loadCurrentBalance()
    }

    return generatedDiet
  }

  async getFood(foodType: number) {
    const food = await this.foodService.getFoodByType(foodType).toPromise()

    if (food.length > 0) {

      let lRandom: number
      let foodResult = {} as DietFood

      lRandom = Math.floor(Math.random() * food.length)

      foodResult = food[lRandom]

      if (foodResult.portion) {
        foodResult.amount = 1
      } else {
        switch (foodType) {
          case FoodTypeConst.PROTEIN:
            foodResult.amount = Math.round((100 * (0.15 * this.diet.dietBalance.totalDayProtein)) / foodResult.protein)

            break
          case FoodTypeConst.CARBOHYDRATE:
            foodResult.amount = Math.round((100 * (0.15 * this.diet.dietBalance.totalDayCarbohydrate)) / foodResult.carbohydrate)

            break

          case FoodTypeConst.FAT:
            foodResult.amount = Math.round((100 * (0.25 * this.diet.dietBalance.totalDayFat)) / foodResult.fat)

            break

          case FoodTypeConst.SNACK:
            foodResult.amount = Math.round((100 * (0.08 * this.diet.dietBalance.totalDayCalories)) / foodResult.calorie)
            break

        }

        this.calculateFoodProperties(foodResult)
      }

      this.diet.foods.push(JSON.parse(JSON.stringify(foodResult)))
    }
  }

  private calculateFoodProperties(food: DietFood): DietFood {
    food.calorie = (food.amount * food.calorie) / 100
    food.fat = (food.amount * food.fat) / 100
    food.protein = (food.amount * food.protein) / 100
    food.carbohydrate = (food.amount * food.carbohydrate) / 100

    return food
  }

  loadCurrentBalance() {
    this.diet.dietBalance.currentCalories = 0
    this.diet.dietBalance.currentFat = 0
    this.diet.dietBalance.currentProtein = 0
    this.diet.dietBalance.currentCarbohydrate = 0

    this.diet.foods.forEach((food) => {
      this.diet.dietBalance.currentCalories = +this.diet.dietBalance.currentCalories ? this.diet.dietBalance.currentCalories + food.calorie : food.calorie
      this.diet.dietBalance.currentFat = +this.diet.dietBalance.currentFat ? this.diet.dietBalance.currentFat + food.fat : food.fat
      this.diet.dietBalance.currentProtein = this.diet.dietBalance.currentProtein = +this.diet.dietBalance.currentProtein ? this.diet.dietBalance.currentProtein + food.protein : food.protein
      this.diet.dietBalance.currentCarbohydrate = this.diet.dietBalance.currentCarbohydrate = +this.diet.dietBalance.currentCarbohydrate ? this.diet.dietBalance.currentCarbohydrate + food.carbohydrate : food.carbohydrate
    });
  }
}