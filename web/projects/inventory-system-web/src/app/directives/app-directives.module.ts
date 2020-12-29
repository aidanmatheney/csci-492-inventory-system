import {NgModule} from '@angular/core';

import {LetDirective} from './let.directive';
import {SpinWhileLoadingDirective} from './spin-while-loading.directive';

@NgModule({
  declarations: [
    LetDirective,
    SpinWhileLoadingDirective
  ],
  imports: [],
  exports: [
    LetDirective,
    SpinWhileLoadingDirective
  ]
})
export class AppDirectivesModule { }
