# Security Specification - Basra Express

## Data Invariants
1. A user can only create their own profile.
2. Only users with the 'merchant' role can create or update their own merchant store.
3. Only the owner of a merchant store can add or edit products in that store.
4. Customers can create orders of type 'food', 'parcel', or 'buy_for_me'.
5. Once an order is created, the `customerId` is immutable.
6. Drivers can only update the status of orders assigned to them (`driverId` matches).
7. Merchants can only update the status of orders linked to their `merchantId` (specifically 'accepted' and 'preparing').
8. Driver tracking data can only be written by the driver themselves.
9. Orders can have terminal states ('delivered', 'cancelled') after which no more updates are allowed (except by admins).

## The Dirty Dozen Payloads

### 1. Identity Spoofing (Merchant)
**Attempt**: A customer tries to create a merchant store with someone else's `ownerId`.
**Result**: `PERMISSION_DENIED` (Rule must enforce `incoming().ownerId == request.auth.uid`).

### 2. State Shortcutting (Order)
**Attempt**: A customer tries to set an order status directly to 'delivered' upon creation.
**Result**: `PERMISSION_DENIED` (Rule must enforce `incoming().status == 'pending'` on creation).

### 3. Resource Poisoning (Order ID)
**Attempt**: Injecting a 1MB string as an Order ID.
**Result**: `PERMISSION_DENIED` (Global `isValidId` gate).

### 4. Privilege Escalation (Role)
**Attempt**: A user tries to update their own role from 'customer' to 'admin'.
**Result**: `PERMISSION_DENIED` (Rule must forbid role updates by the user themselves).

### 5. Orphaned Product
**Attempt**: Creating a product for a merchant store that doesn't exist.
**Result**: `PERMISSION_DENIED` (Rule must check `exists(/merchants/$(merchantId))`).

### 6. Unauthorized Tracking Update
**Attempt**: Driver A tries to update the location of Driver B.
**Result**: `PERMISSION_DENIED` (Rule must enforce `driverId == request.auth.uid`).

### 7. Post-Terminal Update
**Attempt**: Updating a 'delivered' order to 'cancelled'.
**Result**: `PERMISSION_DENIED` (Locked terminal state).

### 8. Invisible Order Scraping
**Attempt**: A customer tries to list all orders in the system without a filter.
**Result**: `PERMISSION_DENIED` (Rule must enforce `resource.data.customerId == request.auth.uid`).

### 9. Price Tampering
**Attempt**: A customer tries to change the `totalPrice` after the order is accepted.
**Result**: `PERMISSION_DENIED` (Affected keys gate on status updates).

### 10. Shadow Field Injection
**Attempt**: Adding a `verified: true` field to a user profile.
**Result**: `PERMISSION_DENIED` (Validation helper with strict key/size checks).

### 11. Stale Timestamp bypass
**Attempt**: Providing a client-side `updatedAt` from 1 year ago.
**Result**: `PERMISSION_DENIED` (Enforced `request.time`).

### 12. Cross-Merchant Product Edit
**Attempt**: Merchant A tries to edit a product belonging to Merchant B.
**Result**: `PERMISSION_DENIED` (Relational check against merchant owner).
