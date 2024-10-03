import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-service.abstract';
import { Partner } from 'src/database/entities/partner.entity';
import { FieldPartnerService } from 'src/field-partner/field-partner.service';
import { FieldsService } from 'src/fields/fields.service';

@Injectable()
export class PartnerService {

    constructor(
        private fieldsService: FieldsService,
        private fieldPartnerService: FieldPartnerService,
        private partnerRepository: IDataServices,
    ) {
    }

    async createPartner(partner: Partner) {
        let newPartner = null

        newPartner = await this.partnerRepository.partner.create({...partner,  fields: undefined});
        if (partner.fields) {
            partner.fields.forEach(field => {
            field.partner = newPartner;
            
        });

        partner.fields = await this.fieldsService.createFields(partner.fields) as any;
            
        if(!partner.url && partner.brand){
            partner.url = `https://${partner.brand.toLowerCase()}.movidesk.com/public/v1/tickets`
            }
        
        }

        partner.fields = undefined
        
        return newPartner; 
    }

    async findPartner(token: string) {
        let partner: any = await this.partnerRepository.partner.findById(token);
        
        if (!partner) {
            return null;
        }

        partner.fields = await this.fieldsService.splitFieldIds(await this.fieldPartnerService.findFieldPartner(token));

        return partner;
    }

    async updatePartner(token: string,partner: Partner) {

        if(partner.fields) {
            await this.fieldsService.createFields(partner.fields) as any;
        }

        partner.fields = undefined;

        return this.partnerRepository.partner.update(token,partner);
    }

    async deletePartner(token: string) {

        return this.partnerRepository.partner.delete(token);
    }
    

}
