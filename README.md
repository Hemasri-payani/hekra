# Build Bright

Build a Production-Ready Custom Software Development Website

Act as a senior full-stack software architect, UI/UX designer, backend engineer, database engineer, cybersecurity engineer, and DevOps engineer.

Build a real-time, production-ready Custom Software Development website with a modern, professional interface. This must NOT be a simple static/demo website. Implement a complete frontend, backend, database, authentication, package-selection workflow, payment integration, order management, validation, security, and deployment-ready architecture.

1. PROJECT OBJECTIVE

Create a website where customers can:

Create an account.

Register using Gmail/email or phone number.

Verify their account using OTP/email verification.

Log in securely.

View available custom software development packages.

Select one package.

Enter project/customer details.

Proceed to a secure payment page.

Complete payment.

Receive confirmation of their order.

Track their submitted project/order.

Access their account dashboard.

The website should feel like a real software development company, not a college/demo project.

2. RECOMMENDED TECHNOLOGY STACK

Use modern, stable technologies.

Frontend

React

TypeScript

Next.js if appropriate

Tailwind CSS

shadcn/ui or another professional component library

Responsive design

Form validation using Zod

React Hook Form where useful

Backend

Use a proper server-side architecture.

Preferred:

Next.js server actions/API routes OR

Node.js + Express/NestJS

Implement:

REST APIs or well-structured server actions

Authentication

Authorization

Input validation

Error handling

Logging

Secure API communication

Database

Use:

PostgreSQL

Prefer:

Supabase PostgreSQL OR

another production-ready PostgreSQL provider.

Create properly normalized database tables for:

users

profiles

packages

orders

order_items

payments

project_details

verification_tokens/OTPs

notifications

admin_users

audit_logs

Use foreign keys, indexes, timestamps, constraints, and appropriate relationships.

Authentication

Implement secure authentication with:

Email/Gmail registration

Phone number registration

OTP/email verification

Secure login

Logout

Password hashing

Forgot password

Reset password

Session management

Protected routes

Role-based access control

Never store passwords as plain text.

3. WEBSITE STRUCTURE

Create these major pages:

Public Pages

Home

About Us

Services

Packages

Contact

Login

Create Account

Verification

FAQ

Terms & Conditions

Privacy Policy

Customer Pages

Customer Dashboard

Package Details

Project Details Form

Payment

Payment Success

Payment Failed

Order Details

Order/Project Tracking

Profile

Account Settings

Admin Pages

Admin Login

Admin Dashboard

Customer Management

Package Management

Order Management

Payment Management

Project Management

Notifications

Audit Logs

4. HOME PAGE

Create a premium software-company landing page.

Hero section:

"Build Your Software. Bring Your Idea to Life."

Subheading:

"Professional custom software development solutions designed around your business, ideas, and requirements."

Add clear CTA buttons:

Get Started

View Packages

Contact Us

Include sections for:

Custom Software Development

Web Applications

Mobile Applications

AI/ML Solutions

Database Solutions

Business Automation

Why Choose Us

Development Process

Packages

Customer Reviews

FAQ

Contact

Use professional animations, but don't overdo them.

The website must load quickly.

5. REGISTRATION SYSTEM

Create a professional registration page.

Allow two registration methods:

Method 1 — Email/Gmail

Fields:

Full Name

Email

Phone Number

Password

Confirm Password

After registration:

Account → Email Verification → Login → Dashboard

Send a verification email.

Method 2 — Phone Number

Fields:

Full Name

Phone Number

Password

Confirm Password

After registration:

Account → OTP Verification → Login → Dashboard

Send a one-time verification code.

OTP requirements:

6-digit OTP

Expiration time

Maximum retry attempts

Resend cooldown

Server-side verification

Never expose OTP in frontend code

6. LOGIN PAGE

Create a modern login interface.

Include:

Email/phone

Password

Show/hide password

Remember me

Forgot password

Login button

Create account

Email/Gmail login option

Phone login option

Display clear validation and error messages.

Examples:

Invalid credentials

Account not verified

Too many attempts

Session expired

Do not reveal sensitive authentication information.

7. PACKAGE SYSTEM

Create exactly 5 software development packages.

Prices must start at ₹1,000 and remain below ₹10,000.

Use these initial packages:

Package 1 — Starter

₹1,000

Suitable for:

Simple static website

Basic landing page

Basic UI

Responsive design

Package 2 — Basic

₹2,500

Includes:

Multi-page website

Responsive UI

Contact form

Basic backend

Basic database integration

Package 3 — Professional

₹4,500

Includes:

Dynamic website

Authentication

Database

Admin functionality

API integration

Professional UI

Package 4 — Business

₹7,000

Includes:

Full-stack web application

Authentication

Database

Admin dashboard

API integration

Advanced functionality

Deployment support

Package 5 — Premium

₹9,500

Includes:

Advanced full-stack application

Authentication

Database

Admin dashboard

API integrations

Advanced features

Deployment

Priority support

Make package pricing configurable through the admin panel.

Do NOT hard-code package prices throughout the application.

8. PACKAGE SELECTION WORKFLOW

