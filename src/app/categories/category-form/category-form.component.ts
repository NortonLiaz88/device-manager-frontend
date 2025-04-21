import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(128)]],
  });

  isEditMode = false;
  categoryId?: number;

  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.categoryId = +id;
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadCategory(id: number) {
    this.isLoading = true;
    this.categoryService.getById(this.categoryId!).subscribe({
      next: (category) => this.form.patchValue(category),
      error: (err) => {
        if (err.status === 404) {
          this.snackBar.open('Categoria não encontrada.', 'Fechar', {
            duration: 3000,
            panelClass: 'error-snackbar',
          });
          this.router.navigate(['/categories']);
        }
      },
      complete: () => (this.isLoading = false),
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;

    const request = this.isEditMode
      ? this.categoryService.update(this.categoryId!, {
          name: this.form.value.name!,
        })
      : this.categoryService.create({
          name: this.form.value.name!,
        });

    request.subscribe({
      next: () => {
        this.snackBar.open(
          `Categoria ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso!`,
          'Fechar',
          { duration: 3000 }
        );
        this.router.navigate(['/categories']);
      },
      error: (err) => {
        if (err.status === 409) {
          this.snackBar.open(
            'Já existe uma categoria com esse nome.',
            'Fechar',
            { duration: 3000, panelClass: 'error-snackbar' }
          );
          this.form.get('name')?.setErrors({ conflict: true });
        } else {
          this.snackBar.open('Erro ao salvar categoria.', 'Fechar', {
            duration: 3000,
            panelClass: 'error-snackbar',
          });
        }
        this.isSubmitting = false;
      },
      complete: () => (this.isSubmitting = false),
    });
  }
}
