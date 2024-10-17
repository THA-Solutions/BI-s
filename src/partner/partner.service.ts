import { Injectable, Logger } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-service.abstract';
import { Partner } from 'src/database/entities/partner.entity';
import { FieldPartnerService } from 'src/field-partner/field-partner.service';
import { FieldsService } from 'src/fields/fields.service';

@Injectable()
export class PartnerService {

    constructor(
        private fieldsService: FieldsService,
        private fieldPartnerService: FieldPartnerService,
        private repository: IDataServices,
    ) {
    }

    async createPartner(partner: Partner) {
        try {
            let newPartner = null

            newPartner = await this.repository.partner.create({ ...partner, fields: undefined });
            if (partner.fields) {
                partner.fields.forEach(field => {
                    field.partner = newPartner;

                });

                partner.fields = await this.fieldsService.createFields(partner.fields) as any;

                if (!partner.url && partner.brand) {
                    partner.url = `https://${partner.brand.toLowerCase()}.movidesk.com/public/v1/tickets`
                }

            }

            partner.fields = undefined

            return newPartner;
        } catch (error) {
            Logger.error(`Error while creating partner: ${error.message}`);
        }
    }

    async findPartner(token: string) {
        try {
            let partner: any = await this.repository.partner.findById(token);

            if (!partner) {
                throw new Error('Partner not found');
            }

            partner.fields = await this.fieldsService.splitFieldIds(await this.fieldPartnerService.findFieldPartner(token));

            if (!partner.url && partner.brand) {
                partner.url = `https://${partner.brand.toLowerCase()}.movidesk.com/public/v1/tickets`
            }

            return partner;
        } catch (error) {
            Logger.error(`Error while finding partner: ${error.message}`);
        }
    }

    async updatePartner(token: string, partner: Partner) {

        try {
            if (partner.fields) {
                await this.fieldsService.createFields(partner.fields) as any;
            }

            partner.fields = undefined;

            return this.repository.partner.update(token, partner);
        } catch (error) {
            Logger.error(`Error while updating partner: ${error.message}`);
        }
    }

    async deletePartner(token: string) {
        try {

            return this.repository.partner.delete(token);
        } catch (error) {
            Logger.error(`Error while deleting partner: ${error.message}`);
        }
    }


}
