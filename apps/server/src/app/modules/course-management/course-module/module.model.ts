import mongoose, { Model, Schema } from 'mongoose';
import { IModule } from './module.interface';

const moduleSchema = new Schema<IModule>(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
    },
    moduleNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Auto-increment moduleNumber when creating a new module
moduleSchema.pre('save', async function (next) {
  if (this.isNew && !this.moduleNumber) {
    try {
      const ModuleModel = mongoose.model<IModule>('Module');
      const lastModule = await ModuleModel.findOne(
        { courseId: this.courseId },
        { moduleNumber: 1 },
        { sort: { moduleNumber: -1 } }
      );
      this.moduleNumber = lastModule ? lastModule.moduleNumber + 1 : 1;
    } catch (error) {
      next(error as Error);
    }
  }
  next();
});

// Add indexes for better performance
moduleSchema.index({ courseId: 1 });
moduleSchema.index({ moduleNumber: 1 });
moduleSchema.index({ courseId: 1, moduleNumber: 1 });

const ModuleModel: Model<IModule> = mongoose.model<IModule>('Module', moduleSchema);
export default ModuleModel;