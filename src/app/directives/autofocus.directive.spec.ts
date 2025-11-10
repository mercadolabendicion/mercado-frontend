import { AutofocusDirective } from './autofocus.directive';
import { ElementRef } from '@angular/core';

describe('AutofocusDirective', () => {
  it('should create an instance', () => {
    const mockElementRef = new ElementRef({ focus: () => {} });
    const directive = new AutofocusDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });
});
