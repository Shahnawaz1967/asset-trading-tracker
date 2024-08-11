import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentHolder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tradingJourney: [
    {
      holder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default:Date.now},
    },
  ],
}, {
  // timestamps: true,
});

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;

