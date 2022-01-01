const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
	full_name: {
		type: String,
		required: true,
		uppercase: true
	},
	email: {
		type: String,
		required: true
	},
	amount: {
		type: Number,
		required: true
	},
	reference: {
		type: String,
		required: true
	}
});

const Payment = new mongoose.model("Payment", paymentSchema);

module.exports = Payment;
