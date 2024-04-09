function order(selectedPaymentMethod, selectedAddressid) {
    const dataa = {
        paymethod: selectedPaymentMethod.value,
        addressid: selectedAddressid
    };

    if (selectedPaymentMethod.value === 'cod') {
        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataa),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // Show the success popup
            console.log('1232344')
            
            showSuccessPopup();


        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else if (selectedPaymentMethod.value === 'razorpay') {
 
            initializeRazorpay(dataa);
       
  } 
  else {
    alert('Please select a payment method, address, and ensure the total price is available');
  }
}

const checkoutpay = async (req, res) => {
  try {
      const { addressid, paymethod } = req.body;
      console.log(req.body);
      const userId = req.session.user;

      // Assuming you have a User model with an 'addresses' field
      const User = await user.findById(userId).select('addresses wallet');

      const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price');

      if (!cart) {
          return res.status(404).json({ error: 'Cart not found' });
      }
      
      const items = cart.items;
      console.log(items)
      const total = cart.totalPrice;
      
       
      const orderItems = items.map(item => ({
          product: item.product._id, // Assuming product._id is the ObjectId
          quantity: item.quantity,
          unitPrice: item.unitPrice,
      }));

      if (!user) {
          // Handle case where user is not found
          return res.status(404).json({ error: 'User not found' });
      }
      
      // Find the selected address based on addressid
      const selectedAddress = User.addresses.find(address => address._id == addressid);
      if (!selectedAddress) {
          return res.status(404).json({ error: 'Selected address not found' });
      }



        const couponId = cart.couponused.couponid;
        const coupon = await Coupon.findById(couponId);

      //   if (!coupon) {
      //       return res.status(404).json({ error: 'Coupon not found' });
      //   }

        // Use coupon percentage in your order
        const orderDiscount = {
            disamnt: cart.couponused.discount_amount,
            percent: !coupon ? 0 : coupon.discount,

        };

      if(paymethod=='wallet'){
          User.wallet.balance -= total
          User.wallet.transactions.push({
           amount: -parseInt(total),
           description: 'Deducted from Wallet', 
           date: new Date(),
       });
      }
      User.save()
      console.log('Order created successfully:');

      const order = new Order({
          user: userId,
          items: orderItems, // You need to add items to the order based on the user's cart or other logic
          shippingAddress: {
              addresstype:selectedAddress.addresstype,
              houseName: selectedAddress.houseName,
              street: selectedAddress.street,
              city: selectedAddress.city,
              state: selectedAddress.state,
              country: selectedAddress.country,
              zipCode: selectedAddress.zipCode,
          },
          // disamnt : cart.couponused.discount_amount,
          discount : orderDiscount , 
          paymentMethod: paymethod,
          totalPrice: total,
      });

      const savedOrder = await order.save();
      
      await Cart.findOneAndDelete({ user: userId });

      
      console.log('Order created successfully:', savedOrder);

      
      const products = items.map(item => ({
          item: item.product._id,
          quantity: item.quantity
      }));
      console.log(products)
      for (const orderItem of products) {
          const item = await product.findById(orderItem.item);
           console.log(item)
          if (!item) {
              console.error("Product not found with ID:" `${orderItem.product}`);
              continue; 
          }
          item.stock -= orderItem.quantity;
          await item.save();
      }


      res.status(200).json({ message: 'Order created successfully', order: savedOrder });
  } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};
////////////////////////////////

function initializeRazorpay(dataa) {
  const totalprice = totalPrice/10
  console.log(totalprice);
  // Fetch the order ID from your server
  fetch('/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: 200, currency: 'INR' }), // Adjust amount and currency as needed
  })
  .then(response => response.json())
  .then(data => {
    const options = {
      key:  'rzp_test_JkT3o5VYOxKgH3', // Replace with your Razorpay key
      amount: data.amount,
      currency: 'INR',
      name: 'A-Store',
      description: 'Test Transaction',
      image: 'https://example.com/your_logo',
      order_id: data.orderId,
      handler: function (response) {
        // Handle successful payment
        console.log('Payment successful! Payment ID:', response.razorpay_payment_id);
        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataa),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // Show the success popup
            console.log('1232344')


        })
        .catch(error => {
            console.error('Error:', error);
        });
        // You can perform additional actions here, such as updating your database
        showSuccessPopup();

        // Show success popup or redirect to a success page
        // alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
      },
      prefill: {
        name: 'Akhil',
        email: 'akhil@example.com',
        contact: '9000090000'
      },
      notes: {
        address: 'Razorpay Corporate Office'
      },
      theme: {
        color: '#3399cc'
      } 
    };


    const rzp = new Razorpay(options);
    
    // Open the Razorpay payment modal when the radio button is selected
    rzp.open();

  })
  .catch(error => {
    console.error('Error:', error);
  });
}


function showSuccessPopup() {
    Swal.fire({
        title: 'Order Placed Successfully!',
        text: 'What would you like to do next?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'View Orders',
        cancelButtonText: 'Continue Shopping'
    }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/profile';
        } else {
            window.location.href = '/'; 
              
        }
    });
}

const checkoutForm = document.getElementById('ord');
checkoutForm.addEventListener('submit', proceedToPayment);
// anandhu

let orderId;
    let price = document.getElementById('price')
    let orderprice = price.getAttribute('data-totalprice')
    // let orderprice = 700

    $(document).ready(function () {
      console.log('here ajx');
      var settings = {
        "url": "/create/orderId",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify({
          "amount": orderprice
        }),
      };

      //creates new orderId everytime
      $.ajax(settings).done(function (response) {
        orderId = response.orderId;
        orderprice = response.orderprice; // Assign response.orderprice to orderprice
        ordresignature = response.signature
        console.log(orderId);
        $("#razorpayBtn").show();
      });
    });

    document.getElementById('razorpayBtn').onclick = function (e) {
      
      console.log('hre the click');
      var options = {
        "key": "rzp_test_rEnMoJdll9h6tI",
        "amount": orderprice,
        "currency": "INR",
        "name": "POLAR",
        "description": "Online Payment",
        "image": "",
        "order_id": orderId,
        "handler": function (response) {
          // Create a form dynamically
          var form = document.createElement('form');
          form.method = 'post';
          form.action = '/order2ForRazorPay';  // Replace with the URL you want to redirect to
          // Create an input element to hold the payment ID
          var paymentIdInput = document.createElement('input');
          paymentIdInput.type = 'hidden';
          paymentIdInput.name = 'razorpay_payment_id';
          paymentIdInput.value = response.razorpay_payment_id;
          // Add the input element to the form
          form.appendChild(paymentIdInput);
          // Add hidden input fields for payment mode and address details

          var paymentModeInput = document.createElement('input');
          paymentModeInput.type = 'hidden';
          paymentModeInput.name = 'paymentMethod';
          // paymentModeInput.value = document.getElementById('paymentMethodSelect').value; // Assumes the payment mode is selected through a dropdown
          // form.appendChild(paymentModeInput);

          var addressSelector = document.getElementById('addressSelector')
          var selectedAddressValue = addressSelector.value;
          var addressIdInput = document.createElement('input');
            addressIdInput.type = 'hidden';
            addressIdInput.name = 'address';
            addressIdInput.value = selectedAddressValue; // This line needs to be changed
            form.appendChild(addressIdInput);


          // Append the form to the body
          document.body.appendChild(form);      // Submit the form
          form.submit();
        }
      };
      var rzp1 = new Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        alert(response.error.code);
        // alert(response.error.description);
        // alert(response.error.source);
        // alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
      });
      rzp1.open();
      e.preventDefault();
    }