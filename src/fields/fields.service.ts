import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/abstract/data-service.abstract';
import { Fields } from 'src/core/entities/fields';

@Injectable()
export class FieldsService {

    constructor(private fieldRepository: IDataServices){}

    private treatFieldsIds(fields: Fields[]): Fields[] {
        fields.forEach(field => {
            let tempFieldIdString = '';
            if (Array.isArray(field.id)) {

                field.id.forEach(currentFieldId => {

                    if (tempFieldIdString === '') {
                        tempFieldIdString += `${currentFieldId}`;
                    } else {
                        tempFieldIdString += `-${currentFieldId}`;
                    }
                    
                });

            }else if (field[field.name]) {
                tempFieldIdString += `${field.id}`;
            } 

            field.id = tempFieldIdString;

        });
        return fields
    }

    splitFieldIds(fields: Fields[]) {
        if(typeof fields === 'string') {
            return (fields as string).split('-');
        }

        const fieldMap = fields.map(field => {
            if (typeof field.id === 'string' && field.id.includes('-')) {
                field.id= field.id.split('-');
            }
            return field;
        });

        return fieldMap;
    }

    async createFields(fields: Fields[]) {
        fields = this.treatFieldsIds(fields);

        return this.fieldRepository.fields.create(fields as any);
    }

    async updateField(id:string,fields: Fields[]) {
        fields = this.treatFieldsIds(fields);
        return this.fieldRepository.fields.update(id,fields as any);
    }
    
    async deleteField(id: string) {
        return this.fieldRepository.fields.delete(id);
    }

}
