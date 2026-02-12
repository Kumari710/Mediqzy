# Mediqzy End-to-End Booking, Order, Reminder & Messaging Flow

## Architecture Overview

This document describes the unified healthcare booking system for Mediqzy that ensures 100% data consistency between bookings, orders, reminders, and messages across all service types.

---

## 🎯 Core Principles

1. **Single Source of Truth**: All orders are created from booking data using a centralized service
2. **Immutable Booking Data**: Once captured, booking details become frozen order data
3. **Unified Flow**: Same architecture for consultations, lab tests, prescriptions, and pharmacy
4. **Synchronized State**: Any status change updates all related entities and triggers notifications

---

## 📁 File Structure

```
assests/Utils/
├── unifiedOrderService.js      # Centralized order management
├── unifiedBookingFlow.js       # Booking lifecycle management
├── messageHistoryService.js    # User communication persistence
├── localNotifications.js       # Push & scheduled notifications
├── firebaseDatabase.js         # Database operations
└── firebaseAuth.js             # User authentication
```

---

## 🔄 Unified Booking Lifecycle

### State Machine

```
[INITIATED] → [DETAILS_ENTERED] → [PAYMENT_PENDING] → [PAYMENT_PROCESSING]
                                                              ↓
                    [CANCELLED] ← [CONFIRMED] ← [PAYMENT_SUCCESS]
                                                              ↓
                                              [PAYMENT_FAILED] → (Retry)
```

### Step-by-Step Flow

#### Step 1: Booking Initiation
```javascript
import { createConsultationBooking } from './Utils/unifiedBookingFlow';

const bookingFlow = createConsultationBooking();
```

#### Step 2: Capture Booking Details
```javascript
bookingFlow.setBookingDetails({
    doctor: { name: 'Dr. Smith', specialty: 'General Physician' },
    patientName: 'John Doe',
    patientPhone: '9876543210',
    date: '15.02.26',
    time: '11:00 AM',
    type: 'online',
    fee: 500,
    bookingFee: 40,
    problem: 'Fever and headache',
});
```

#### Step 3: Initiate Payment
```javascript
const initResult = await bookingFlow.initiatePayment('upi');
// Creates order with PENDING status in Firebase
```

#### Step 4: Complete Payment
```javascript
const paymentResult = await bookingFlow.completePayment({
    method: 'upi',
    transactionId: 'TXN123456789',
    status: 'paid',
});
```

#### Step 5: Confirm & Navigate
```javascript
const confirmResult = await bookingFlow.confirmBooking();

// Navigate to order screen
navigateToOrder(navigation, bookingFlow.getOrder(), 'view_order');
```

---

## 📊 Data Models

### Unified Order Structure

```javascript
{
    // Identifiers (immutable)
    orderId: "CONS12345678ABCD",
    bookingId: "BK12345678WXYZ",
    userId: "firebase-user-id",
    orderType: "consultation", // consultation | lab | prescription | pharmacy

    // Status (mutable)
    status: "confirmed", // pending | confirmed | processing | completed | cancelled
    paymentStatus: "paid", // pending | paid | failed | refunded

    // Timestamps
    createdAt: "2026-01-31T08:00:00.000Z",
    updatedAt: "2026-01-31T08:05:00.000Z",

    // Type-specific data (immutable after creation)
    doctor: { name, specialty, id, rating },
    patient: { name, phone, problem },
    appointment: { date, time, type, location },
    pricing: { consultationFee, bookingFee, discount, tax, total },

    // Payment info
    paymentMethod: "upi",
    transactionId: "TXN123456789",
}
```

### Message Structure

```javascript
{
    id: "MSG12345678",
    type: "booking_confirmation",
    category: "orders",
    
    title: "Appointment Booked",
    message: "Your appointment with Dr. Smith is confirmed for 15.02.26 at 11:00 AM",
    
    orderId: "CONS12345678ABCD",
    bookingId: "BK12345678WXYZ",
    orderType: "consultation",
    
    read: false,
    pinned: false,
    createdAt: "2026-01-31T08:00:00.000Z",
    
    data: { ... },
    actionLabel: "View Details",
}
```

