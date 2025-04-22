const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  summary: {
    key_points: [String],
    highlights: [String],
    tables: [{
      headers: [String],
      rows: [[String]]
    }]
  },
  error: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  shareToken: String,
  sharedAt: Date,
  shareExpiry: Date,
  tags: [{
    type: String,
    trim: true
  }],
  folder: {
    type: String,
    default: 'root',
    trim: true
  },
  lastAccessed: Date,
  isArchived: {
    type: Boolean,
    default: false
  }
});

// Index for faster queries
documentSchema.index({ user: 1, uploadedAt: -1 });
documentSchema.index({ shareToken: 1 }, { sparse: true });
documentSchema.index({ tags: 1 });
documentSchema.index({ folder: 1 });

// Clean up share token after expiry
documentSchema.methods.cleanupShare = function() {
  if (this.shareExpiry && this.shareExpiry < new Date()) {
    this.shareToken = undefined;
    this.sharedAt = undefined;
    this.shareExpiry = undefined;
    return this.save();
  }
};

// Update last accessed
documentSchema.methods.updateLastAccessed = function() {
  this.lastAccessed = new Date();
  return this.save();
};

// Add tag
documentSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

// Remove tag
documentSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Move to folder
documentSchema.methods.moveToFolder = function(folder) {
  this.folder = folder;
  return this.save();
};

// Archive document
documentSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Unarchive document
documentSchema.methods.unarchive = function() {
  this.isArchived = false;
  return this.save();
};

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;