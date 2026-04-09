import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'shortenPrefix',
  standalone: true // Use true if you are using Standalone Components
})
export class ShortenPrefixPipe implements PipeTransform {

  transform(value: number | string, limit: number = 5): string {
    if (!value) return '';

    const stringValue = value.toString();

    // If the number is shorter than the limit, just return it
    if (stringValue.length <= limit) {
      return stringValue;
    }

    // Truncate and add the prefix
    return '...' + stringValue.substring(stringValue.length - limit);
  }
}
