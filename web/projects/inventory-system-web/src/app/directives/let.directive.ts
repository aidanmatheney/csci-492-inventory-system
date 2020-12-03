import {Directive, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';

interface LetContext<T> {
  ngLet: T;
}

@Directive({selector: '[ngLet]'})
export class LetDirective<T> implements OnInit {
  // Make sure the template checker knows the type of the context with which the template of this directive will be
  // rendered
  public static ngTemplateContextGuard<T>(directive: LetDirective<T>, context: unknown): context is LetContext<T> {
    return true;
  };

  private readonly context: LetContext<T> = {
    ngLet: undefined!
  };

  @Input() public set ngLet(value: T) {
    this.context.ngLet = value;
  }

  public constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<LetContext<T>>
  ) { }

  public ngOnInit() {
    this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
  }
}
