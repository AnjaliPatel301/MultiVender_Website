export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));

export const formatDateShort = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

export const getDiscountPercent = (original, current) =>
  Math.round(((original - current) / original) * 100);

export const truncate = (text, maxLength = 100) =>
  text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

export const getOrderStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-orange-100 text-orange-800',
    packed: 'bg-purple-100 text-purple-800',
    ready_for_pickup: 'bg-indigo-100 text-indigo-800',
    picked_up: 'bg-cyan-100 text-cyan-800',
    shipped: 'bg-sky-100 text-sky-800',
    reached_sorting_center: 'bg-teal-100 text-teal-800',
    in_transit: 'bg-blue-100 text-blue-800',
    reached_destination_city: 'bg-violet-100 text-violet-800',
    out_for_delivery: 'bg-emerald-100 text-emerald-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    returned: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    failed_delivery: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getOrderStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    packed: 'Packed',
    ready_for_pickup: 'Ready for Pickup',
    picked_up: 'Picked Up',
    shipped: 'Shipped',
    reached_sorting_center: 'At Sorting Center',
    in_transit: 'In Transit',
    reached_destination_city: 'Reached City',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
    refunded: 'Refunded',
    failed_delivery: 'Failed Delivery',
  };
  return labels[status] || status;
};

export const calculateShipping = (subtotal) => {
  if (subtotal >= 999) return 0;
  if (subtotal >= 500) return 49;
  return 99;
};

export const calculateTax = (amount) => Math.round(amount * 0.18);

export const generateSKU = () => 'LXF-' + Math.random().toString(36).substring(2, 8).toUpperCase();

export const slugify = (text) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

// ─── Nested Category Structure ────────────────────────────────────────────────

export const CATEGORY_TREE = {
  men: {
    label: "Men's Fashion",
    subCategories: {
      'T-Shirts': {
        label: 'T-Shirts',
        types: [
          'Casual T-Shirts', 'Polo T-Shirts', 'Henley T-Shirts', 'Graphic T-Shirts',
          'Plain T-Shirts', 'V-Neck T-Shirts', 'Round Neck T-Shirts', 'Full Sleeve T-Shirts',
          'Half Sleeve T-Shirts', 'Sleeveless T-Shirts', 'Oversized T-Shirts', 'Slim Fit T-Shirts',
          'Regular Fit T-Shirts', 'Striped T-Shirts', 'Printed T-Shirts', 'Solid T-Shirts',
          'Tie-Dye T-Shirts', 'Sports T-Shirts', 'Gym T-Shirts', 'Running T-Shirts',
          'Football T-Shirts', 'Cricket T-Shirts', 'Rugby T-Shirts', 'Compression T-Shirts',
          'Dry Fit T-Shirts', 'Cotton T-Shirts', 'Linen T-Shirts', 'Blend T-Shirts',
          'Pocket T-Shirts', 'Button Neck T-Shirts', 'Mock Neck T-Shirts', 'Turtle Neck T-Shirts',
          'Embroidered T-Shirts', 'Vintage T-Shirts', 'Band T-Shirts', 'Logo T-Shirts',
          'Pack of 2 T-Shirts', 'Pack of 3 T-Shirts', 'Longline T-Shirts', 'Drop Shoulder T-Shirts',
          'Color Block T-Shirts', 'Ombre T-Shirts', 'Acid Wash T-Shirts', 'Camouflage T-Shirts',
          'Boxy T-Shirts', 'Crop T-Shirts', 'Rib T-Shirts', 'Textured T-Shirts',
          'Bamboo T-Shirts', 'Organic Cotton T-Shirts', 'Performance T-Shirts',
        ],
      },
      'Shirts': {
        label: 'Shirts',
        types: [
          'Formal Shirts', 'Casual Shirts', 'Linen Shirts', 'Check Shirts',
          'Striped Shirts', 'Printed Shirts', 'Solid Shirts', 'Denim Shirts',
          'Flannel Shirts', 'Cuban Collar Shirts', 'Slim Fit Shirts', 'Regular Fit Shirts',
          'Oversized Shirts', 'Short Sleeve Shirts', 'Full Sleeve Shirts',
        ],
      },
      'Jeans': {
        label: 'Jeans',
        types: [
          'Slim Fit Jeans', 'Skinny Jeans', 'Regular Fit Jeans', 'Straight Fit Jeans',
          'Bootcut Jeans', 'Relaxed Fit Jeans', 'Ripped Jeans', 'Distressed Jeans',
          'Jogger Jeans', 'Cargo Jeans', 'Stretch Jeans', 'Raw Denim Jeans',
        ],
      },
    },
  },
};

// Fixed 4 main categories — these are the only allowed main categories
export const CATEGORIES = [
  { id: 'men', label: "Men's Fashion", icon: '👔' },
  { id: 'women', label: "Women's Fashion", icon: '👗' },
  { id: 'kids', label: 'Kids Fashion', icon: '🧒' },
  { id: 'accessories', label: 'Accessories', icon: '👜' },
];

export const SIZES_MEN = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
export const SIZES_WOMEN = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const SIZES_KIDS = ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y', '14Y'];
export const PANT_SIZES = ['28', '30', '32', '34', '36', '38', '40'];

export const COLORS = [
  'Black', 'White', 'Gray', 'Navy', 'Blue', 'Red', 'red',
  'Green', 'Yellow', 'Brown', 'Beige', 'Orange', 'Purple',
  'Maroon', 'Olive', 'Teal', 'Burgundy', 'Mustard', 'Coral', 'Cream',
];

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratings', label: 'Top Rated' },
  { value: '-numReviews', label: 'Most Reviewed' },
];
