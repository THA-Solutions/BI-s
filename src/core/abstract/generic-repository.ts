export abstract class IGenericRepository<T> {
    abstract create(entity: T): Promise<T | T[]>;
  
    abstract update(id: string, entity: T): Promise<T>;
  
    abstract delete(id: string): void;
  
    abstract deleteEntity(entity: T): void;
  
    abstract findAll(relations?: string[]): Promise<T[]>;
  
    abstract findById(id: string): Promise<T>;
  
    abstract findByField(field: string, value: any): Promise<T[]>;
  }
  