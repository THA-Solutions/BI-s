import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Partner } from "./partner.entity";

@Entity()
export class Fields {
    
    @Column({ nullable: false, primary: true})
    id: string;

    @Column({ nullable: false, primary: true})
    name: string;
    
    @ManyToOne(() => Partner, partner => partner.fields, {nullable: false, onDelete: 'CASCADE',onUpdate: 'CASCADE'})
    @JoinColumn({ name: 'partnerId' }) // Explicitamente define a coluna de FK
    partner: Partner;
}
