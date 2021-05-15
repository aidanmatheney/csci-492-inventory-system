import {NgModule} from '@angular/core';

import {LetDirective} from './let.directive';
import {NumberInputDirective} from './number-input.directive';
import {SpinWhileLoadingDirective} from './spin-while-loading.directive';

@NgModule({
  declarations: [
    LetDirective,
    NumberInputDirective,
    SpinWhileLoadingDirective
  ],
  imports: [],
  exports: [
    LetDirective,
    NumberInputDirective,
    SpinWhileLoadingDirective
  ]
})
export class AppDirectivesModule { }
