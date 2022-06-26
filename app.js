const express = require("express");
const paypal = require("paypal-rest-sdk");
const dotenv = require('dotenv');
const bodyparser = require('body-parser');

const PORT = process.env.PORT || 3000;
const app = express();
dotenv.config();
app.use(require("body-parser").json());
app.set("view engine", "ejs");

paypal.configure({
    mode: "sandbox",
    client_id: process.env.clientId,
    client_secret: process.env.secretId,
});



app.get("/", (req, res) => {
    res.render("home");
})

app.get('/success', (req, res) => {
    res.render('success');
})

app.get('/failure', (req, res) => {
    res.render('failure');
})

app.post("/pay", (req, res) => {
    const create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal",
        },
        redirect_urls: {
            return_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
        },
        transactions: [{
            item_list: {
                items: [{
                    name: "Red Sox Hat",
                    sku: "001",
                    price: "100",
                    currency: "USD",
                    quantity: 1,
                }, ],
            },
            amount: {
                currency: "USD",
                total: "100",
            },
            description: "Hat for the best team ever",
        }, ],
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});

app.get("/success", (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        payer_id: payerId,
        transactions: [{
            amount: {
                currency: "USD",
                total: "100",
            },
        }, ],
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            //console.log(JSON.stringify(payment));
            res.redirect("/success");
        }
    });
});

app.get("/cancel", (req, res) => res.redirect("/cancel"));

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));