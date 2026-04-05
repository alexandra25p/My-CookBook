import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';

export type IngredientUnit = 'g' | 'ml' | 'buc';

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: IngredientUnit;
}

export interface Recipe {
  id: number;
  docId?: string;
  title: string;
  type: 'food' | 'sweet';
  time: number;
  ingredients: RecipeIngredient[];
  method: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly storageKey = 'my_recipes';
  private readonly collectionName = 'recipes';
  private readonly recipesSubject = new BehaviorSubject<Recipe[]>([]);
  private readonly useFirebase =
    environment.firebase.enabled &&
    Boolean(environment.firebase.config.projectId) &&
    Boolean(environment.firebase.config.apiKey);

  private readonly firebaseApp?: FirebaseApp;
  private readonly firestore?: Firestore;
  private unsubscribeFirestore?: () => void;

  constructor() {
    if (this.useFirebase) {
      this.firebaseApp = this.getOrInitFirebaseApp(environment.firebase.config);
      this.firestore = getFirestore(this.firebaseApp);
      this.bindCloudRecipes();
      return;
    }

    this.recipesSubject.next(this.getLocalRecipes());
  }

  getRecipesStream(): Observable<Recipe[]> {
    return this.recipesSubject.asObservable();
  }

  getRecipes(): Recipe[] {
    return this.recipesSubject.value;
  }

  async addRecipe(recipe: Recipe): Promise<void> {
    if (this.useFirebase && this.firestore) {
      await addDoc(collection(this.firestore, this.collectionName), this.serializeRecipe(recipe));
      return;
    }

    const recipes = [...this.getLocalRecipes(), recipe];
    localStorage.setItem(this.storageKey, JSON.stringify(recipes));
    this.recipesSubject.next(recipes);
  }

  async updateRecipe(recipe: Recipe): Promise<void> {
    if (this.useFirebase && this.firestore) {
      if (!recipe.docId) {
        throw new Error('Missing Firestore document id.');
      }

      await updateDoc(doc(this.firestore, this.collectionName, recipe.docId), this.serializeRecipe(recipe));
      return;
    }

    const recipes = this.getLocalRecipes().map((existingRecipe) =>
      existingRecipe.id === recipe.id ? recipe : existingRecipe,
    );

    localStorage.setItem(this.storageKey, JSON.stringify(recipes));
    this.recipesSubject.next(recipes);
  }

  async deleteRecipe(recipe: Recipe): Promise<void> {
    if (this.useFirebase && this.firestore) {
      if (!recipe.docId) {
        throw new Error('Missing Firestore document id.');
      }

      await deleteDoc(doc(this.firestore, this.collectionName, recipe.docId));
      return;
    }

    const recipes = this.getLocalRecipes().filter((existingRecipe) => existingRecipe.id !== recipe.id);

    localStorage.setItem(this.storageKey, JSON.stringify(recipes));
    this.recipesSubject.next(recipes);
  }

  private bindCloudRecipes(): void {
    if (!this.firestore) {
      return;
    }

    this.unsubscribeFirestore = onSnapshot(collection(this.firestore, this.collectionName), (snapshot) => {
      const recipes = snapshot.docs
        .map((document) => this.normalizeRecipe(document.data() as Partial<Recipe> & { ingredients?: unknown }, document.id))
        .sort((left, right) => right.id - left.id);

      this.recipesSubject.next(recipes);
    });
  }

  private getLocalRecipes(): Recipe[] {
    const savedRecipes = localStorage.getItem(this.storageKey);

    if (!savedRecipes) {
      return [];
    }

    const parsedRecipes = JSON.parse(savedRecipes) as Array<Partial<Recipe> & { ingredients?: unknown }>;

    return parsedRecipes.map((recipe) => this.normalizeRecipe(recipe));
  }

  private normalizeRecipe(recipe: Partial<Recipe> & { ingredients?: unknown }, docId?: string): Recipe {
    return {
      id: Number(recipe.id ?? Date.now()),
      docId,
      title: String(recipe.title ?? ''),
      type: recipe.type === 'sweet' ? 'sweet' : 'food',
      time: Number(recipe.time ?? 0),
      ingredients: this.normalizeIngredients(recipe.ingredients),
      method: String(recipe.method ?? ''),
      image: String(recipe.image ?? ''),
    };
  }

  private serializeRecipe(recipe: Recipe): Omit<Recipe, 'docId'> {
    const { docId: _docId, ...serializableRecipe } = recipe;

    return serializableRecipe;
  }

  private getOrInitFirebaseApp(config: FirebaseOptions): FirebaseApp {
    return getApps().length > 0 ? getApp() : initializeApp(config);
  }

  private normalizeIngredients(value: unknown): RecipeIngredient[] {
    if (Array.isArray(value)) {
      return value
        .map((ingredient) => {
          if (typeof ingredient !== 'object' || ingredient === null) {
            return null;
          }

          const maybeIngredient = ingredient as Partial<RecipeIngredient>;
          const unit = maybeIngredient.unit;

          return {
            name: String(maybeIngredient.name ?? '').trim(),
            amount: Number(maybeIngredient.amount ?? 0),
            unit: unit === 'g' || unit === 'ml' || unit === 'buc' ? unit : 'buc',
          };
        })
        .filter((ingredient): ingredient is RecipeIngredient => Boolean(ingredient && ingredient.name));
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ name, amount: 0, unit: 'buc' as const }));
    }

    return [];
  }
}