import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true },
  username: { type: String, required: true },
  email: String,
  avatarUrl: String,
  accessToken: String,
  connectedRepos: [String],
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
