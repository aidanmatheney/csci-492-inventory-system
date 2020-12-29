import {ComponentFactoryResolver, Directive, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';

import {Destroyed$} from '../services/destroyed$.service';

import {LoadingSpinnerComponent} from '../components/loading-spinner/loading-spinner.component';

@Directive({selector: '[inventorySystemSpinWhileLoading]'})
export class SpinWhileLoadingDirective implements OnInit {
  private readonly loading$ = new BehaviorSubject<boolean>(undefined!);
  @Input('inventorySystemSpinWhileLoading') public set loading(value: boolean) {
    this.loading$.next(value);
  }

  public constructor(
    private readonly viewContainer: ViewContainerRef,
    private readonly template: TemplateRef<void>,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly destroyed$: Destroyed$
  ) { }

  public ngOnInit() {
    const loadingSpinnerComponentFactory = (
      this.componentFactoryResolver.resolveComponentFactory(LoadingSpinnerComponent)
    );
    this.loading$.pipe(
      switchMap(loading => new Observable<void>(() => {
        if (loading) {
          this.viewContainer.createComponent(loadingSpinnerComponentFactory);
        } else {
          this.viewContainer.createEmbeddedView(this.template);
        }

        return () => this.viewContainer.clear();
      })),
      takeUntil(this.destroyed$)
    ).subscribe();
  }
}
