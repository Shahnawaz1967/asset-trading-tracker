import mongoose from 'mongoose';

const requestSchema = mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proposedPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'denied'],
    default: 'pending'
  }
});

const Request = mongoose.model('Request', requestSchema);
export default Request;
