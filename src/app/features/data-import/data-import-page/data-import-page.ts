import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DataImport } from '../data-import';

@Component({
  selector: 'app-data-import-page',
  imports: [],
  templateUrl: './data-import-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './data-import-page.scss',
})
export class DataImportPage {
  dataImport = inject(DataImport);
  ngOnInit() {}

  onFileSelected(file: any): void {
    console.log(file);
    // this.dataImport.importFromCsTimer(file);
  }

  submitJson(event: any): void {
    const textarea = document.getElementById('jsonInput') as HTMLTextAreaElement;
    if (textarea) {
      try {
        const data = JSON.parse(textarea.value);
        this.dataImport.importFromCsTimer(data);
      } catch (e) {
        console.error('Invalid JSON data', e);
      }
    }
  }
}
