import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  repoFullName: { type: String, required: true },
  eventType: { type: String, required: true },
  action: String,
  payload: mongoose.Schema.Types.Mixed,
  processedAt: Date,
  sha: String,
  prNumber: Number,
  workflowRunId: Number,
  conclusion: String,
  createdAt: { type: Date, required: true }
});

eventSchema.index({ repoFullName: 1, createdAt: -1 });
eventSchema.index({ repoFullName: 1, sha: 1, eventType: 1 }, { unique: true, sparse: true });

export const Event = mongoose.model('Event', eventSchema);