When the customer clicks:

Choose Package

show a package details page.

Display:

Package name

Price

Features

Estimated development scope

Support information

Select Package button

After selecting:

Package → Project Details → Order Summary → Payment

Do not allow users to bypass required steps.

9. PROJECT DETAILS PAGE

After selecting a package, collect customer requirements.

Fields:

Full Name

Email

Phone

Company/Organization

Project Name

Project Description

Type of Software

Required Platform

Preferred Technologies

Required Features

Expected Delivery Preference

Additional Requirements

Reference Website (optional)

File/document upload (optional)

Validate every field.

Use proper maximum character limits.

Prevent malicious file uploads.

10. ORDER SUMMARY

Before payment, display:

Customer Details

Name

Email

Phone

Selected Package

Package name

Package description

Features

Pricing

Base price

Taxes if applicable

Final amount

Show:

Total Payable Amount

Add:

Edit project details

Change package

Proceed to Payment

The amount displayed to the customer must match the amount sent to the payment provider.

Never trust the payment amount received directly from the frontend.

11. PAYMENT SYSTEM

Integrate a legitimate payment gateway suitable for India.

Prefer:

Razorpay

The backend must create the payment/order.

Flow:

Customer → Backend → Payment Gateway → Payment → Backend Verification → Order Confirmation

Implement:

Payment order creation

Secure checkout

Payment success handling

Payment failure handling

Payment cancellation handling

Server-side payment verification

Payment status storage

Transaction ID storage

Order ID storage

Payment timestamp

Amount verification

Never mark an order as "PAID" merely because the frontend says payment succeeded.

The backend must verify the payment using the payment gateway's secure server-side verification mechanism.

Use environment variables for payment credentials.

Never expose secret keys in frontend code.

12. ORDER MANAGEMENT

After successful payment, automatically create an order.

Generate a unique order ID such as:

CSD-2026-000001

Store:

Order ID

Customer ID

Package ID

Project ID

Payment ID

Amount

Payment status

Order status

Created date

Updated date

Order statuses:

Payment Pending

Payment Successful

Order Confirmed

Requirements Review

Development Started

Development in Progress

Testing

Completed

Cancelled

Customers should be able to see their order status from their dashboard.

13. CUSTOMER DASHBOARD

Create a professional dashboard.

Show:

Welcome section

"Welcome, [Customer Name]"

Statistics

Total Orders

Active Projects

Completed Projects

Total Amount Paid

Recent Orders

Display:

Order ID

Package

Amount

Date

Status

View Details

Project Tracking

Create a visual progress tracker:

Order Confirmed

Requirements Review

Development

Testing

Deployment

Completed

14. ADMIN DASHBOARD

Create a secure admin dashboard.

Admin can:

Customer Management

View customers

Search customers

View customer details

Disable/enable accounts

Package Management

Create package

Edit package

Delete/deactivate package

Change price

Change features

Order Management

View orders

Filter orders

Search order ID

Change project status

View customer requirements

Payment Management

View payment transactions

Payment status

Transaction ID

Amount

Date

Refund status if supported

Project Management

Update project status

Add project notes

Update progress

Analytics

Show:

Total customers

Total orders

Successful payments

Pending payments

Revenue

Active projects

Completed projects

15. DATABASE DESIGN

Create a proper relational database.

Suggested structure:

users

id

name

email

phone

password_hash

email_verified

phone_verified

role

created_at

updated_at

packages

id

name

description

price

features

active

created_at

updated_at

projects

id

user_id

package_id

project_name

description

platform

technologies

required_features

additional_requirements

status

created_at

updated_at

orders

id

order_number

user_id

project_id

package_id

amount

status

created_at

updated_at

payments

id

order_id

gateway

gateway_order_id

gateway_payment_id

amount

status

paid_at

created_at

verification_tokens

id

user_id

token

type

expires_at

attempts

created_at

notifications

id

user_id

title

message

read

created_at

audit_logs

id

user_id

action

entity

entity_id

metadata

created_at

Use proper indexes and foreign-key constraints.

16. SECURITY REQUIREMENTS

Treat security as a priority.

Implement:

HTTPS-ready configuration

Password hashing

Secure sessions

CSRF protection where applicable

XSS protection

SQL injection protection

Input validation

Output sanitization

Rate limiting

Authentication middleware

Authorization middleware

Role-based access control

Secure HTTP headers

Secure cookies

File upload validation

File size restrictions

API validation

Server-side authorization

Never expose:

Database credentials

API secret keys

Payment secret keys

Authentication secrets

OTP secrets

Use .env environment variables.

Provide .env.example.

17. UI/UX DESIGN

Make the website look like a modern professional technology company.

Design requirements:

Clean layout

Professional typography

Modern cards

Smooth animations

Responsive design

Mobile-first approach

Desktop optimization

Accessible buttons

Clear navigation

Loading states

Skeleton loaders

Empty states

Success states

Error states

Toast notifications

Confirmation dialogs

Do NOT make the UI excessively colorful or childish.

Use a consistent design system.

18. RESPONSIVE DESIGN

The website must work correctly on:

Mobile phones

