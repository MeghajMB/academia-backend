export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(
    id: string,
    updateData: Partial<T> | undefined,
    deleteData: { [K in keyof T]?: boolean | 1 } | undefined
  ): Promise<T>;
  delete(id: string): Promise<T | null>;
  countAll(): Promise<number>;
}
