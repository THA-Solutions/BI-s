import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Partner } from "./partner.entity";


@Entity()
export class Fields {
    
    @Column({ nullable: false, primary: true})
    id: string;

    @Column({ nullable: false, primary: true})
    name: string;
    
    @ManyToOne(() => Partner, partner => partner.id, {nullable: false, onDelete: 'CASCADE'})
    partner: Partner;
}