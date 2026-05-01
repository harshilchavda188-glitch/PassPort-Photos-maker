import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  originalImage: string;
  editedImage?: string;
  settings: {
    backgroundColor?: string;
    country?: string;
    width: number;
    height: number;
    unit: 'mm' | 'inch';
    copies?: number;
  };
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalImage: {
      type: String,
      required: true,
    },
    editedImage: {
      type: String,
    },
    settings: {
      backgroundColor: {
        type: String,
        default: '#ffffff',
      },
      country: {
        type: String,
      },
      width: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ['mm', 'inch'],
        default: 'mm',
      },
      copies: {
        type: Number,
        default: 1,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
