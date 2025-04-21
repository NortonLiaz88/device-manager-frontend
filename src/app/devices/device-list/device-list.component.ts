import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Device } from '../../core/models/device.model';
import { DeviceService } from '../../core/services/device.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss'],
})
export class DeviceListComponent implements OnInit {
  devices: Device[] = [];
  displayedColumns = ['id', 'partNumber', 'color', 'category', 'actions'];

  searchControl = new FormControl('');
  isLoading = false;

  page = 1;
  limit = 10;
  total = 0;

  sortField: 'id' | 'partNumber' | 'color' | 'category' = 'id';
  sortDirection: 'ASC' | 'DESC' = 'ASC';

  constructor(
    private deviceService: DeviceService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.page = 1;
        this.loadData();
      });
  }

  loadData(): void {
    this.isLoading = true;

    this.deviceService
      .getAllPaginated(
        this.page,
        this.limit,
        this.searchControl.value || '',
        this.sortField,
        this.sortDirection
      )
      .subscribe({
        next: (res) => {
          this.devices = res.data;
          this.total = res.total;
          this.limit = res.limit;
          this.page = res.page;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar dispositivos.', 'Fechar', {
            duration: 3000,
          });
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadData();
  }

  onSortChange(event: Sort): void {
    this.sortField = event.active as any;
    this.sortDirection = event.direction.toUpperCase() as 'ASC' | 'DESC';
    this.loadData();
  }

  openDeleteDialog(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: 'Tem certeza que deseja excluir este dispositivo?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deviceService.delete(id).subscribe(() => {
          this.snackBar.open('Dispositivo excluído com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.loadData();
        });
      }
    });
  }
}
