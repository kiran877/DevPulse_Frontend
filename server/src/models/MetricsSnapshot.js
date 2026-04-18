import mongoose from 'mongoose';

const metricsSnapshotSchema = new mongoose.Schema({
  repoFullName: { type: String, required: true },
  date: { type: Date, required: true },
  deploymentFrequency: { type: Number, default: 0 },
  leadTimeMinutes: { type: Number, default: 0 },
  mttrMinutes: { type: Number, default: 0 },
  changeFailureRate: { type: Number, default: 0 },
  totalPRsMerged: { type: Number, default: 0 },
  totalPushes: { type: Number, default: 0 }
});

metricsSnapshotSchema.index({ repoFullName: 1, date: -1 });

export const MetricsSnapshot = mongoose.model('MetricsSnapshot', metricsSnapshotSchema);
