import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

const MATERIAL_MODULES = [
  MatButtonModule, MatCardModule, MatInputModule,
  MatFormFieldModule, MatTableModule, MatToolbarModule,
  MatSidenavModule, MatIconModule, MatProgressSpinnerModule,
  MatSnackBarModule, MatDialogModule
];

@NgModule({
  imports: [CommonModule, ...MATERIAL_MODULES],
  exports: [CommonModule, ...MATERIAL_MODULES]
})
export class SharedModule {}
