import { Logger } from "@nestjs/common";
import { IGenericRepository } from "src/core/abstract/generic-repository";
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';


export class DatabaseGenericRepository<T>
  implements IGenericRepository<T> {
  private _repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this._repository = repository;
  }

  async create(entity: T): Promise<T | T[]> {
    try {
      return await this._repository.save(entity as any);
    } catch (error) {
      Logger.error(`Error: ${error}`);;
    }
  }

  async findById(id: string) {
    try {
      return (await this._repository.findOne({
        where: { id: id },
      } as any).then((data) => {
        if (this.isPresent(data) === false) {
          throw new Error("Entity not found");
        }
        return data;
      })
      
      ) as T;
    } catch (error) {
      Logger.error(`Error: ${error}`);;
    }
  }

  async findAll(relations?: string[]): Promise<T[]> {
    try {
      return await this._repository.find({ relations: relations });
    } catch (error) {
      Logger.error(`Error: ${error}`);;
    }
  }

  async findByField(field: string, value: string): Promise<T[]> {
    try {
      return await this._repository.find({
        where: { [field]: value },
      } as unknown as FindOptionsWhere<T>).then((data) => {
        if (this.isPresent(data[0]) === false) {
          throw new Error("Entity not found");
        }
        return data;
      }
      );
    } catch (error) {
      Logger.error(`Error: ${error}`);;
    }
  }

  async update(id: string, data: T) {
    try {
      await this._repository.update(id, data as any);
      return (await this._repository.findOne({
        where: { id },
      } as FindOneOptions)) as T;
    } catch (error) {
      Logger.error(`Error: ${error}`);;
    }
  }

  delete(id: string): void {
    try {
      this._repository.delete({ id: id } as unknown as FindOptionsWhere<T>);
    } catch (error) {
      Logger.error(`Error: ${error}`);;
    }
  }

  deleteEntity(entity: T): void {
    try {
      return this._repository.delete(entity as FindOptionsWhere<T>) as any;
    } catch (error) {
      Logger.error(`Error: ${error}`);;
    }
  }

  private isPresent(entity: T): boolean {
    if (entity === undefined || entity === null) {
      return false;
    }
    return true;
  }
}
