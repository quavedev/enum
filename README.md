# @quave/enum

Lightweight, zero-dependency utility to create rich enum objects in JavaScript. Each entry automatically gets a `name` and `index`, and you can attach any custom properties — labels, flags, functions, or even references to other enums.

## Installation

```bash
npm install @quave/enum
```

```bash
yarn add @quave/enum
```

```bash
bun add @quave/enum
```

## Quick Start

```js
import { createEnum } from '@quave/enum';

const Colors = createEnum({
  RED: { hex: '#FF0000' },
  GREEN: { hex: '#00FF00' },
  BLUE: { hex: '#0000FF' },
});

Colors.RED.name;  // "RED"
Colors.RED.index; // 0
Colors.RED.hex;   // "#FF0000"
```

## How It Works

`createEnum` takes an object where each key is an enum entry and each value is an object of custom properties. It returns a new object where every entry is enriched with:

- **`name`** — the key itself (e.g. `"RUNNING"`)
- **`index`** — the position in the enum (0, 1, 2, ...)
- Any properties from `defaultFields` (if provided)
- All your custom properties

```js
createEnum(entries, options?)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `entries` | `object` | An object where keys are enum names and values are objects with custom properties |
| `options.defaultFields` | `object` | Properties applied to every entry (can be overridden per entry) |

## Examples

### Status Enum with Labels and Styles

```js
const Statuses = createEnum({
  ACTIVE: {
    label: 'Active',
    color: 'green',
  },
  INACTIVE: {
    label: 'Inactive',
    color: 'gray',
  },
  SUSPENDED: {
    label: 'Suspended',
    color: 'red',
  },
});

Statuses.ACTIVE.label; // "Active"
Statuses.ACTIVE.color; // "green"
Statuses.ACTIVE.name;  // "ACTIVE"
Statuses.ACTIVE.index; // 0
```

### Enum with Value Property

When integrating with databases or APIs, use a `value` property to decouple the key from the stored value:

```js
const LogLevels = createEnum({
  ERROR: { value: 'error', label: 'Error', severity: 1 },
  WARN: { value: 'warn', label: 'Warning', severity: 2 },
  INFO: { value: 'info', label: 'Info', severity: 3 },
  DEBUG: { value: 'debug', label: 'Debug', severity: 4 },
});

// Find by value (e.g. from a database record)
const getLogLevelByValue = (value) =>
  Object.values(LogLevels).find((level) => level.value === value);

getLogLevelByValue('warn'); // { name: "WARN", index: 1, value: "warn", label: "Warning", severity: 2 }

// Get all valid values (e.g. for schema validation)
const LOG_LEVEL_VALUES = Object.values(LogLevels).map((l) => l.value);
// ["error", "warn", "info", "debug"]
```

### Boolean Flags for Conditional Logic

Attach boolean flags to make conditionals expressive and centralized:

```js
const OrderStatuses = createEnum({
  PENDING: {
    label: 'Pending',
    canCancel: true,
    canEdit: true,
  },
  PROCESSING: {
    label: 'Processing',
    canCancel: true,
    canEdit: false,
    isInProgress: true,
  },
  SHIPPED: {
    label: 'Shipped',
    canCancel: false,
    canEdit: false,
    isInProgress: true,
  },
  DELIVERED: {
    label: 'Delivered',
    canCancel: false,
    canEdit: false,
    isComplete: true,
  },
});

// Clean conditionals
const status = OrderStatuses[order.status];
if (status.canCancel) {
  showCancelButton();
}
if (status.isInProgress) {
  showTracker();
}
```

### Default Fields

Use `defaultFields` to apply shared properties to every entry. Per-entry values override defaults:

```js
const Permissions = createEnum(
  {
    VIEWER: { label: 'Viewer' },
    EDITOR: { label: 'Editor', canEdit: true },
    ADMIN: { label: 'Admin', canEdit: true, canDelete: true },
  },
  {
    defaultFields: {
      canEdit: false,
      canDelete: false,
    },
  }
);

Permissions.VIEWER.canEdit;  // false (from defaultFields)
Permissions.EDITOR.canEdit;  // true  (overridden)
Permissions.ADMIN.canDelete; // true  (overridden)
```

### Function Properties

Enum entries can include functions for validation, computation, or any behavior:

```js
const PricingPlans = createEnum({
  FREE: {
    label: 'Free',
    maxUsers: 5,
    price: 0,
    calculateCost: ({ users }) => 0,
  },
  PRO: {
    label: 'Pro',
    maxUsers: 50,
    price: 29,
    calculateCost: ({ users }) => 29 + Math.max(0, users - 10) * 2,
  },
  ENTERPRISE: {
    label: 'Enterprise',
    maxUsers: Infinity,
    price: 99,
    calculateCost: ({ users }) => 99 + Math.max(0, users - 50) * 1,
  },
});

PricingPlans.PRO.calculateCost({ users: 25 }); // 59
```

### Referencing Other Enums

Enums can reference values from other enums for cross-enum relationships:

```js
const Categories = createEnum({
  ELECTRONICS: { label: 'Electronics' },
  CLOTHING: { label: 'Clothing' },
});

const Products = createEnum({
  LAPTOP: {
    label: 'Laptop',
    category: Categories.ELECTRONICS.name,
    price: 999,
  },
  T_SHIRT: {
    label: 'T-Shirt',
    category: Categories.CLOTHING.name,
    price: 25,
  },
});

Products.LAPTOP.category; // "ELECTRONICS"
```

### Metadata for Forms and UI

Enums are great for driving dynamic UIs:

```js
const ContactMethods = createEnum({
  EMAIL: {
    value: 'email',
    label: 'Email',
    icon: 'mail',
    requiredFields: ['emailAddress'],
    placeholder: 'Enter your email',
  },
  PHONE: {
    value: 'phone',
    label: 'Phone',
    icon: 'phone',
    requiredFields: ['phoneNumber', 'countryCode'],
    placeholder: 'Enter your phone number',
  },
  SLACK: {
    value: 'slack',
    label: 'Slack',
    icon: 'slack',
    requiredFields: ['webhookUrl'],
    placeholder: 'Enter webhook URL',
  },
});

// Render a select dropdown
const options = Object.values(ContactMethods).map(({ value, label, icon }) => ({
  value,
  label,
  icon,
}));

// Validate required fields for selected method
const validate = (method, formData) => {
  const config = Object.values(ContactMethods).find((m) => m.value === method);
  return config.requiredFields.every((field) => formData[field]);
};
```

## Common Patterns

### Dynamic Access from Stored Values

```js
// When the key comes from a database or API:
const statusKey = record.status; // "PROCESSING"
const status = OrderStatuses[statusKey];
console.log(status.label); // "Processing"
```

### Filtering Entries

```js
// Get all entries matching a condition:
const cancelableStatuses = Object.values(OrderStatuses).filter((s) => s.canCancel);
```

### Getting All Keys

```js
// For schema validation with the key as the stored value:
const allowedStatuses = Object.keys(OrderStatuses);
// ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]
```

### Finding a Default Entry

```js
const Durations = createEnum({
  SHORT: { value: '5m', label: '5 minutes' },
  MEDIUM: { value: '15m', label: '15 minutes', isDefault: true },
  LONG: { value: '1h', label: '1 hour' },
});

const getDefault = () => Object.values(Durations).find((d) => d.isDefault);
getDefault().value; // "15m"
```

## License

MIT
