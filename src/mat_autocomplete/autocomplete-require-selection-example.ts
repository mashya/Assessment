import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  Observable,
  debounceTime,
  delay,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from 'rxjs';


@Component({
  selector: 'autocomplete-require-selection-example',
  templateUrl: 'autocomplete-require-selection-example.html',
  styleUrl: 'autocomplete-require-selection-example.css',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
})
export class AutocompleteRequireSelectionExample {
  options$: Observable<string[]>;
  myControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(10),
  ]);
  lastInput = '';
  lastTime = 0;
  ngOnInit() {
    this.options$ = this.myControl.valueChanges.pipe(
      // Trim leading/trailing whitespace and ignore empty strings

      map((value) => value?.trim()),
      // // Debounce to avoid excessive requests
      debounceTime(300),
      // // Only proceed if input has changed or 300ms have passed since last emission
      distinctUntilChanged(
        (x, y) => x === y && Date.now() - this.lastTime >= 300
      ),
      // // Filter based on minimum input length
      map((value) => (value != undefined && value?.length >= 3 ? value : '')),
      // // Clear options if input length is less than 3
      switchMap((value) => {
        if (value) {
          console.log('value eneted', value);
          this.lastInput = value;
          this.lastTime = Date.now();
          return this.slowResponse(value);
        } else {
          return of([]);
        }
      })
    );
  }
  displayError() {
    if (this.myControl.hasError('required')) {
      return 'Value is required';
    } else if (this.myControl.hasError('maxlength')) {
      return 'Maximum length is 10 characters';
    }
    return '';
  }

  slowResponse(value: string): Observable<string[]> {
    return of(value ? [value + '1', value + '2', value + '3'] : []).pipe(
      delay(3000)
    );
  }
}

