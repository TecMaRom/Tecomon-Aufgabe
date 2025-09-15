import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWidget extends Document {
  _id: Types.ObjectId;
  location: string;
  createdAt: Date;
}

const widgetSchema: Schema = new Schema({
  location: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Widget = mongoose.model<IWidget>("Widget", widgetSchema);

export default Widget;
