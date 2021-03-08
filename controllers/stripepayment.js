const stripe = require("stripe")("sk_test_51I3Ye7LcOjlPMdOQf6dBXWL8QZ3wE7kbUL0jqB0jZ6ka9alT7Ay7HGcA2QUbkBOt80os1MTs1nKWHy6TEmbnFpKY00otl0I9kE");
const uuid = require("uuid/v4");

exports.makePayment = (req, res) => {
  const {products, token} = req.body;
  console.log("PRODUCTS". products);

  let amount = 0;
    products.map(product => {
      amount = amount + product.price;
    })
  
    const idempotencyKey = uuid()

    return stripe.customers.create({
      email: token.email,
      source: token.id
    }).then(customer => {
      stripe.charges.create({
        amount: amount*100, 
        currency: 'inr', 
        customer: customer.id, 
        receipt_email: token.email,
        description: "a test account",
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip
          }
        }
      }, {idempotencyKey})
      .then(result => res.status(200).json(result))
      .catch(err => console.log(err));
    })
}