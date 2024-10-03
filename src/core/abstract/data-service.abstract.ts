import { Partner } from "src/database/entities/partner.entity"
import { Fields } from "src/database/entities/fields.entity"
import { IGenericRepository } from "./generic-repository"

export abstract class IDataServices {
    abstract partner : IGenericRepository<Partner>;
    abstract fields : IGenericRepository<Fields>;
  }
  