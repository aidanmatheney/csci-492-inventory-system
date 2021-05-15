import {Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';

import {recordSetOf} from '../utils/record';

// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
const specialKeys = recordSetOf([
  // Whitespace
  'Enter',
  'Tab',

  // Navigation
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',

  // Editing
  'Backspace',
  'Clear',
  'Copy',
  'Cut',
  'Delete',
  'Insert',
  'Paste',
  'Redo',
  'Undo',

  // UI
  'Escape'
]);

export interface NumberInputSettings {
  unsigned?: boolean;
  integral?: boolean;
}

@Directive({selector: 'input[type="number"][inventorySystemNumberInput]'})
export class NumberInputDirective implements OnInit {
  @Input('inventorySystemNumberInput') public settings?: NumberInputSettings;

  public constructor(
    private readonly elementRef: ElementRef<HTMLInputElement>
  ) { }

  public ngOnInit() { }

  @HostListener('keydown', ['$event'])
  public handleKeyDown(event: KeyboardEvent) {
    if (
      /\d/.test(event.key)
      || (event.key === '-' && this.settings?.unsigned !== true)
      || (event.key === '.' && this.settings?.integral !== true)
      || event.key in specialKeys
      || event.ctrlKey
      || event.metaKey
    ) {
      return;
    }

    event.preventDefault();
  }

  @HostListener('input')
  public handleInput() {
    if (
      this.settings?.unsigned === true
      && Number(this.elementRef.nativeElement.value) < 0
    ) {
      this.elementRef.nativeElement.value = '0';
    } else if (
      this.settings?.integral === true
      && !Number.isInteger(Number(this.elementRef.nativeElement.value))
    ) {
      this.elementRef.nativeElement.value = String(Math.round(Number(this.elementRef.nativeElement.value)));
    }
  }

  @HostListener('paste', ['$event'])
  public handlePaste(event: ClipboardEvent) {
    event.preventDefault();

    if (event.clipboardData == null) {
      return;
    }

    const pastedText = event.clipboardData.getData('text/plain');
    const sanitizedText = pastedText.replace(this.disallowedCharactersRegex, '');
    document.execCommand('insertText', false, sanitizedText);
  }

  @HostListener('drop', ['$event'])
  public handleDrop(event: DragEvent) {
    event.preventDefault();

    if (event.dataTransfer == null) {
      return;
    }

    const droppedText = event.dataTransfer.getData('text/plain');
    const sanitizedText = droppedText.replace(this.disallowedCharactersRegex, '');
    this.elementRef.nativeElement.focus();
    document.execCommand('insertText', false, sanitizedText);
  }

  private get disallowedCharactersRegex() {
    if (this.settings?.unsigned === true && this.settings?.integral === true) {
      return /\D/g;
    }
    if (this.settings?.unsigned === true) {
      return /[^0-9.]/g;
    }
    if (this.settings?.integral === true) {
      return /[^0-9-]/g;
    }
    return /[^0-9.-]/g;
  }
}
