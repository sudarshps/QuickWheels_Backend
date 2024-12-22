import { Model, Document, FilterQuery, UpdateQuery,Types,QueryOptions,Query } from 'mongoose';

class BaseRepository<T extends Document> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(data: Partial<T>): Promise<T> {
        const document = new this.model(data);
        return await document.save();
    }

    async findOne(query: FilterQuery<T>): Promise<T | null> {
        return await this.model.findOne(query).exec();
    }

    async find(query: FilterQuery<T>): Promise<T[]> {
        return await this.model.find(query).exec();
    }

    async findByIdAndUpdate(
        id: string | Types.ObjectId,
        updateData: UpdateQuery<T>,
        options: { new?: boolean; upsert?: boolean; lean?: boolean } = { new: true }
      ): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, updateData, options).exec();
      }

      async findById(id:string | Types.ObjectId):Promise<T | null> {
        return this.model.findById(id)
      }

    async updateOne(query: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
        return await this.model.findOneAndUpdate(query, update, { new: true }).exec();
    }

    async deleteOne(query: FilterQuery<T>): Promise<T | null> {
        return await this.model.findOneAndDelete(query).exec();
    }
    async findByIdAndDelete(
        id:string | Types.ObjectId
    ):Promise<T | null>{
        return await this.model.findByIdAndDelete(id).exec()
    }

    async findOneAndUpdate(
        filter: FilterQuery<T>,
        update: UpdateQuery<T>,
        options: QueryOptions = { new: true }
      ): Promise<T | null> {
        const result = await this.model.findOneAndUpdate(filter, update, options).exec();
        return result as T | null; 
      }
}

export default BaseRepository;
