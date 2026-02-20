// import { Component, ElementRef, HostListener } from '@angular/core';
// import { FormControl, ReactiveFormsModule } from '@angular/forms';
// import { SearchResult } from '../../interfaces/global.interface';
// import { debounceTime, distinctUntilChanged, of, startWith, switchMap, tap } from 'rxjs';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { PostsService } from '../../services/post/posts.service';

// @Component({
//   selector: 'app-search-bar',
//   standalone: true,
//   imports: [CommonModule, RouterModule, ReactiveFormsModule],
//   templateUrl: './search-bar.component.html',
//   styleUrl: './search-bar.component.scss'
// })
// export class SearchBarComponent {
//   searchControl = new FormControl('');
//   searchResults: SearchResult[] = []; // для мобайлу у вікно пошуку вивести title та category, для десктопу title та desription
//   showDropdown = false;
//   isLoading = false;
//   noResults = false;

//   constructor(
//     private searchService: PostsService,
//     private elementRef: ElementRef) {

//       this.searchControl.valueChanges
//       .pipe(
//         startWith(''),
//         debounceTime(300),
//         distinctUntilChanged(),

//         tap(query => {
//           if (!query || query.trim().length < 2) {
//             this.resetUI();
//           } else {
//             this.isLoading = true;
//           }
//         }),

//         switchMap(query => {
//           if (!query || query.trim().length < 2) {            
//             return of(null);
//           }

//           return this.searchService.searchArticles(query, 3);
//         }),

//         takeUntilDestroyed()
//       )
//       .subscribe(response => {
//         if (!response) {
//           return;
//         }
//         this.searchResults = response.results;
//         this.noResults = response.results.length === 0 && this.searchControl.value!.length > 1;
//         this.showDropdown = response.results.length > 0 || this.noResults;
//         this.isLoading = false;
//       });
//   }

//   private resetUI(): void {
//     this.searchResults = [];
//     this.showDropdown = false;
//     this.noResults = false;
//     this.isLoading = false;
//   }

//   // Закриття дропдауна при кліку поза ним
//   @HostListener('document:click', ['$event'])
//   onClickOutside(event: Event): void {
//     if (!this.elementRef.nativeElement.contains(event.target)) {
//       this.showDropdown = false;
//     }
//   }

//   // Обробка вибору результату
//   selectResult(result: SearchResult): void {
//     console.log('Selected:', result);
//     this.showDropdown = false;
//     // Тут можна додати навігацію або іншу логіку
//   }

//   // Очищення пошуку
//   clearSearch(): void {
//     this.searchControl.setValue('');
//     this.resetUI();
//   }

//   // Запобігаємо закриттю дропдауна при кліку всередині
//   preventClose(event: Event): void {
//     event.stopPropagation();
//   }
// }
