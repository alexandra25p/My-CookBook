import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { IngredientUnit, Recipe, RecipeIngredient, RecipeService } from '../recipe.service';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly recipeService = inject(RecipeService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly ownerAccessStorageKey = 'owner_access_unlocked';
  private readonly ownerAccessCode = 'alexandra-cookbook-2026';

  protected readonly recipes$ = this.recipeService.getRecipesStream();
  protected readonly featuredRecipe$ = this.recipes$.pipe(
    map((recipes) => this.pickWeeklyRecipe(recipes)),
  );
  protected featuredRecipePreview: Recipe | null = null;
  protected imagePreview = '';
  protected ingredientsList: RecipeIngredient[] = [];
  protected ingredientsTouched = false;
  protected ownerAccessError = '';
  protected hasOwnerAccess = false;
  protected showOwnerAccessPanel = false;
  protected readonly ingredientUnits: IngredientUnit[] = ['g', 'ml', 'buc'];
  protected readonly kitchenNotes = [
    {
      title: 'Kitchen Note of the Week',
      text: 'Cook and bake with love. Everything is sweeter when you make it for the ones you love. Even a simple dish feels special when it carries care, patience, and joy from your kitchen.',
    },
    {
      title: 'Kitchen Note of the Week',
      text: 'Prep first, cook second. Organizing your ingredients before turning on the heat makes everything smoother and less stressful. A tidy start gives you more focus, better timing, and cleaner flavors.',
    },
    {
      title: 'Kitchen Note of the Week',
      text: 'Balance matters. If a recipe feels flat, add a squeeze of lemon or a small splash of vinegar for brightness. Tiny adjustments near the end can wake up the entire plate.',
    },
    {
      title: 'Kitchen Note of the Week',
      text: 'Let hot dishes rest for a minute before serving. Flavors settle, sauces thicken naturally, and textures improve more than you might expect. A short pause often makes the final result feel restaurant-ready.',
    },
  ];
  protected readonly activeKitchenNote = this.kitchenNotes[new Date().getDay() % this.kitchenNotes.length];

  protected readonly recipeForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    type: this.formBuilder.nonNullable.control<Recipe['type']>('food', [Validators.required]),
    time: [15, [Validators.required, Validators.min(1)]],
    method: ['', [Validators.required, Validators.minLength(20)]],
    image: ['', [Validators.required]],
  });

  protected readonly ingredientForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    amount: [100, [Validators.required, Validators.min(1)]],
    unit: this.formBuilder.nonNullable.control<IngredientUnit>('g', [Validators.required]),
  });

  protected readonly ownerAccessForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required]],
  });

  constructor() {
    this.hasOwnerAccess = sessionStorage.getItem(this.ownerAccessStorageKey) === '1';
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.imagePreview = '';
      this.recipeForm.controls.image.setValue('');
      this.recipeForm.controls.image.markAsTouched();
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = String(reader.result ?? '');
      this.imagePreview = imageData;
      this.recipeForm.controls.image.setValue(imageData);
      this.recipeForm.controls.image.markAsDirty();
      this.recipeForm.controls.image.updateValueAndValidity();
    };

    reader.readAsDataURL(file);
  }

  protected async saveRecipe(): Promise<void> {
    this.ingredientsTouched = true;

    if (this.recipeForm.invalid || this.ingredientsList.length === 0) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    const formValue = this.recipeForm.getRawValue();

    await this.recipeService.addRecipe({
      id: Date.now(),
      title: formValue.title.trim(),
      type: formValue.type,
      time: formValue.time,
      ingredients: this.ingredientsList,
      method: formValue.method.trim(),
      image: formValue.image,
    });

    this.recipeForm.reset({
      title: '',
      type: 'food',
      time: 15,
      method: '',
      image: '',
    });
    this.ingredientForm.reset({
      name: '',
      amount: 100,
      unit: 'g',
    });
    this.ingredientsList = [];
    this.ingredientsTouched = false;
    this.imagePreview = '';
  }

  protected addIngredient(): void {
    if (this.ingredientForm.invalid) {
      this.ingredientForm.markAllAsTouched();
      return;
    }

    const value = this.ingredientForm.getRawValue();

    this.ingredientsList = [
      ...this.ingredientsList,
      {
        name: value.name.trim(),
        amount: value.amount,
        unit: value.unit,
      },
    ];

    this.ingredientsTouched = true;
    this.ingredientForm.reset({
      name: '',
      amount: 100,
      unit: 'g',
    });
  }

  protected removeIngredient(index: number): void {
    this.ingredientsList = this.ingredientsList.filter((_, listIndex) => listIndex !== index);
  }

  protected unlockOwnerAccess(): void {
    if (this.ownerAccessForm.invalid) {
      this.ownerAccessForm.markAllAsTouched();
      return;
    }

    const inputCode = this.ownerAccessForm.controls.code.value.trim();

    if (inputCode !== this.ownerAccessCode) {
      this.ownerAccessError = 'Invalid access code.';
      return;
    }

    this.hasOwnerAccess = true;
    this.showOwnerAccessPanel = false;
    this.ownerAccessError = '';
    sessionStorage.setItem(this.ownerAccessStorageKey, '1');
    this.ownerAccessForm.reset({ code: '' });
  }

  protected openOwnerAccessPanel(): void {
    this.showOwnerAccessPanel = true;
    this.ownerAccessError = '';
  }

  protected closeOwnerAccessPanel(): void {
    this.showOwnerAccessPanel = false;
    this.ownerAccessError = '';
    this.ownerAccessForm.reset({ code: '' });
  }

  protected lockOwnerAccess(): void {
    this.hasOwnerAccess = false;
    this.showOwnerAccessPanel = false;
    this.ownerAccessError = '';
    this.ownerAccessForm.reset({ code: '' });
    sessionStorage.removeItem(this.ownerAccessStorageKey);
  }

  protected showFeaturedRecipe(recipe: Recipe): void {
    this.featuredRecipePreview = recipe;
  }

  protected closeFeaturedRecipe(): void {
    this.featuredRecipePreview = null;
  }

  private pickWeeklyRecipe(recipes: Recipe[]): Recipe | null {
    if (recipes.length === 0) {
      return null;
    }

    const currentDate = new Date();
    const weekOfYear = this.getWeekOfYear(currentDate);
    const seed = currentDate.getFullYear() * 100 + weekOfYear;
    const pseudoRandom = (seed * 9301 + 49297) % 233280;
    const recipeIndex = pseudoRandom % recipes.length;

    return recipes[recipeIndex];
  }

  private getWeekOfYear(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const elapsedDays = Math.floor((date.getTime() - firstDay.getTime()) / 86400000);

    return Math.ceil((elapsedDays + firstDay.getDay() + 1) / 7);
  }
}
