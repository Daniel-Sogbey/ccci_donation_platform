const mongoose = require("mongoose");

// const url = "mongodb://localhost:27017/OnlinePaymentDB";
const url = process.env.MONGODB_REMOTE_URL;

const options = {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: true
};

mongoose
	.connect(url, options)
	.then(() => {
		console.log("database connected successfully");
	})
	.catch(error => console.log("ERROR-----------------", error));