---

## 🔔 Notification & Reminder System

### Notification Channels

| Channel | Purpose | Priority |
|---------|---------|----------|
| `mediqzy_health` | Health updates | High |
| `mediqzy_orders` | Order status | High |
| `mediqzy_reminders` | Appointment reminders | Default |
| `mediqzy_promotions` | Offers | Low |

### Automatic Reminders

#### Consultation Appointments
- **1 day before**: "Your appointment with Dr. Smith is tomorrow at 11:00 AM"
- **1 hour before**: "Your appointment starts in 1 hour. Get ready!"

#### Lab Tests
- **1 day before**: "Your lab test collection is scheduled for tomorrow"
- **2 hours before**: "Technician will arrive in 2 hours for sample collection"

### Message Types

```javascript
MESSAGE_TYPES = {
    // Booking & Order
    BOOKING_CONFIRMATION
    ORDER_CONFIRMED
    ORDER_CANCELLED
    ORDER_RESCHEDULED
    
    // Payment
    PAYMENT_SUCCESS
    PAYMENT_FAILED
    
    // Reminders
    APPOINTMENT_REMINDER
    LAB_REMINDER
    MEDICINE_REMINDER
    
    // Results
    REPORT_READY
    PRESCRIPTION_READY
    
    // Consultation
    CONSULTATION_COMPLETED
}
```

---

## 🔀 API Flow & State Transitions

### Order Creation Flow

```
Frontend                    Firebase                    Notifications
   │                           │                             │
   ├─────setBookingDetails────►│                             │
   │                           │                             │
   ├─────initiatePayment──────►│                             │
   │                           ├──Create Order (pending)────►│
   │                           │                             │
   │◄──────orderId, status─────┤                             │
   │                           │                             │
   ├─────completePayment──────►│                             │
   │                           ├──Update Order (confirmed)──►│
   │                           ├──Save to allOrders─────────►│
   │                           ├──Create Message────────────►│
   │                           │                             ├──Push Notification
   │                           │                             ├──Schedule Reminders
   │◄──────order object────────┤                             │
   │                           │                             │
   ├─────Navigate to Order────►│                             │
```

### Status Change Flow

```javascript
// Any status change triggers:
1. Update in type-specific collection (appointments/labOrders/etc.)
2. Update in centralized allOrders collection
3. Create message in user's message history
4. Create database notification
5. Show local push notification
6. Update/cancel scheduled reminders if applicable
```

---

## 🛡️ Edge Case Handling

### Payment Failure

```javascript
// On payment failure:
await bookingFlow.handleFailedPayment({ message: 'Transaction declined' });

// Order status: PENDING
// Payment status: FAILED
// Message: "Payment for order X failed. Tap to retry."
// User can retry with: bookingFlow.initiatePayment('card');
```

### Cancellation

```javascript
// On cancellation:
await bookingFlow.cancelBooking('Changed my mind');

// Order status: CANCELLED
// Reminders: Cancelled
// Message: "Order X has been cancelled"
// Refund: Triggered if applicable
```

### Rescheduling

```javascript
// On reschedule:
await bookingFlow.rescheduleBooking({
    date: '20.02.26',
    time: '2:00 PM',
});

// Order status: RESCHEDULED
// Previous schedule: Stored for reference
// New reminders: Scheduled
// Old reminders: Cancelled
// Message: "Appointment rescheduled to 20.02.26 at 2:00 PM"
```

### Partial Completion

```javascript
// For multi-item orders (lab/pharmacy):
await updateOrderStatus(orderId, 'partially_completed', {
    completedItems: ['item1', 'item2'],
    pendingItems: ['item3'],
});
```

---

## 📱 Navigation Logic

