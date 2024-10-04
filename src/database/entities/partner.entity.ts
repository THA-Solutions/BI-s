import { Column, Entity, OneToMany } from "typeorm";
import { Fields } from "./fields.entity";

@Entity()
export class Partner {
    @Column({name:"brandName", nullable: false})
    brand: string;

    @Column({nullable: false, primary: true})
    id: string;

    @Column({ nullable: false})
    url: string;

    @Column({ nullable: false, length: 1000})
    urlFields: string;

    @OneToMany(() => Fields, field => field.partner, {onUpdate: 'CASCADE', onDelete: 'CASCADE'})
    fields: Fields[];

    @Column({ nullable: true})
    lastTicketsUpdateDate : string
}