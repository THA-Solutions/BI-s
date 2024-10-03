import { Body, Controller, Delete, Param, Patch } from '@nestjs/common';
import { FieldsService } from './fields.service';

@Controller('fields')
export class FieldsController {

    constructor(private fieldService : FieldsService) {}

    @Patch('/:id')
    async updateField(@Param('id') id:string,@Body() body: any) {
        return this.fieldService.updateField(id,body); 
    }

    @Delete('/:id')
    async deleteField(@Param ('id') id: string) {
        return this.fieldService.deleteField(id);
    }
}
