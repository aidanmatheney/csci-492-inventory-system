import {Directive, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';

interface LetContext<T> {
  ngLet: T;
}

@Directive({selector: '[ngLet]'})
export class LetDirective<T> implements OnInit {
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
