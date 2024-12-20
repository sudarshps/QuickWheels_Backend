import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

class BaseRepository<T extends Document> {
    private model: Model<T>;

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

    async updateOne(query: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
        return await this.model.findOneAndUpdate(query, update, { new: true }).exec();
    }

    async deleteOne(query: FilterQuery<T>): Promise<T | null> {
        return await this.model.findOneAndDelete(query).exec();
    }
}

export default BaseRepository;
