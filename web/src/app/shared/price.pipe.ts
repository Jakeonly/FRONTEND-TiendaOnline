import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
  standalone: true,
})
export class PricePipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '$0';

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (!Number.isFinite(num)) return '$0';

    return `$${num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }
}
