import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Sort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent {
  categories: Category[] = [];
  displayedColumns = ['id', 'name', 'actions'];
  isLoading = false;

  page = 1;
  limit = 10;
  total = 0;

  search = '';
  sortField: 'id' | 'name' = 'id';
  sortDirection: 'ASC' | 'DESC' = 'ASC';

  searchControl = new FormControl('');

  constructor(
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadData();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value: string | null) => {
        this.search = value ?? ''; // Handle null by defaulting to an empty string
        this.page = 1;
        this.loadData();
      });
  }

  loadData() {
    this.isLoading = true;
    this.categoryService
      .getAllPaginated(
        this.page,
        this.limit,
        this.search,
        this.sortField,
        this.sortDirection ?? 'ASC'
      )
      .subscribe({
        next: (res) => {
          this.categories = res.data;
          this.total = res.total;
          this.limit = res.limit;
          this.page = res.page;
        },
        error: () => {
          this.snackBar.open(
            'Erro ao carregar listagem de categoria!',
            'Fechar',
            { duration: 3000 }
          );
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadData();
  }

  deleteCategory(id: number) {
    this.categoryService.delete(id).subscribe(() => this.loadData());
  }

  openDeleteDialog(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: 'Tem certeza que deseja excluir esta categoria?',
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.categoryService.delete(id).subscribe(() => {
          this.snackBar.open('Categoria excluída com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.loadData(); // recarrega a lista
        });
      }
    });
  }

  applyFilters() {
    this.page = 1; // reinicia a paginação ao filtrar
    this.loadData();
  }

  clearSearch() {
    this.search = '';
    this.searchControl.setValue('');
    this.applyFilters();
  }

  onSortChange(event: Sort) {
    this.sortField = event.active as 'id' | 'name';
    console.log('DIRECTION', event.direction);
    this.sortDirection = event.direction
      ? (event.direction.toUpperCase() as 'ASC' | 'DESC')
      : 'ASC';
    this.page = 1; // reinicia a paginação ao ordenar
    this.loadData();
  }
}
