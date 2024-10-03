import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-service.abstract';
import { Partner } from './entities/partner.entity';
import { Fields } from './entities/fields.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseGenericRepository } from './database.generic-repository';
import { In, Repository } from 'typeorm';

@Injectable()
export class DatabaseService implements IDataServices, OnApplicationBootstrap {
    partner: DatabaseGenericRepository<Partner>;
    fields: DatabaseGenericRepository<Fields>;

    constructor(        
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(Fields)
    private readonly fieldsRepository: Repository<Fields>,

    ) {}

    onApplicationBootstrap() {
        this.partner = new DatabaseGenericRepository<Partner>(this.partnerRepository);
        this.fields = new DatabaseGenericRepository<Fields>(this.fieldsRepository);
    }

}
