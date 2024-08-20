<h1>Hardware Shop Management System</h1>

<h2>Overview</h2>
<p>This application is a comprehensive management system for a hardware shop, providing features for inventory management, sales tracking, purchase management, and financial reporting.</p>

<h2>Features</h2>
<ul>
  <li>User Authentication</li>
  <li>Dashboard with Real-time Updates</li>
  <li>Product Management</li>
  <li>Sales and Purchase Tracking</li>
  <li>Low Stock Alerts</li>
  <li>Tax Reporting</li>
</ul>

<h2>Directory Structure</h2>
<pre>
hardware-shop/
├── .git/
├── .idea/
├── public/
│   ├── favicon.ico.png
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── api.js
│   │   ├── AuthContext.js
│   │   ├── Dashboard.js
│   │   ├── Header.js
│   │   ├── Login.js
│   │   ├── LowStockProducts.js
│   │   ├── ProductForm.js
│   │   ├── ProductList.js
│   │   ├── PurchaseForm.js
│   │   ├── PurchaseHistory.js
│   │   ├── SoldProduct.js
│   │   └── TaxManagement.js
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── reportWebVitals.js
│   └── setupTests.js
├── .gitignore
├── app.py
├── get_directory_structure.py
├── package-lock.json
├── package.json
└── README.md
</pre>

## Requirements

### Backend
- Python 3.7+
- Flask
- Flask-SQLAlchemy
- Flask-CORS
- Flask-JWT-Extended
- Werkzeug
- psycopg2-binary

### Frontend
- Node.js 14+
- React 18+
- Material-UI
- Axios
- React Router DOM

## Installation

### Backend Setup

1. Navigate to the project root directory:
`cd hardware-shop`

2. Create a virtual environment:
`python -m venv venv`

3. Activate the virtual environment:
- On Windows:
`venv\Scripts\activate`
- On macOS and Linux:
`source venv/bin/activate`

4. Install the required Python packages:
`pip install flask flask-sqlalchemy flask-cors flask-jwt-extended werkzeug psycopg2-binary`

5. Set up your PostgreSQL database and update the database URI in `app.py`

### Frontend Setup

1. Make sure you have Node.js installed on your system.

2. Navigate to the project root directory:
`cd hardware-shop`

3. Install the required npm packages:
`npm install`

## Running the Application

1. Start the Flask backend:
- Ensure you're in the project root directory and your virtual environment is activated
- Run the following command:
`python app.py`

- The backend should start running on `http://localhost:5000`

2. Start the React frontend:
- Open a new terminal window
- Navigate to the project root directory
- Run the following command:
`npm start`

- The frontend should start running on `http://localhost:3000`

3. Open your web browser and go to `http://localhost:3000` to use the Hardware Shop Management System.

## Usage

1. Log in using your username and password.
2. The dashboard will display the current month's data.
3. Use the various components to manage products, sales, purchases, and view reports:
 - Dashboard
 - Product List
 - Product Form
 - Purchase Form
 - Purchase History
 - Sales Form
 - Low Stock Products
 - Tax Management

4. Any actions such as selling a product, purchasing a product, or adding an item will immediately reflect in the dashboard.
5. Products with stock quantities below the minimum stock level will be flagged as 'Low Stock'.
6. The tax report will display the tax collected after a product is sold.

## Troubleshooting

- If you encounter any issues with database connections, double-check your credentials in `app.py`.
- Make sure both the backend and frontend servers are running simultaneously.
- Check the console logs in your browser and the terminal running the backend for any error messages.

## Contributing

Contributions are welcome. Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.
