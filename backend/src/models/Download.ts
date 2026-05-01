import mongoose, { Document, Schema } from 'mongoose';

export interface IDownload extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  fileType: 'jpg' | 'png' | 'pdf' | 'zip';
  fileUrl: string;
  downloadedAt: Date;
}

const DownloadSchema = new Schema<IDownload>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    fileType: {
      type: String,
      enum: ['jpg', 'png', 'pdf', 'zip'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    downloadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDownload>('Download', DownloadSchema);
