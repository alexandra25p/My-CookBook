import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Recipe, RecipeIngredient, RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-modal',
  imports: [],
  templateUrl: './recipe-modal.html',
  styleUrl: './recipe-modal.css',
})
export class RecipeModal {
  private readonly ownerAccessCode = 'alexandra-cookbook-2026';
  private readonly recipeService = inject(RecipeService);

  private _recipe: Recipe | null = null;

  protected editingRecipe: Recipe | null = null;
  protected editOwnerCode = '';
  protected editError = '';

  @Output() close = new EventEmitter<void>();

  @Input() set recipe(value: Recipe | null) {
    this._recipe = value;
    this.editingRecipe = null;
    this.editOwnerCode = '';
    this.editError = '';
  }

  get recipe(): Recipe | null {
    return this._recipe;
  }

  protected closeModal(): void {
    this.close.emit();
  }

  protected beginEditRecipe(): void {
    const recipe = this.recipe;

    if (!recipe || !this.requireOwnerCode('edit')) {
      return;
    }

    this.editingRecipe = this.cloneRecipe(recipe);
    this.editOwnerCode = '';
    this.editError = '';
  }

  protected async saveEditedRecipe(): Promise<void> {
    const recipe = this.editingRecipe;

    if (!recipe) {
      return;
    }

    if (this.editOwnerCode.trim() !== this.ownerAccessCode) {
      this.editError = 'Invalid owner code.';
      return;
    }

    const updatedRecipe: Recipe = {
      ...recipe,
      title: recipe.title.trim(),
      time: +recipe.time,
      ingredients: recipe.ingredients,
      method: recipe.method.trim(),
    };

    if (!updatedRecipe.title || updatedRecipe.title.length < 3) {
      this.editError = 'Title must be at least 3 characters.';
      return;
    }

    if (!Number.isFinite(updatedRecipe.time) || updatedRecipe.time < 1) {
      this.editError = 'Please enter a valid cooking time.';
      return;
    }

    if (updatedRecipe.ingredients.length === 0) {
      this.editError = 'Add at least one ingredient.';
      return;
    }

    if (updatedRecipe.method.length < 20) {
      this.editError = 'Cooking method must be longer.';
      return;
    }

    await this.recipeService.updateRecipe(updatedRecipe);
    this.recipe = updatedRecipe;
  }

  protected async deleteRecipe(): Promise<void> {
    const recipe = this.recipe;

    if (!recipe || !this.requireOwnerCode('delete')) {
      return;
    }

    if (!confirm(`Delete "${recipe.title}"?`)) {
      return;
    }

    await this.recipeService.deleteRecipe(recipe);
    this.closeModal();
  }

  protected updateEditedIngredient(index: number, field: 'name' | 'amount' | 'unit', value: string): void {
    if (!this.editingRecipe) {
      return;
    }

    const nextIngredients = [...this.editingRecipe.ingredients];

    if (field === 'amount') {
      nextIngredients[index] = {
        ...nextIngredients[index],
        amount: +value,
      };
    } else {
      nextIngredients[index] = {
        ...nextIngredients[index],
        [field]: field === 'unit' ? (value as RecipeIngredient['unit']) : value,
      };
    }

    this.editingRecipe = {
      ...this.editingRecipe,
      ingredients: nextIngredients,
    };
  }

  protected updateEditedTime(value: string): void {
    if (!this.editingRecipe) {
      return;
    }

    this.editingRecipe = {
      ...this.editingRecipe,
      time: +value,
    };
  }

  protected addEditedIngredient(): void {
    if (!this.editingRecipe) {
      return;
    }

    this.editingRecipe = {
      ...this.editingRecipe,
      ingredients: [
        ...this.editingRecipe.ingredients,
        { name: '', amount: 100, unit: 'g' },
      ],
    };
  }

  protected removeEditedIngredient(index: number): void {
    if (!this.editingRecipe) {
      return;
    }

    this.editingRecipe = {
      ...this.editingRecipe,
      ingredients: this.editingRecipe.ingredients.filter((_, listIndex) => listIndex !== index),
    };
  }

  protected cancelEdit(): void {
    this.editingRecipe = null;
    this.editOwnerCode = '';
    this.editError = '';
  }

  private requireOwnerCode(action: 'edit' | 'delete'): boolean {
    const inputCode = prompt(`Enter the owner code to ${action} this recipe:`)?.trim();

    if (inputCode !== this.ownerAccessCode) {
      alert('Invalid owner code.');
      return false;
    }

    return true;
  }

  private cloneRecipe(recipe: Recipe): Recipe {
    return {
      ...recipe,
      ingredients: recipe.ingredients.map((ingredient) => ({ ...ingredient })),
    };
  }
}