### Post-Booking Navigation

```javascript
import { navigateToOrder } from './Utils/unifiedBookingFlow';

// After successful booking:
navigateToOrder(navigation, order, 'view_order');

// Navigation Map:
// Consultation → AppointmentDetailsScreen
// Lab Test → LabTestDetailsScreen
// Pharmacy → OrderDetailScreen
// Prescription → OrderDetailScreen
```

### From Notifications

```javascript
// In notification handler:
const { orderId, orderType } = notification.data;
const order = await findOrderById(orderId);
navigateToOrder(navigation, order.data, 'view_order');
```

---

## ✅ Best Practices to Prevent Data Mismatch

### 1. Single Entry Point
Always use `createUnifiedOrder()` for order creation. Never write directly to Firebase.

### 2. Freeze Booking Data
Once `setBookingDetails()` is called, the data becomes immutable in the order.

### 3. Transactional Updates
All status changes update both type-specific and centralized collections atomically.

### 4. Order ID References
All messages, notifications, and reminders reference both `orderId` and `bookingId`.

### 5. Validation Before Payment
Use `validateBookingData()` before initiating payment to catch missing fields.

```javascript
const validation = validateBookingData(bookingData, ORDER_TYPES.CONSULTATION);
if (!validation.valid) {
    Alert.alert('Missing Information', validation.errors.join('\n'));
    return;
}
```

### 6. Optimistic Concurrency
Each order has a `version` field. Updates increment the version to detect conflicts.

### 7. Audit Trail
All changes create a message in the user's history for full traceability.

---

## 🔧 Integration Example

### PaymentMethodsScreen Integration

```javascript
import { quickBookConsultation, navigateToOrder } from '../Utils/unifiedBookingFlow';

const handlePayment = async () => {
    const result = await quickBookConsultation(
        {
            doctor: appointment.doctor,
            patientName: appointment.patientName,
            date: appointment.date,
            time: appointment.time,
            type: appointment.type,
            fee: appointment.fee,
        },
        {
            method: selectedMethod,
            transactionId: `TXN${Date.now()}`,
            status: 'paid',
        }
    );

    if (result.success) {
        // Show success modal
        setOrderData(result.order);
        setShowSuccessModal(true);
    } else {
        Alert.alert('Error', result.error);
    }
};

const handleViewOrder = () => {
    setShowSuccessModal(false);
    navigateToOrder(navigation, orderData, 'view_order');
};
```

---

## 📈 Firebase Database Structure

```
/users/{userId}/
    /profile
    /addresses
    /patients

/appointments/{userId}/{appointmentId}
    orderId, bookingId, doctor, patient, appointment, pricing, status...

/labOrders/{userId}/{orderId}
    orderId, bookingId, items, schedule, pricing, status...

/pharmacyOrders/{userId}/{orderId}
    orderId, bookingId, items, delivery, pricing, status...

/prescriptionOrders/{userId}/{orderId}
    orderId, bookingId, prescription, items, delivery, pricing, status...

/allOrders/{firebaseKey}
    (Duplicate of all orders for unified lookup by orderId)

/messages/{userId}/{messageId}
    type, title, message, orderId, read, createdAt...

/orderMessages/{userId}/{orderId}/{messageKey}
    messageId, createdAt

/notifications/{userId}/{notificationId}
    type, title, message, data, read, createdAt...
```

---

## 🏁 Summary

This unified system ensures:

✅ **100% Data Consistency**: Booking data is frozen into order data  
✅ **Single Reusable Flow**: Same architecture for all service types  
✅ **Synchronized State**: All entities updated on any change  
✅ **Complete Audit Trail**: All actions logged in message history  
✅ **Timely Notifications**: Multi-channel reminders and updates  
✅ **Edge Case Handling**: Failure, cancellation, reschedule, retry  
✅ **Easy Navigation**: Consistent post-booking navigation  

---

*Last Updated: January 31, 2026*
