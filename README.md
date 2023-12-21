
# Booknook

Booknook is a comprehensive e-commerce platform specifically designed for book enthusiasts. This project was born out of a personal interest in books and a desire to delve into full-stack development. It provides a seamless online experience for users to buy and explore a diverse range of books.

## Live Demo

Check out Booknook in action [here](https://booknook.ramzikm.online/).




## Features

- User-friendly product listing page with advanced filtering options.
- Features like shopping cart, wishlist, and order management.
- User wallet system for easy handling of refunds.
- Secure and fast storage of media files using Cloudinary.
- Integrated payment processing with Razorpay.



## Technologies

This application is built using:

- MongoDB
- Express.js
- EJS (Embedded JavaScript Templates)
- Node.js
- Bootstrap for frontend styling


## Installation

#### Prerequisites

- Node.js (v16.20.2)

#### Setting Up

1. Clone the repository: 

```bash
git clone https://github.com/ramzi-km/BookNook.git

```
2. Install dependencies:

```bash
npm install

```
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT`="8000"

`DB_URI`="<your_mongodb_uri>"

`AUTH_EMAIL`="<your_email>"

`AUTH_PASS`="<your_email_password>"

`KEY_ID`="<razorpay_key_id>"

`KEY_SECRET`="<razorpay_key_secret>"

`CLOUDINARY_API_KEY`="<cloudinary_api_key>"

`CLOUDINARY_API_SECRET`="<cloudinary_api_secret>"



## Usage/Examples
1. Start the server:
```bash
npm start
```
2. After installation, access the web application at http://localhost:8000. Explore various book listings, add books to the cart, manage your orders, and much more.
