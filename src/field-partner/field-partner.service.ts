import { Injectable, Logger } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-service.abstract';

@Injectable()
export class FieldPartnerService {

    constructor(
        private readonly repository: IDataServices,
    ) { }

    async findFieldPartner(token: string) {
        try {
            const partner = await this.repository.partner.findById(token);

            const fields = await this.repository.fields.findByField('partner', partner);

            return fields;
        } catch (error) {
            Logger.error(`Error while finding field partner: ${error.message}`);
        }
    }

}
