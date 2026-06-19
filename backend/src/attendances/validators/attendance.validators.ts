// ============================================================================
// Attendance Validation Rules - Phase 4A
// ============================================================================

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { AttendanceStatus } from '../enums/attendance.enums.js';

export function IsValidCheckInTime(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidCheckInTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          if (!(value instanceof Date) && typeof value !== 'string')
            return false;
          const date = new Date(value);
          if (isNaN(date.getTime())) return false;
          return date <= new Date();
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Check-in time cannot be in the future';
        },
      },
    });
  };
}

export function IsBeforeCheckOut(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBeforeCheckOut',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as { checkInAt?: unknown };
          if (!obj.checkInAt) return true;

          const checkInAt = new Date(obj.checkInAt as string | number | Date);
          const checkOutAt = new Date(value as string | number | Date);

          if (isNaN(checkOutAt.getTime())) return false;
          return checkOutAt > checkInAt;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Check-out time must be after check-in time';
        },
      },
    });
  };
}

export interface AttendanceValidationRules {
  checkInAt: {
    required: true;
    type: 'date';
    cannotBeFuture: true;
  };
  checkOutAt: {
    optional: true;
    type: 'date';
    mustBeAfterCheckIn: true;
  };
  status: {
    required: true;
    enum: AttendanceStatus;
    default: AttendanceStatus.PRESENT;
  };
  notes: {
    optional: true;
    maxLength: 5000;
    type: 'string';
  };
  memberId: {
    required: true;
    type: 'uuid';
    mustExist: true;
    mustBelongToTenant: true;
  };
  tenantId: {
    required: true;
    type: 'uuid';
    mustExist: true;
  };
}
