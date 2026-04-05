import { Injectable } from '@angular/core';

export interface Recipe {
  id: number;
  title: string;
  type: 'food' | 'sweet';
  time: number;
  ingredients: string;
  method: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly storageKey = 'my_recipes';

  getRecipes(): Recipe[] {
    const savedRecipes = localStorage.getItem(this.storageKey);

    return savedRecipes ? JSON.parse(savedRecipes) : [];
  }

  addRecipe(recipe: Recipe): void {
    const recipes = this.getRecipes();
    recipes.push(recipe);
    localStorage.setItem(this.storageKey, JSON.stringify(recipes));
  }
}