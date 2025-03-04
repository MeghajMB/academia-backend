import { Model, Document } from "mongoose";
import { IRepository } from "./IRepositoryInterface";
import { DatabaseError } from "../../errors/database-error";
import { StatusCode } from "../../enums/statusCode.enum";

export class BaseRepository<T extends Document> implements IRepository<T> {
  constructor(private model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.model.create(data);
    } catch (error) {
      throw new DatabaseError(
        "Database error while creating entity",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw new DatabaseError(
        "Database error while fetching entity by ID",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(): Promise<T[]> {
    try {
      return await this.model.find();
    } catch (error) {
      throw new DatabaseError(
        "Database error while fetching all entities",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const updatedEntity = await this.model.findByIdAndUpdate(id, data, {
        new: true,
      });
      if (!updatedEntity) {
        throw new DatabaseError("Entity not found", StatusCode.NOT_FOUND);
      }
      return updatedEntity;
    } catch (error) {
      throw new DatabaseError(
        "Database error while updating entity",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async delete(id: string): Promise<T | null> {
    try {
      const deletedEntity = await this.model.findByIdAndDelete(id);
      if (!deletedEntity) {
        throw new DatabaseError("Entity not found", StatusCode.NOT_FOUND);
      }
      return deletedEntity;
    } catch (error) {
      throw new DatabaseError(
        "Database error while deleting entity",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
