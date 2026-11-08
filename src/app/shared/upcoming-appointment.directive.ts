import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({ selector: '[appUpcomingAppointment]' })
export class UpcomingAppointmentDirective implements OnChanges {
  @Input('appUpcomingAppointment') appointmentDate = '';

  constructor(
    private readonly element: ElementRef<HTMLElement>, 
    private readonly renderer: Renderer2) {}

  ngOnChanges(): void {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const date = new Date(`${this.appointmentDate}T00:00:00`);
    const daysAway = Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
    if (daysAway >= 0 && daysAway <= 1) this.renderer.addClass(this.element.nativeElement, 'appointment-soon');
    else this.renderer.removeClass(this.element.nativeElement, 'appointment-soon');
  }
}
