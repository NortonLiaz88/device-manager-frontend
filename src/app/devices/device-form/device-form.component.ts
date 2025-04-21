import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { DeviceService } from '../../core/services/device.service';

@Component({
  selector: 'app-device-form',
  templateUrl: './device-form.component.html',
  styleUrls: ['./device-form.component.scss'],
})
export class DeviceFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  deviceId?: number;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private deviceService: DeviceService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      partNumber: [null, [Validators.required, Validators.min(1)]],
      color: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{1,16}$/)]],
      categoryId: [null, Validators.required],
    });

    this.categoryService.getAll().subscribe((cats) => (this.categories = cats));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.deviceId = +id;
      this.loadDevice(this.deviceId);
    }
  }

  loadDevice(id: number) {
    this.isLoading = true;
    this.deviceService.getById(id).subscribe({
      next: (device) => this.form.patchValue(device),
      error: () => {
        this.snackBar.open('Dispositivo não encontrado.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/devices']);
      },
      complete: () => (this.isLoading = false),
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const request = this.isEditMode
      ? this.deviceService.update(this.deviceId!, this.form.value)
      : this.deviceService.create(this.form.value);

    request.subscribe({
      next: () => {
        const msg = this.isEditMode ? 'Dispositivo atualizado!' : 'Dispositivo criado!';
        this.snackBar.open(msg, 'Fechar', { duration: 3000 });
        this.router.navigate(['/devices']);
      },
      error: (err) => {
        if (err.status === 409) {
          this.form.get('partNumber')?.setErrors({ conflict: true });
          this.snackBar.open('Este part number já está em uso.', 'Fechar', { duration: 3000 });
        } else {
          this.snackBar.open('Erro ao salvar dispositivo.', 'Fechar', { duration: 3000 });
        }
        this.isSubmitting = false;
      },
      complete: () => (this.isSubmitting = false),
    });
  }
}
