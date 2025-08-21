// ========================================
// PRODUCT DATA FOR GHANAIAN COMPUTER & ELECTRONICS STORE
// ========================================

const products = [
  // ========================================
  // LAPTOPS
  // ========================================
  
  // Student Laptops
  {
    id: "LAP001",
    sku: "LAP-HP-15-001",
    name: "HP Pavilion 15 Student Laptop",
    category: "computers",
    subcategory: "student-laptops",
    price: 4500.00,
    originalPrice: 5200.00,
    currency: "GH₵",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop"
    ],
    description: "Perfect for students with reliable performance and long battery life. Ideal for assignments, research, and multimedia projects.",
    specifications: {
      processor: "Intel Core i5-1135G7",
      ram: "8GB DDR4",
      storage: "512GB SSD",
      display: "15.6\" FHD (1920x1080)",
      graphics: "Intel Iris Xe Graphics",
      battery: "Up to 8 hours",
      weight: "1.75kg",
      os: "Windows 11 Home"
    },
    features: ["Lightweight Design", "Long Battery Life", "Fast SSD Storage", "HD Webcam"],
    isTrending: true,
    isOnSale: true,
    discount: 13,
    shipping: {
      local: true,
      weight: "1.75kg",
      dimensions: "35.8 x 24.2 x 1.8 cm"
    }
  },

  {
    id: "LAP002",
    sku: "LAP-DELL-14-002",
    name: "Dell Inspiron 14 Business Laptop",
    category: "computers",
    subcategory: "business-laptops",
    price: 6800.00,
    originalPrice: 6800.00,
    currency: "GH₵",
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop"
    ],
    description: "Professional business laptop with security features and enterprise-grade performance. Perfect for corporate environments.",
    specifications: {
      processor: "Intel Core i7-1165G7",
      ram: "16GB DDR4",
      storage: "1TB SSD",
      display: "14\" FHD (1920x1080)",
      graphics: "Intel Iris Xe Graphics",
      battery: "Up to 10 hours",
      weight: "1.6kg",
      os: "Windows 11 Pro"
    },
    features: ["Fingerprint Reader", "Backlit Keyboard", "Enterprise Security", "Durable Build"],
    isTrending: false,
    isOnSale: false,
    discount: 0,
    shipping: {
      local: true,
      weight: "1.6kg",
      dimensions: "32.4 x 21.5 x 1.7 cm"
    }
  },

  {
    id: "LAP003",
    sku: "LAP-ASUS-15-003",
    name: "ASUS TUF Gaming A15",
    category: "computers",
    subcategory: "gaming-laptops",
    price: 8900.00,
    originalPrice: 9500.00,
    currency: "GH₵",
    stock: 5,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
    ],
    description: "High-performance gaming laptop with dedicated graphics. Perfect for gaming, streaming, and content creation.",
    specifications: {
      processor: "AMD Ryzen 7 5800H",
      ram: "16GB DDR4",
      storage: "512GB SSD",
      display: "15.6\" FHD 144Hz",
      graphics: "NVIDIA RTX 3060 6GB",
      battery: "Up to 6 hours",
      weight: "2.3kg",
      os: "Windows 11 Home"
    },
    features: ["144Hz Display", "RGB Keyboard", "Dedicated Graphics", "Gaming Optimized"],
    isTrending: true,
    isOnSale: true,
    discount: 6,
    shipping: {
      local: true,
      weight: "2.3kg",
      dimensions: "36.0 x 25.6 x 2.3 cm"
    }
  },

  // ========================================
  // MONITORS
  // ========================================
  
  {
    id: "MON001",
    sku: "MON-SAMSUNG-24-001",
    name: "Samsung 24\" FHD Monitor",
    category: "computers",
    subcategory: "regular-monitors",
    price: 1200.00,
    originalPrice: 1400.00,
    currency: "GH₵",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop"
    ],
    description: "Crystal clear 24-inch monitor perfect for work and entertainment. Features eye-care technology for comfortable viewing.",
    specifications: {
      display: "24\" FHD (1920x1080)",
      refreshRate: "60Hz",
      responseTime: "5ms",
      panel: "VA Panel",
      ports: "HDMI, VGA, Audio Out",
      brightness: "250 nits",
      contrast: "3000:1"
    },
    features: ["Eye Care Technology", "Flicker Free", "Game Mode", "VESA Mount Compatible"],
    isTrending: false,
    isOnSale: true,
    discount: 14,
    shipping: {
      local: true,
      weight: "3.2kg",
      dimensions: "54.0 x 32.0 x 18.0 cm"
    }
  },

  {
    id: "MON002",
    sku: "MON-LG-27-002",
    name: "LG 27\" Gaming Monitor",
    category: "computers",
    subcategory: "gaming-monitors",
    price: 2800.00,
    originalPrice: 2800.00,
    currency: "GH₵",
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
    ],
    description: "27-inch gaming monitor with 144Hz refresh rate and 1ms response time. Immersive gaming experience with AMD FreeSync.",
    specifications: {
      display: "27\" FHD (1920x1080)",
      refreshRate: "144Hz",
      responseTime: "1ms",
      panel: "IPS Panel",
      ports: "HDMI, DisplayPort",
      brightness: "350 nits",
      contrast: "1000:1"
    },
    features: ["144Hz Refresh Rate", "1ms Response Time", "AMD FreeSync", "Gaming Presets"],
    isTrending: true,
    isOnSale: false,
    discount: 0,
    shipping: {
      local: true,
      weight: "4.1kg",
      dimensions: "61.0 x 36.0 x 22.0 cm"
    }
  },

  // ========================================
  // ACCESSORIES
  // ========================================
  
  {
    id: "ACC001",
    sku: "ACC-LOGITECH-001",
    name: "Logitech Wireless Keyboard & Mouse",
    category: "accessories",
    subcategory: "wireless",
    price: 450.00,
    originalPrice: 550.00,
    currency: "GH₵",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop"
    ],
    description: "Reliable wireless keyboard and mouse combo. Perfect for home and office use with long battery life.",
    specifications: {
      keyboard: "Full-size with number pad",
      mouse: "Optical tracking",
      connectivity: "2.4GHz wireless",
      battery: "Up to 12 months",
      range: "10 meters",
      compatibility: "Windows, Mac, Linux"
    },
    features: ["Wireless Freedom", "Long Battery Life", "Plug & Play", "Ergonomic Design"],
    isTrending: false,
    isOnSale: true,
    discount: 18,
    shipping: {
      local: true,
      weight: "0.8kg",
      dimensions: "45.0 x 15.0 x 5.0 cm"
    }
  },

  {
    id: "ACC002",
    sku: "ACC-COOLING-002",
    name: "Laptop Cooling Pad with RGB",
    category: "accessories",
    subcategory: "laptop-cooling-pads",
    price: 180.00,
    originalPrice: 180.00,
    currency: "GH₵",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
    ],
    description: "RGB cooling pad with 5 fans to keep your laptop cool during intensive tasks. Adjustable height and USB powered.",
    specifications: {
      fans: "5 RGB fans",
      size: "Up to 17\" laptops",
      power: "USB powered",
      height: "Adjustable (3 levels)",
      material: "Aluminum + Plastic",
      led: "RGB lighting"
    },
    features: ["5 Cooling Fans", "RGB Lighting", "Adjustable Height", "USB Powered"],
    isTrending: true,
    isOnSale: false,
    discount: 0,
    shipping: {
      local: true,
      weight: "0.6kg",
      dimensions: "35.0 x 25.0 x 3.0 cm"
    }
  },

  {
    id: "ACC003",
    sku: "ACC-HEADPHONES-003",
    name: "Gaming Headset with Microphone",
    category: "accessories",
    subcategory: "headsets-speakers",
    price: 320.00,
    originalPrice: 400.00,
    currency: "GH₵",
    stock: 28,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
    ],
    description: "Immersive gaming headset with noise-canceling microphone. Perfect for gaming, streaming, and voice calls.",
    specifications: {
      drivers: "50mm",
      frequency: "20Hz-20kHz",
      impedance: "32Ω",
      microphone: "Detachable with noise cancellation",
      connectivity: "3.5mm jack",
      cable: "2.2m braided cable"
    },
    features: ["50mm Drivers", "Noise Canceling Mic", "Comfortable Earpads", "Volume Control"],
    isTrending: false,
    isOnSale: true,
    discount: 20,
    shipping: {
      local: true,
      weight: "0.4kg",
      dimensions: "20.0 x 18.0 x 8.0 cm"
    }
  },

  // ========================================
  // CABLES & POWER
  // ========================================
  
  {
    id: "CAB001",
    sku: "CAB-CHARGER-001",
    name: "Universal Laptop Charger 65W",
    category: "cables-power",
    subcategory: "laptop-chargers",
    price: 280.00,
    originalPrice: 350.00,
    currency: "GH₵",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
    ],
    description: "Universal laptop charger compatible with most brands. Includes multiple adapters for HP, Dell, Lenovo, and more.",
    specifications: {
      power: "65W",
      input: "100-240V AC",
      output: "19V/3.42A",
      adapters: "8 different tips included",
      cable: "1.8m length",
      protection: "Over-voltage, over-current protection"
    },
    features: ["Universal Compatibility", "Multiple Adapters", "Safety Protection", "Fast Charging"],
    isTrending: false,
    isOnSale: true,
    discount: 20,
    shipping: {
      local: true,
      weight: "0.3kg",
      dimensions: "12.0 x 8.0 x 3.0 cm"
    }
  },

  {
    id: "CAB002",
    sku: "CAB-USB-C-002",
    name: "USB-C to USB-C Cable 100W",
    category: "cables-power",
    subcategory: "usb-cables",
    price: 85.00,
    originalPrice: 85.00,
    currency: "GH₵",
    stock: 100,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
    ],
    description: "High-quality USB-C cable supporting up to 100W power delivery and 10Gbps data transfer. Perfect for laptops and phones.",
    specifications: {
      power: "100W Power Delivery",
      data: "10Gbps USB 3.1 Gen 2",
      length: "1m",
      connector: "USB-C to USB-C",
      material: "Braided nylon",
      certification: "USB-IF certified"
    },
    features: ["100W Power Delivery", "10Gbps Data Transfer", "Braided Design", "USB-IF Certified"],
    isTrending: true,
    isOnSale: false,
    discount: 0,
    shipping: {
      local: true,
      weight: "0.1kg",
      dimensions: "15.0 x 5.0 x 1.0 cm"
    }
  },

  // ========================================
  // PC COMPONENTS
  // ========================================
  
  {
    id: "COM001",
    sku: "COM-RAM-001",
    name: "Kingston 8GB DDR4 RAM",
    category: "pc-components",
    subcategory: "ram",
    price: 420.00,
    originalPrice: 480.00,
    currency: "GH₵",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
    ],
    description: "Reliable DDR4 RAM module for desktop and laptop upgrades. Compatible with most modern systems.",
    specifications: {
      capacity: "8GB",
      type: "DDR4",
      speed: "2666MHz",
      latency: "CL19",
      voltage: "1.2V",
      compatibility: "Desktop & Laptop"
    },
    features: ["High Performance", "Low Power", "Wide Compatibility", "Lifetime Warranty"],
    isTrending: false,
    isOnSale: true,
    discount: 12,
    shipping: {
      local: true,
      weight: "0.05kg",
      dimensions: "13.0 x 3.0 x 1.0 cm"
    }
  },

  {
    id: "COM002",
    sku: "COM-SSD-002",
    name: "Samsung 500GB SSD",
    category: "pc-components",
    subcategory: "internal-ssds",
    price: 650.00,
    originalPrice: 750.00,
    currency: "GH₵",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
    ],
    description: "Fast and reliable SSD for faster boot times and improved system performance. Perfect for OS and applications.",
    specifications: {
      capacity: "500GB",
      interface: "SATA III 6Gb/s",
      readSpeed: "Up to 550MB/s",
      writeSpeed: "Up to 520MB/s",
      form: "2.5\"",
      warranty: "3 years"
    },
    features: ["Fast Boot Times", "High Reliability", "Low Power", "3-Year Warranty"],
    isTrending: true,
    isOnSale: true,
    discount: 13,
    shipping: {
      local: true,
      weight: "0.08kg",
      dimensions: "10.0 x 7.0 x 1.0 cm"
    }
  }
];

