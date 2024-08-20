from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
from sqlalchemy import func, or_
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from decimal import Decimal
from sqlalchemy.exc import SQLAlchemyError

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:admin123@localhost:5432/hardware_shop'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)
jwt = JWTManager(app)


# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Product(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    purchase_price = db.Column(db.Float, nullable=False)
    selling_price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False)
    gst_rate = db.Column(db.Float, nullable=False)
    min_stock_level = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(50), nullable=False)


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(50), db.ForeignKey('product.id'), nullable=False)
    transaction_type = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    final_price = db.Column(db.Float, nullable=False)
    gst_amount = db.Column(db.Float, nullable=False)
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    supplier = db.Column(db.String(100))  # For purchases


class GSTRate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    rate = db.Column(db.Float, nullable=False)


# Create tables
with app.app_context():
    db.create_all()


# Routes
@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=username)
        return jsonify(token=access_token), 200
    return jsonify({"msg": "Bad username or password"}), 401


@app.route('/api/register', methods=['POST'])
def register():
    username = request.json.get('username', None)
    password = request.json.get('password', None)

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400

    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201


@app.route('/api/products', methods=['GET', 'POST'])
@jwt_required()
def products():
    if request.method == 'GET':
        products = Product.query.all()
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'purchase_price': p.purchase_price,
            'selling_price': p.selling_price,
            'stock_quantity': p.stock_quantity,
            'gst_rate': p.gst_rate,
            'min_stock_level': p.min_stock_level,
            'category': p.category
        } for p in products])
    elif request.method == 'POST':
        data = request.json
        new_product = Product(**data)
        db.session.add(new_product)
        db.session.commit()
        return jsonify({'message': 'Product added successfully'}), 201


@app.route('/api/products/<id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def product(id):
    product = Product.query.get_or_404(id)
    if request.method == 'GET':
        return jsonify({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'purchase_price': product.purchase_price,
            'selling_price': product.selling_price,
            'stock_quantity': product.stock_quantity,
            'gst_rate': product.gst_rate,
            'min_stock_level': product.min_stock_level,
            'category': product.category
        })
    elif request.method == 'PUT':
        data = request.json
        for key, value in data.items():
            setattr(product, key, value)
        db.session.commit()
        return jsonify({'message': 'Product updated successfully'})
    elif request.method == 'DELETE':
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'})


@app.route('/api/products/search', methods=['GET'])
@jwt_required()
def search_products():
    term = request.args.get('term', '')
    products = Product.query.filter(or_(
        Product.name.ilike(f'%{term}%'),
        Product.id.ilike(f'%{term}%')
    )).all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'purchase_price': p.purchase_price,
        'selling_price': p.selling_price,
        'stock_quantity': p.stock_quantity,
        'gst_rate': p.gst_rate,
        'min_stock_level': p.min_stock_level,
        'category': p.category
    } for p in products])


