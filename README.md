# Group_15_Siddhant
Hey Viewer , Its Siddhant this side ! We are having Super 150 3rd year end term exam in Hackathon Format..We are having group 15 and working under the leadership of ms. akshita saxena
My Role : My Role in this Project is Assigned as a Backend Developer and I am making it using MERN Stack
Commit 1 : Cloned the Repo in my local host
Commit 2 : Started making folders in the following structure

FULL_STACK_END_TERM/

prisma/

wholesale-backend/

migrations/

src/

config/

controllers/

admin.js

auth.js

inventory.js

order.js

product.js

rqf.js

user.js

models/

Credit.js

Inventory.js

Order.js

OrderItem.js

Product.js

Tier.js

User.js

services/

credit.js

inventory.js

invoice.js

pricing.js

app.js

server.js

package.json

.env

.gitignore

package-lock.json

prisma.config.ts

Now , I am using MySQL for Database integration and Pushed the code in my Github

# 🏭 GODOWN - B2B Wholesale Order Management System

**GODOWN** is a comprehensive B2B e-commerce platform designed for wholesale and bulk order management. Built with modern technologies to streamline the wholesale supply chain.

## 🚀 Features

### For Retailers (Buyers)
- ✅ Business registration with GST/Tax ID verification
- ✅ Browse products with wholesale pricing
- ✅ Tiered pricing based on order quantity
- ✅ Minimum Order Quantity (MOQ) enforcement
- ✅ Request for Quote (RFQ) for custom pricing
- ✅ Multiple payment options (Credit/Net 30/Net 60/Pay Now)
- ✅ Quick reorder from previous orders
- ✅ Bulk CSV upload for orders
- ✅ Credit limit tracking and management

### For Wholesalers/Admins
- ✅ Account approval workflow
- ✅ Product and inventory management
- ✅ Dynamic tiered pricing engine
- ✅ Order processing and status tracking
- ✅ Credit limit management per retailer
- ✅ Automated PDF invoice generation
- ✅ RFQ management and quoting
- ✅ Low stock alerts and reports

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Password Security**: bcryptjs
- **PDF Generation**: pdfkit
- **CSV Processing**: csv-parser
- **File Upload**: multer

## 📁 Project Structure

```
godown-backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── auth.js
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── inventory.js
│   │   ├── order.js
│   │   ├── product.js
│   │   ├── rfq.js
│   │   └── user.js
│   ├── services/
│   │   ├── pricing.js
│   │   ├── invoice.js
│   │   └── credit.js
│   ├── app.js
│   └── server.js
├── invoices/
├── uploads/
├── .env
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd godown-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
Create a `.env` file in the root directory and update the values:
```env
DATABASE_URL="mysql://root:password@localhost:3306/godown_db"
JWT_SECRET="your-secret-key"
PORT=5000
```

### Step 4: Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

### Step 5: Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will be running at: `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new retailer
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `POST /api/products/calculate-price` - Calculate tiered price

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `POST /api/orders/bulk-upload` - Bulk upload via CSV
- `POST /api/orders/quick-reorder` - Reorder from history

### Admin
- `GET /api/admin/accounts/pending` - Get pending accounts
- `PATCH /api/admin/accounts/:id/status` - Approve/reject account
- `GET /api/admin/retailers` - Get all retailers
- `PATCH /api/admin/retailers/:id/credit` - Update credit limit
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/:id/status` - Update order status

### Inventory
- `GET /api/inventory` - Get inventory status (Admin)
- `PATCH /api/inventory/:sku` - Update stock (Admin)
- `GET /api/inventory/alerts/low-stock` - Get low stock alerts

### RFQ
- `POST /api/rfq` - Create quote request
- `GET /api/rfq` - Get user RFQs
- `GET /api/rfq/all` - Get all RFQs (Admin)
- `PATCH /api/rfq/:id` - Respond to RFQ (Admin)

### User
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/credit-history` - Get credit history

## 🔐 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@retail.com",
    "password": "test123",
    "businessName": "Test Retail",
    "contactPerson": "John Doe",
    "phone": "1234567890"
  }'
```

## 📊 Database Schema

Key models:
- **User** - Retailers, wholesalers, admins
- **Product** - Products with SKU and pricing
- **Tier** - Tiered pricing rules
- **Order** - Purchase orders
- **OrderItem** - Order line items
- **RFQ** - Quote requests
- **Credit** - Credit transactions
- **Inventory** - Stock tracking

## 🚀 Deployment

### Production Checklist
- [ ] Update `.env` with production values
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Set up reverse proxy (nginx)
- [ ] Configure rate limiting
- [ ] Set up automated backups
- [ ] Configure logging
- [ ] Use PM2 for process management

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

## 📝 License

MIT License

## 📧 Support

For support, email: support@godown.com

---

**Built with ❤️ for B2B Commerce**
