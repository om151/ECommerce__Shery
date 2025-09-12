const mongoose = require('mongoose');
const blacklistTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    blacklistedAt: { type: Date, default: Date.now, expires: '24h' } 
});

const BlacklistToken = mongoose.model('BlacklistToken', blacklistTokenSchema);
module.exports = BlacklistToken;