@app.route('/api/transactions', methods=['POST'])
@jwt_required()
def add_transaction():
    data = request.json
    try:
        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({'message': 'Product not found'}), 404

        quantity = int(data['quantity'])
        price = float(data['price'])
        gst_rate = float(product.gst_rate) / 100  # Convert percentage to decimal

        if data['transaction_type'] == 'PURCHASE':
            # Calculate new average purchase price
            old_total_value = product.purchase_price * product.stock_quantity
            new_total_value = price * quantity
            new_total_quantity = product.stock_quantity + quantity

            # Update product
            product.purchase_price = (old_total_value + new_total_value) / new_total_quantity
            product.stock_quantity += quantity

            # Calculate GST and final price
            gst_amount = (price * quantity) * gst_rate
            final_price = (price * quantity) + gst_amount

            # Create transaction
            new_transaction = Transaction(
                product_id=data['product_id'],
                transaction_type='PURCHASE',
                quantity=quantity,
                price=price,
                final_price=final_price,
                gst_amount=gst_amount,
                supplier=data.get('supplier', '')
            )

        elif data['transaction_type'] == 'SELL':
            if product.stock_quantity < quantity:
                return jsonify({'message': 'Insufficient stock'}), 400

            # Update product stock
            product.stock_quantity -= quantity

            # Calculate GST and final price
            gst_amount = (price * quantity) * gst_rate
            final_price = (price * quantity) + gst_amount

            # Create transaction
            new_transaction = Transaction(
                product_id=data['product_id'],
                transaction_type='SELL',
                quantity=quantity,
                price=price,
                final_price=final_price,
                gst_amount=gst_amount
            )

        else:
            return jsonify({'message': 'Invalid transaction type'}), 400

        db.session.add(new_transaction)
        db.session.commit()

        return jsonify({
            'message': 'Transaction added successfully',
            'transaction': {
                'id': new_transaction.id,
                'product_id': new_transaction.product_id,
                'transaction_type': new_transaction.transaction_type,
                'quantity': new_transaction.quantity,
                'price': new_transaction.price,
                'final_price': new_transaction.final_price,
                'gst_amount': new_transaction.gst_amount,
                'transaction_date': new_transaction.transaction_date.isoformat(),
                'supplier': new_transaction.supplier if new_transaction.transaction_type == 'PURCHASE' else None
            },
            'updated_product': {
                'id': product.id,
                'name': product.name,
                'stock_quantity': product.stock_quantity,
                'purchase_price': product.purchase_price if data['transaction_type'] == 'PURCHASE' else None
            }
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 400



@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    # Get the start and end dates from the request
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    print(f"start_date_str: {start_date_str}")
    print(f"end_date_str: {end_date_str}")

    # Validate the presence of date parameters
    if not start_date_str or not end_date_str:
        return jsonify({'error': 'Please provide start_date and end_date parameters'}), 400

    try:
        # Convert to datetime objects and adjust time components
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
        print(f"start_date: {start_date}")
        print(f"end_date: {end_date}")
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    try:
        # Calculate total sales within the date range
        total_sales = db.session.query(func.sum(Transaction.final_price)).filter(
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date,
            Transaction.transaction_type == 'SELL'
        ).scalar() or 0
        # print(f"total_sales: {total_sales}")
        # Calculate total purchases within the date range
        total_purchases = db.session.query(func.sum(Transaction.final_price)).filter(
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date,
            Transaction.transaction_type == 'PURCHASE'
        ).scalar() or 0
        # print(f"total_purchases: {total_purchases}")
        # Calculate profit/loss
        profit_loss = total_sales - total_purchases
        # print(f"profit_loss: {profit_loss}")
        # Count low-stock products
        low_stock_count = Product.query.filter(Product.stock_quantity <= Product.min_stock_level).count()
        # print(f"low_stock_count: {low_stock_count}")
        # Count total number of products
        total_products = Product.query.count()
        # print(f"total_products: {total_products}")
        # Get top-selling products within the date range
        top_selling_products = db.session.query(
            Transaction.product_id,
            func.sum(Transaction.quantity).label('total_quantity'),
            func.sum(Transaction.final_price).label('total_sales')
        ).filter(
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date,
            Transaction.transaction_type == 'SELL'
        ).group_by(Transaction.product_id).order_by(func.sum(Transaction.quantity).desc()).limit(5).all()
        # print(f"top_selling_products: {top_selling_products}")
        # Format top-selling products data
        top_selling_products = [
            {
                'product_id': product.product_id,
                'product_name': Product.query.get(product.product_id).name,
                'total_quantity': product.total_quantity,
                'total_sales': float(product.total_sales)
            }
            for product in top_selling_products
        ]
        # print(f"top_selling_products: {top_selling_products}")
        # Get recent transactions within the date range
        recent_transactions = Transaction.query.filter(
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date
        ).order_by(Transaction.transaction_date.desc()).limit(10).all()

        # Format recent transactions data
        recent_transactions = [
            {
                'id': transaction.id,
                'product_id': transaction.product_id,
                'product_name': Product.query.get(transaction.product_id).name,
                'transaction_type': transaction.transaction_type,
                'quantity': transaction.quantity,
                'final_price': float(transaction.final_price),
                'transaction_date': transaction.transaction_date.isoformat()
            }
            for transaction in recent_transactions
        ]
        # print(f"recent_transactions: {recent_transactions}")
        # Aggregate the dashboard data
        dashboard_data = {
            'total_sales': float(total_sales),
            'total_purchases': float(total_purchases),
            'profit_loss': float(profit_loss),
            'low_stock_count': low_stock_count,
            'total_products': total_products,
            'top_selling_products': top_selling_products,
            'recent_transactions': recent_transactions
        }
        print(f"dashboard_data: {dashboard_data}")
        # Return the dashboard data as JSON response
        return jsonify(dashboard_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tax-rates', methods=['GET', 'POST'])
@jwt_required()
def tax_rates():
    if request.method == 'GET':
        rates = GSTRate.query.all()
        return jsonify([{'id': r.id, 'name': r.name, 'rate': r.rate} for r in rates])
    elif request.method == 'POST':
        data = request.json
        new_rate = GSTRate(name=data['name'], rate=data['rate'])
        db.session.add(new_rate)
        db.session.commit()
        return jsonify({'message': 'GST rate added successfully'}), 201


@app.route('/api/purchases', methods=['GET'])
@jwt_required()
def get_purchases():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    product_id = request.args.get('product_id')

    query = Transaction.query.filter(Transaction.transaction_type == 'PURCHASE')

    if start_date:
        query = query.filter(Transaction.transaction_date >= datetime.strptime(start_date, '%Y-%m-%d'))
    if end_date:
        query = query.filter(Transaction.transaction_date <= datetime.strptime(end_date, '%Y-%m-%d'))
    if product_id:
        query = query.filter(Transaction.product_id == product_id)

    purchases = query.order_by(Transaction.transaction_date.desc()).all()

    return jsonify([{
        'id': p.id,
        'product_id': p.product_id,
        'quantity': p.quantity,
        'price': p.price,
        'final_price': p.final_price,
        'gst_amount': p.gst_amount,
        'transaction_date': p.transaction_date.isoformat(),
        'supplier': p.supplier
    } for p in purchases])

@app.route('/api/low-stock-products', methods=['GET'])
@jwt_required()
def get_low_stock_products():
    low_stock_products = Product.query.filter(Product.stock_quantity <= Product.min_stock_level).all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'stock_quantity': p.stock_quantity,
        'min_stock_level': p.min_stock_level
    } for p in low_stock_products])


@app.route('/api/tax-report', methods=['GET'])
@jwt_required()
def get_tax_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if not start_date or not end_date:
        return jsonify({'error': 'Please provide start_date and end_date parameters'}), 400

    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
        end_date = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    tax_report = db.session.query(
        Product.id,
        Product.name,
        func.sum(Transaction.final_price).label('total_sales'),
        func.sum(Transaction.gst_amount).label('total_tax')
    ).join(Transaction, Product.id == Transaction.product_id
           ).filter(
        Transaction.transaction_date.between(start_date, end_date),
        Transaction.transaction_type == 'SELL'
    ).group_by(Product.id).all()

    return jsonify([{
        'product_id': item.id,
        'product_name': item.name,
        'total_sales': float(item.total_sales),
        'total_tax': float(item.total_tax)
    } for item in tax_report])

if __name__ == '__main__':
    app.run(debug=True)