Tablets

Laptops

Desktop monitors

Test:

360px mobile width

768px tablet width

1024px laptop width

1440px desktop width

No horizontal scrolling.

19. ERROR HANDLING

Create proper error handling throughout the application.

Examples:

Invalid login

Email already registered

Phone already registered

Invalid OTP

Expired OTP

Payment failed

Payment verification failed

Database unavailable

Network failure

Unauthorized access

Package unavailable

Invalid project details

Show user-friendly messages.

Do not expose stack traces or sensitive backend information to users.

20. EMAIL AND SMS

Prepare integration for:

Email

Use a reliable transactional email provider.

Send:

Account verification

Password reset

Order confirmation

Payment confirmation

Project status update

SMS/OTP

Use a legitimate SMS/OTP provider for phone verification.

Keep provider credentials in environment variables.

21. NOTIFICATION SYSTEM

Implement notifications for:

Account verification

Successful registration

Payment success

Payment failure

Order confirmation

Project status changes

Show notifications inside the customer dashboard.

22. SEO

Implement:

Proper page titles

Meta descriptions

Open Graph metadata

Semantic HTML

Sitemap

Robots.txt

SEO-friendly URLs

Structured metadata where appropriate

23. PERFORMANCE

Optimize the website for production.

Use:

Lazy loading

Code splitting

Image optimization

Database indexing

API caching where appropriate

Efficient queries

Pagination

Server-side rendering where beneficial

Avoid unnecessary dependencies.

24. PROJECT STRUCTURE

Use a clean and scalable architecture.

Separate:

UI components

Pages

API/backend

Database

Authentication

Services

Validation

Utilities

Types

Configuration

Do not put the entire application into a few huge files.

Use reusable components.

25. ENVIRONMENT CONFIGURATION

Create:

.env.example

Include placeholders such as:

DATABASE_URL

AUTH_SECRET

EMAIL_API_KEY

SMS_API_KEY

PAYMENT_KEY_ID

PAYMENT_KEY_SECRET

Never commit real credentials.

Create separate configuration for:

Development

Testing

Production

26. TESTING

Implement and/or provide tests for critical functionality.

Test:

Authentication

Registration

Login

Logout

OTP verification

Password reset

Packages

Package display

Package selection

Price calculation

Orders

Order creation

Order retrieval

Status updates

Payments

Payment creation

Payment success

Payment failure

Server-side verification

Security

Unauthorized access

Admin-only routes

Invalid requests

27. DEPLOYMENT

Make the project deployment-ready.

Recommended architecture:

Frontend/backend:

Vercel or equivalent production platform

Database:

Supabase PostgreSQL or equivalent

Payment:

Razorpay

Domain:

Custom domain support

Configure:

Production environment variables

Database migrations

Build scripts

Deployment configuration

Error logging

Production security

Provide complete deployment instructions.

28. IMPORTANT BUSINESS LOGIC

The following rules are mandatory:

A user cannot access the dashboard before verification.

A user cannot purchase an inactive package.

Package prices must come from the database.

Frontend prices must never be trusted for payment.

Backend must calculate/validate the final amount.

Payment must be verified server-side.

Only verified payments create confirmed orders.

Customers can only view their own orders.

Only authorized admins can access admin pages.

Admin actions should be recorded in audit logs.

Never expose sensitive information.

Never use fake payment success logic.

Never use fake OTP verification in production mode.

29. FINAL USER FLOW

Implement this exact flow:

HOME

↓

CREATE ACCOUNT

↓

EMAIL/GMAIL OR PHONE

↓

VERIFICATION

↓

LOGIN

↓

CUSTOMER DASHBOARD

↓

VIEW PACKAGES

↓

SELECT ONE OF 5 PACKAGES

↓

PROJECT DETAILS

↓

ORDER SUMMARY

↓

PAYMENT

↓

PAYMENT VERIFICATION

↓

ORDER CONFIRMATION

↓

CUSTOMER DASHBOARD

↓

PROJECT TRACKING

30. IMPORTANT DEVELOPMENT INSTRUCTION

Do NOT generate only a visual prototype.

I need a fully functional full-stack application.

Before considering the project complete:

Connect frontend to backend.

Connect backend to PostgreSQL.

Implement real authentication.

Implement real verification.

Implement real package data from the database.

Implement real order creation.

Implement real payment gateway integration.

Implement server-side payment verification.

Implement customer dashboard.

Implement admin dashboard.

Implement proper authorization.

Implement validation.

Implement security.

Implement error handling.

Make the application responsive.

Make it deployment-ready.

If any external API requires credentials, create the integration properly and clearly identify the required environment variables instead of replacing it with fake functionality.

Use clean, maintainable, production-quality code.

At the end, provide:

Complete project structure

Technology stack

Database schema

API/backend architecture

Authentication flow

Payment flow

Environment variables required

Local setup instructions

Database migration instructions

Testing instructions

Production deployment instructions

Security checklist

Any remaining configuration required before going live

The final result should look and behave like a real commercial custom software development platform.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hekra.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/63ab7482-b10a-488d-a2f7-9083e578e8e7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
