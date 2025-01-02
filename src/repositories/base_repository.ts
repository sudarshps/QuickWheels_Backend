import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  Types,
  QueryOptions,
} from "mongoose";

class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      console.error("error in creating entity:", error);
      throw error;
    }
  }

  async findOne(query: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(query).exec();
    } catch (error) {
      console.error("error in finding one entity:", error);
      throw error;
    }
  }

  async find(query: FilterQuery<T>): Promise<T[]> {
    try {
      return await this.model.find(query).exec();
    } catch (error) {
      console.error("error in finding entity:", error);
      throw error;
    }
  }

  async findAll(): Promise<T[]> {
    try {
      return await this.model.find();
    } catch (error) {
      console.error("error in finding all entity:", error);
      throw error;
    }
  }

  async findByIdAndUpdate(
    id: string | Types.ObjectId,
    updateData: UpdateQuery<T>,
    options: { new?: boolean; upsert?: boolean; lean?: boolean } = { new: true }
  ): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, updateData, options).exec();
    } catch (error) {
      console.error("error in finding by id and update entity:", error);
      throw error;
    }
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    try {
      return this.model.findById(id);
    } catch (error) {
      console.error("error in finding by id entity:", error);
      throw error;
    }
  }

  async updateOne(
    query: FilterQuery<T>,
    update: UpdateQuery<T>
  ): Promise<T | null> {
    try {
      return await this.model
        .findOneAndUpdate(query, update, { new: true })
        .exec();
    } catch (error) {
      console.error("error in update one entity:", error);
      throw error;
    }
  }

  async deleteOne(query: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOneAndDelete(query).exec();
    } catch (error) {
      console.error("error in delete one entity:", error);
      throw error;
    }
  }
  async findByIdAndDelete(id: string | Types.ObjectId): Promise<T | null> {
    try {
      return await this.model.findByIdAndDelete(id).exec();
    } catch (error) {
      console.error("error in findbyidanddelete entity:", error);
      throw error;
    }
  }

  async findOneAndUpdate(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: QueryOptions = { new: true }
  ): Promise<T | null> {
    try {
      const result = await this.model
        .findOneAndUpdate(filter, update, options)
        .exec();
      return result as T | null;
    } catch (error) {
      console.error("error in findoneandupdate:", error);
      throw error;
    }
  }
}

export default BaseRepository;
