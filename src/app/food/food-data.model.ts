export interface FoodData {
    id?: string;
    fat: number;
    calorie: number;
    protein: number;
    carbohydrate: number;
    name: string;
    portion: boolean;
    amount: number;
    food_type: number;
}

export class FoodTypeConst {
    public static readonly PROTEIN = 1
    public static readonly CARBOHYDRATE = 2
    public static readonly FAT = 3
    public static readonly SNACK = 4
  }