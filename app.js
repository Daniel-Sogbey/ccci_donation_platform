require("dotenv").config();
require("./config/mongoose");
const path = require("path");
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const pug = require("pug");
const _ = require("lodash");
const Payment = require("./models/payment");
const { initializePayment, verifyPayment } = require("./config/paystack")(
	request
);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, `public/`)));
app.set(`view engine`, pug);

app.get("/", (req, res) => {
	res.render(`index.pug`);
});

app.post("/paystack/pay", (req, res) => {
	const form = _.pick(req.body, [`amount`, `email`, `full_name`]);

	form.metadata = {
		full_name: form.full_name
	};
	form.amount *= 100;
	initializePayment(form, (error, body) => {
		if (error) {
			console.log(error, "-----------ERROR----------");
			return;
		}
		let response = JSON.parse(body);

		//{Implementation in borla app ??Borla App ===> pass ref to verify function}

		res.redirect(response.data.authorization_url);
	});
});

app.get("/paystack/callback", (req, res) => {
	const ref = req.query.reference;

	verifyPayment(ref, (error, body) => {
		if (error) {
			console.log(error);
			return res.redirect("/error");
		}

		console.log(body, "BODY RETURNED");

		let response = JSON.parse(body);

		const data = _.at(response.data, [
			"reference",
			"amount",
			"customer.email",
			"metadata.full_name"
		]);

		[reference, amount, email, full_name] = data;

		newPayment = { reference, amount, email, full_name };

		const payment = new Payment(newPayment);

		payment
			.save()
			.then(payment => {
				if (payment) {
					res.redirect("/receipt/" + payment._id);
				}
			})
			.catch(e => {
				console.log(
					e,
					"---------------------ERROR----------------------------"
				);
				res.redirect("/error");
			});
	});
});

app.get("/receipt/:id", (req, res) => {
	const id = req.params.id;
	console.log(id, "receipt/:id");
	Payment.findById(id)
		.then(payment => {
			if (!payment) {
				res.redirect("/error");
			}
			res.render("success.pug", { payment });
		})
		.catch(e => {
			res.redirect("/error");
		});
});

app.get("/error", (req, res) => {
	res.render("error.pug");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server ON, port ${PORT}`));
