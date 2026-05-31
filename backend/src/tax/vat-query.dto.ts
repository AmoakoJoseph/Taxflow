import { registerDecorator, ValidationOptions, ValidationArguments, IsISO8601, IsNotEmpty } from 'class-validator';

// Custom validation decorator to ensure a date is before or equal to another date
export function IsBeforeOrEqual(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isBeforeOrEqual',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (!value || !relatedValue) return true; // Let IsNotEmpty handle existence
          
          const firstDate = new Date(value);
          const secondDate = new Date(relatedValue);
          
          // Check if both dates are valid, and firstDate <= secondDate
          if (isNaN(firstDate.getTime()) || isNaN(secondDate.getTime())) {
            return false;
          }
          return firstDate.getTime() <= secondDate.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be a date before or equal to ${relatedPropertyName}`;
        }
      },
    });
  };
}

export class VatQueryDto {
  @IsNotEmpty({ message: 'startDate is required' })
  @IsISO8601({}, { message: 'startDate must be a valid ISO-8601 date string (e.g. YYYY-MM-DD)' })
  @IsBeforeOrEqual('endDate', { message: 'startDate must be before or equal to endDate' })
  startDate: string;

  @IsNotEmpty({ message: 'endDate is required' })
  @IsISO8601({}, { message: 'endDate must be a valid ISO-8601 date string (e.g. YYYY-MM-DD)' })
  endDate: string;
}
