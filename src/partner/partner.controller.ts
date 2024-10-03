import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PartnerService } from './partner.service';

@Controller('partner')
export class PartnerController {

    constructor(
        private partnerService : PartnerService
    ) {}

    @Post()
    async createPartner(@Body() body: any) {
        return this.partnerService.createPartner(body);
    }

    @Get('/:id')
    async getPartnerById(@Param ('id') id: string) {
        return this.partnerService.findPartner(id);
    }

    @Patch('/:id')
    async updatePartner(@Param ('id') id: string, @Body() body: any) {
        return this.partnerService.updatePartner(id, body);
    }

    @Delete('/:id')
    async deletePartner(@Param ('id') id: string) {
        return this.partnerService.deletePartner(id);
    }
}
