import { Test, TestingModule } from '@nestjs/testing';
import { FieldPartnerService } from './field-partner.service';

describe('FieldPartnerService', () => {
  let service: FieldPartnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldPartnerService],
    }).compile();

    service = module.get<FieldPartnerService>(FieldPartnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
