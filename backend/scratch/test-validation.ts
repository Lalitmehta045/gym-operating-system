import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMemberDto } from '../src/members/dto/create-member.dto.js';

async function test() {
  const payload = {
    memberCode: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    gender: 'MALE',
    emergencyContactName: 'Jane',
    emergencyContactPhone: '+91 98765 43210',
    emergencyContactRelation: 'Spouse',
    status: 'ACTIVE',
    heightCm: 175.5,
    source: 'WALK_IN',
    whatsappNumber: '+91 98765 43210',
    dateOfBirth: '2026-07-14'
  };

  const dto = plainToInstance(CreateMemberDto, payload);
  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  
  if (errors.length > 0) {
    console.log(JSON.stringify(errors.map(e => ({ property: e.property, constraints: e.constraints })), null, 2));
  } else {
    console.log('Validation passed!');
  }
}

test();
