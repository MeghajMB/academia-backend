import { Model, Document, Types } from "mongoose";
import { IRepository } from "./base.interface";
import { DatabaseError } from "../../util/errors/database-error";
import { StatusCode } from "../../enums/status-code.enum";

export abstract class BaseRepository<T extends Document>
  implements IRepository<T>
{
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.log(error);
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
      console.log(error);
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

  async update(
    id: string,
    updateData: Partial<T> | Record<never, never>,
    deleteData: { [K in keyof T]?: boolean | 1 } | Record<never, never>
  ): Promise<T> {
    try {
      const updatedEntity = await this.model
        .findByIdAndUpdate(
          id,
          { $set: updateData, $unset: deleteData },
          {
            new: true,
          }
        )
        .lean<T & { _id: Types.ObjectId }>();
      if (!updatedEntity) {
        throw new DatabaseError("Entity not found", StatusCode.NOT_FOUND);
      }
      return updatedEntity;
    } catch (error) {
      console.log(error);
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
  async countAll(): Promise<number> {
    try {
      const entityCount = await this.model.countDocuments();
      return entityCount;
    } catch (error) {
      throw new DatabaseError(
        "Database error while deleting entity",
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
