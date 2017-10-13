import {Pipe, PipeTransform} from '@angular/core';

/*
 * Changes a number into a comma separated string.
 */

@Pipe({ name: 'convertNumber', pure: false })
export class ConvertNumberPipe implements PipeTransform {
    transform(input:string, length: number): string{
        return input.length > 0 ? input.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '';
    }
}