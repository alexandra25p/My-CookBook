import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Recipe, RecipeService } from '../recipe.service';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly recipeService = inject(RecipeService);
  private readonly formBuilder = inject(FormBuilder);

  protected recipes: Recipe[] = this.recipeService.getRecipes();
  protected imagePreview = '';

  protected readonly recipeForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    type: this.formBuilder.nonNullable.control<Recipe['type']>('food', [Validators.required]),
    time: [15, [Validators.required, Validators.min(1)]],
    ingredients: ['', [Validators.required, Validators.minLength(5)]],
    method: ['', [Validators.required, Validators.minLength(20)]],
    image: ['', [Validators.required]],
  });

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

  protected saveRecipe(): void {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    const formValue = this.recipeForm.getRawValue();

    this.recipeService.addRecipe({
      id: Date.now(),
      title: formValue.title.trim(),
      type: formValue.type,
      time: formValue.time,
      ingredients: formValue.ingredients.trim(),
      method: formValue.method.trim(),
      image: formValue.image,
    });

    this.recipes = this.recipeService.getRecipes();
    this.recipeForm.reset({
      title: '',
      type: 'food',
      time: 15,
      ingredients: '',
      method: '',
      image: '',
    });
    this.imagePreview = '';
  }
}