// ========================================
// CATEGORIES DATA
// ========================================

const categories = [
  {
    id: "computers",
    name: "💻 Computers & Laptops",
    icon: "💻",
    subcategories: [
      { id: "student-laptops", name: "Student Laptops" },
      { id: "business-laptops", name: "Business Laptops" },
      { id: "gaming-laptops", name: "Gaming Laptops" },
      { id: "desktop-pcs", name: "Desktop PCs" },
      { id: "all-in-one-pcs", name: "All-in-One PCs" },
      { id: "tower-desktops", name: "Tower Desktops" },
      { id: "mini-pcs", name: "Mini PCs" },
      { id: "regular-monitors", name: "Regular Monitors" },
      { id: "gaming-monitors", name: "Gaming Monitors" },
      { id: "curved-monitors", name: "Curved Monitors" }
    ]
  },
  {
    id: "accessories",
    name: "🧩 Accessories",
    icon: "🧩",
    subcategories: [
      { id: "wired", name: "Wired" },
      { id: "wireless", name: "Wireless" },
      { id: "gaming-sets", name: "Gaming Sets" },
      { id: "laptop-cooling-pads", name: "Laptop Cooling Pads & Stands" },
      { id: "webcams-microphones", name: "Webcams & Microphones" },
      { id: "headsets-speakers", name: "Headsets & Speakers" },
      { id: "flash-drives", name: "Flash Drives & Memory Cards" },
      { id: "external-storage", name: "External Storage (HDD/SSD)" }
    ]
  },
  {
    id: "cables-power",
    name: "🔌 Cables & Power",
    icon: "🔌",
    subcategories: [
      { id: "laptop-chargers", name: "Laptop Chargers" },
      { id: "usb-cables", name: "USB Cables (Type-C, Lightning, etc.)" },
      { id: "display-cables", name: "HDMI, VGA, Display Cables" },
      { id: "power-strips", name: "Power Strips & Surge Protectors" }
    ]
  },
  {
    id: "pc-components",
    name: "🧠 PC Components & Upgrades",
    icon: "🧠",
    subcategories: [
      { id: "ram", name: "RAM (Laptop/Desktop)" },
      { id: "internal-ssds", name: "Internal SSDs & HDDs" },
      { id: "graphics-cards", name: "Graphics Cards" },
      { id: "processors", name: "Processors (Optional)" },
      { id: "motherboards", name: "Motherboards (Optional)" }
    ]
  },
  {
    id: "bags-protection",
    name: "🎒 Bags & Protection",
    icon: "🎒",
    subcategories: [
      { id: "laptop-bags", name: "Laptop Bags" },
      { id: "backpacks", name: "Backpacks" },
      { id: "sleeves-cases", name: "Sleeves & Cases" },
      { id: "screen-protectors", name: "Screen Protectors" },
      { id: "keyboard-covers", name: "Keyboard Covers" }
    ]
  },
  {
    id: "networking",
    name: "🌐 Networking",
    icon: "🌐",
    subcategories: [
      { id: "wifi-routers", name: "Wi-Fi Routers" },
      { id: "range-extenders", name: "Range Extenders" },
      { id: "usb-modems", name: "USB Modems" },
      { id: "lan-cables", name: "LAN Cables & Switches" }
    ]
  },
  {
    id: "deals-bundles",
    name: "📦 Deals & Bundles",
    icon: "📦",
    subcategories: [
      { id: "student-bundles", name: "Student Laptop Bundles" },
      { id: "work-from-home", name: "Work-From-Home Kits" },
      { id: "back-to-school", name: "Back-to-School Offers" }
    ]
  },
  {
    id: "support-services",
    name: "🛠️ Support & Services",
    icon: "🛠️",
    subcategories: [
      { id: "warranty-repairs", name: "Warranty & Repairs" },
      { id: "software-installation", name: "Software Installation" },
      { id: "pc-setup", name: "PC Setup Services" }
    ]
  }
];

// ========================================
// HELPER FUNCTIONS
// ========================================

function getProductsByCategory(category) {
  return products.filter(product => product.category === category);
}

function getProductsBySubcategory(subcategory) {
  return products.filter(product => product.subcategory === subcategory);
}

function getTrendingProducts() {
  return products.filter(product => product.isTrending);
}

function getOnSaleProducts() {
  return products.filter(product => product.isOnSale);
}

function searchProducts(query) {
  const searchTerm = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.sku.toLowerCase().includes(searchTerm)
  );
}

function getProductById(id) {
  return products.find(product => product.id === id);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { products, categories, getProductsByCategory, getProductsBySubcategory, getTrendingProducts, getOnSaleProducts, searchProducts, getProductById };
} 