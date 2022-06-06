var mongoose = require("mongoose");
const { DateTime } = require("luxon");

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  message: { type: String, required: true, maxLength: 1000 },
  timestamp: { type: Date, required: true, default: Date.now },
  title: { type: String, required: true, maxLength: 100 },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

MessageSchema.virtual("time").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATETIME_MED);
});

module.exports = mongoose.model("Message", MessageSchema);
