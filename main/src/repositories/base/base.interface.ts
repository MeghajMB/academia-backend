export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(
    id: string,
    updateData: Partial<T> | Record<never, never>,
    deleteData: { [K in keyof T]?: boolean | 1 } | Record<never, never>
  ): Promise<T>;
  delete(id: string): Promise<T | null>;
  countAll(): Promise<number>;
}
