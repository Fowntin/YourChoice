// ========================================
// PRODUCT DATA FOR GHANAIAN COMPUTER & ELECTRONICS STORE
// Hybrid Catalog: Static Product Specifications & Manufacturing Details
// ========================================

const products = [
  // ========================================
  // SMARTPHONES & MOBILE PHONES
  // ========================================

  // Apple iPhone
  {
    id: "PHO001",
    sku: "PHO-APPLE-15P-001",
    name: "Apple iPhone 15 Pro (128GB - Natural Titanium)",
    brand: "Apple",
    manufacturer: "Apple Inc. Cupertino, California, USA",
    modelNumber: "A3102 / MTV13ZD/A",
    countryOfOrigin: "Designed by Apple in California, Assembled in China/India",
    category: "smartphones",
    subcategory: "iphone-apple",
    price: 16800.00,
    originalPrice: 17900.00,
    currency: "GH₵",
    stock: 9,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=450&fit=crop"
    ],
    description: "Forged in aerospace-grade titanium with the breakthrough A17 Pro 3nm chip, customizable Action button, next-generation portraits with Focus and Depth Control, and USB-C with USB 3 speeds. Officially verified for Ghana 5G cellular networks.",
    specifications: {
      "Storage Capacity": "128GB NVMe Internal Storage",
      "RAM": "8GB LPDDR5 Unified Memory",
      "Processor": "Apple A17 Pro (6-core CPU with 2 performance and 4 efficiency cores, 6-core GPU, 16-core Neural Engine)",
      "Display": "6.1\" Super Retina XDR OLED (2556 x 1179 at 460 ppi), ProMotion 120Hz, Dynamic Island, 2000 nits peak brightness",
      "Rear Camera System": "Pro Triple Camera: 48MP Main (24mm, ƒ/1.78, 2nd-gen Sensor-shift OIS) + 12MP Ultra Wide (13mm, 120° FOV) + 12MP 3x Telephoto (77mm, OIS), 4K ProRes 60fps",
      "Front Camera": "12MP TrueDepth (ƒ/1.9) with Autofocus and 4K HDR Dolby Vision",
      "Battery & Charging": "Up to 23 hours video playback, MagSafe wireless up to 15W, Fast charge 50% in 30 mins via 20W+ adapter (USB-C)",
      "Network & SIM": "5G NR (sub-6 GHz), Gigabit LTE, Dual SIM (1x Physical Nano-SIM + 1x eSIM), MTN Ghana & Telecel 5G Approved, Wi-Fi 6E, Bluetooth 5.3",
      "Operating System": "iOS 17 (Upgradable to iOS 18 with Apple Intelligence)",
      "Build & Durability": "Titanium frame with textured matte glass back, Ceramic Shield front, IP68 water/dust resistance (6m up to 30 mins)",
      "Weight & Dimensions": "187 g | 146.6 x 70.6 x 8.25 mm"
    },
    manufacturingDetails: {
      brandName: "Apple",
      manufacturer: "Apple Inc. (One Apple Park Way, Cupertino, CA 95014, USA)",
      modelNumber: "iPhone 15 Pro - A3102 (Global / African Regional Version)",
      countryOfOrigin: "Designed in California, Assembled in China",
      certifications: ["NCA Ghana Type Approved", "CE Mark", "FCC Certified", "RoHS Compliant", "Qi Certified"],
      boxContents: [
        "Apple iPhone 15 Pro with iOS 17",
        "Braided USB-C Charge Cable (1m)",
        "SIM Ejector Pin",
        "Documentation & Apple Logo Decal",
        "1-Year Official Apple Ghana Warranty Card"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "1 Year Official Apple International & Ghana Warranty",
      warrantyCoverage: "Full genuine hardware and display replacement handled directly via Apple Authorized Service Providers in Ghana (iStore Ghana / CompuGhana).",
      deliveryEstimate: "Greater Accra: 2–4 hours (Same-Day Express); Regional Capitals: 24–48 hours nationwide with insured tracking.",
      returnPolicy: "7-day replacement for verified factory hardware defects (original packaging and seal intact)."
    },
    features: ["A17 Pro 3nm Processor", "Aerospace Titanium Design", "48MP Pro Triple Camera", "Ghana 5G Dual SIM Ready"],
    isTrending: true,
    isOnSale: true,
    discount: 6,
    shipping: {
      local: true,
      weight: "0.19kg",
      dimensions: "14.7 x 7.1 x 0.8 cm"
    }
  },

  {
    id: "PHO002",
    sku: "PHO-APPLE-13-002",
    name: "Apple iPhone 13 (128GB - Midnight Blue)",
    brand: "Apple",
    manufacturer: "Apple Inc. Cupertino, California, USA",
    modelNumber: "A2633 / MLPF3ZD/A",
    countryOfOrigin: "Designed by Apple in California, Assembled in China/India",
    category: "smartphones",
    subcategory: "iphone-apple",
    price: 8950.00,
    originalPrice: 9800.00,
    currency: "GH₵",
    stock: 14,
    images: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=450&fit=crop"
    ],
    description: "The superstar all-rounder: Powered by Apple A15 Bionic for blazing performance and stellar efficiency. Features vibrant Super Retina XDR OLED, Cinematic mode 1080p video with rack focus, durable Ceramic Shield glass, and all-day battery life.",
    specifications: {
      "Storage Capacity": "128GB NVMe Internal Storage",
      "RAM": "4GB LPDDR4X",
      "Processor": "Apple A15 Bionic (6-core CPU with 2 performance and 4 efficiency cores, 4-core GPU, 16-core Neural Engine)",
      "Display": "6.1\" Super Retina XDR OLED (2532 x 1170 at 460 ppi), HDR10, True Tone, 1200 nits peak HDR brightness",
      "Rear Camera System": "Advanced Dual Camera: 12MP Wide (ƒ/1.6, Sensor-shift OIS) + 12MP Ultra Wide (ƒ/2.4, 120° FOV), Cinematic Mode (1080p at 30 fps), Photographic Styles",
      "Front Camera": "12MP TrueDepth (ƒ/2.2) with Cinematic Mode and Smart HDR 4",
      "Battery & Charging": "Up to 19 hours video playback, MagSafe wireless up to 15W, Fast charge 50% in 30 mins via 20W adapter",
      "Network & SIM": "5G NR bands, Gigabit LTE with 4x4 MIMO, Dual SIM (Nano-SIM and eSIM), Wi-Fi 6 (802.11ax), Bluetooth 5.0",
      "Operating System": "iOS 17 (Upgradable to iOS 18)",
      "Build & Durability": "Aerospace-grade aluminum frame with glass back, Ceramic Shield front, IP68 water/dust resistant",
      "Weight & Dimensions": "174 g | 146.7 x 71.5 x 7.65 mm"
    },
    manufacturingDetails: {
      brandName: "Apple",
      manufacturer: "Apple Inc. (One Apple Park Way, Cupertino, CA 95014, USA)",
      modelNumber: "iPhone 13 - A2633 (Global / African Spec)",
      countryOfOrigin: "Designed in California, Assembled in China",
      certifications: ["NCA Ghana Approved", "CE", "FCC", "RoHS", "WEEE"],
      boxContents: [
        "Apple iPhone 13 in Midnight Blue",
        "USB-C to Lightning Cable",
        "SIM Removal Tool",
        "Quick Start Guide",
        "Official Ghana Warranty Slip"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "1 Year Official Apple Manufacturer Warranty",
      warrantyCoverage: "Full hardware defects and original battery health coverage via authorized service hubs in Ghana.",
      deliveryEstimate: "Accra/Tema: 2–4 hours; Kumasi, Takoradi, Tamale: 24–48 hours.",
      returnPolicy: "7-day return/swap for sealed or verified factory defects."
    },
    features: ["A15 Bionic Processor", "Cinematic Video Mode", "Ceramic Shield Glass", "All-Day Battery Life"],
    isTrending: false,
    isOnSale: true,
    discount: 9,
    shipping: {
      local: true,
      weight: "0.17kg",
      dimensions: "14.7 x 7.2 x 0.8 cm"
    }
  },

  // Samsung Galaxy
  {
    id: "PHO003",
    sku: "PHO-SAM-S24U-003",
    name: "Samsung Galaxy S24 Ultra (256GB - Titanium Black)",
    brand: "Samsung",
    manufacturer: "Samsung Electronics Co., Ltd. Suwon, South Korea",
    modelNumber: "SM-S928B/DS",
    countryOfOrigin: "Designed in South Korea, Manufactured in Vietnam",
    category: "smartphones",
    subcategory: "samsung-galaxy",
    price: 17900.00,
    originalPrice: 19200.00,
    currency: "GH₵",
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=450&fit=crop"
    ],
    description: "The pinnacle of mobile intelligence: Powered by Snapdragon 8 Gen 3 for Galaxy and built-in Galaxy AI (Circle to Search, Live Call Translation, Note Assist). Features 200MP camera with 100x Space Zoom, integrated low-latency S Pen, and flat Corning Gorilla Armor anti-reflective display.",
    specifications: {
      "Storage Capacity": "256GB UFS 4.0 High-Speed Flash Storage",
      "RAM": "12GB LPDDR5X",
      "Processor": "Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm Octa-core up to 3.39 GHz, Adreno 750 GPU)",
      "Display": "6.8\" Dynamic LTPO AMOLED 2X (3120 x 1440 QHD+), 1–120Hz Adaptive Refresh, 2600 nits peak brightness, Corning Gorilla Armor",
      "Rear Camera System": "Quad Pro Camera: 200MP Main (ƒ/1.7, OIS, Super Quad Pixel AF) + 50MP Periscope Telephoto (5x Optical, 10x Optical Quality, 100x Space Zoom, OIS) + 10MP Telephoto (3x Optical, OIS) + 12MP Ultra-Wide (120° FOV)",
      "Front Camera": "12MP Dual Pixel AF (ƒ/2.2) with 4K 60fps video",
      "Battery & Charging": "5,000 mAh Li-ion battery, 45W Super Fast Charging 2.0 (65% in 30 mins), 15W Fast Wireless Charging 2.0, Wireless PowerShare",
      "Network & SIM": "5G Sub-6 / mmWave, Dual Nano-SIM + Dual eSIM support, MTN Ghana & Telecel 5G Certified, Wi-Fi 7, Bluetooth 5.3",
      "Operating System": "Android 14 with One UI 6.1 (7 Years of Guaranteed OS & Security Updates)",
      "S-Pen & Productivity": "Built-in Bluetooth S Pen with Air Actions, IP68 water resistance, Samsung DeX desktop mode",
      "Weight & Dimensions": "232 g | 162.3 x 79.0 x 8.6 mm"
    },
    manufacturingDetails: {
      brandName: "Samsung Galaxy",
      manufacturer: "Samsung Electronics Co., Ltd. (129, Samsung-ro, Yeongtong-gu, Suwon-si, Gyeonggi-do, Korea)",
      modelNumber: "SM-S928B/DS (Dual SIM African Regional Spec)",
      countryOfOrigin: "Manufactured in Vietnam under Samsung QC",
      certifications: ["NCA Ghana Type Approved", "Samsung Official Ghana Care+", "CE", "FCC", "IP68 Certified"],
      boxContents: [
        "Samsung Galaxy S24 Ultra Phone",
        "Integrated S Pen Stylus",
        "USB-C to USB-C 3A Cable",
        "Ejection Pin",
        "Quick Start Guide & Ghana Warranty Slip"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "24 Months Samsung Ghana Official Warranty",
      warrantyCoverage: "Comprehensive 2-year warranty covering logic board, cameras, and battery + 1-time discounted screen repair via Samsung Ghana Brand Stores (Circle, Accra Mall, Kumasi City Mall).",
      deliveryEstimate: "Greater Accra: 2–4 hours; Kumasi & Regions: Next business day.",
      returnPolicy: "7-day replacement guarantee for verified hardware defects."
    },
    features: ["Galaxy AI Suite Built-In", "200MP Quad Camera System", "Integrated S Pen Stylus", "24-Month Ghana Warranty"],
    isTrending: true,
    isOnSale: true,
    discount: 7,
    shipping: {
      local: true,
      weight: "0.23kg",
      dimensions: "16.2 x 7.9 x 0.9 cm"
    }
  },

  {
    id: "PHO004",
    sku: "PHO-SAM-A55-004",
    name: "Samsung Galaxy A55 5G (128GB - Awesome Navy)",
    brand: "Samsung",
    manufacturer: "Samsung Electronics Co., Ltd. Suwon, South Korea",
    modelNumber: "SM-A556B/DS",
    countryOfOrigin: "Manufactured in Vietnam under Samsung QC",
    category: "smartphones",
    subcategory: "samsung-galaxy",
    price: 4800.00,
    originalPrice: 5300.00,
    currency: "GH₵",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=450&fit=crop"
    ],
    description: "Premium metal craftsmanship meets high-speed 5G. Featuring metal flat frame with Key Island design, vivid 120Hz Super AMOLED display with Vision Booster, 50MP OIS camera with big-pixel nightography, Samsung Knox Vault security, and 2-day battery life.",
    specifications: {
      "Storage Capacity": "128GB Internal Storage (Expandable up to 1TB via MicroSD)",
      "RAM": "8GB RAM + RAM Plus virtual expansion",
      "Processor": "Samsung Exynos 1480 (4nm Octa-core up to 2.75 GHz, AMD Xclipse 530 GPU)",
      "Display": "6.6\" FHD+ Super AMOLED (2340 x 1080), 120Hz Smooth Refresh, 1000 nits HBM, Corning Gorilla Glass Victus+",
      "Rear Camera System": "Triple Camera: 50MP Main (ƒ/1.8, OIS, Super HDR Video) + 12MP Ultra-Wide (123° FOV) + 5MP Macro (ƒ/2.4)",
      "Front Camera": "32MP High-Resolution Selfie (ƒ/2.2) with Portrait mode",
      "Battery & Charging": "5,000 mAh long-life battery, 25W Fast Charging (50% in 30 mins)",
      "Network & SIM": "5G NR, 4G LTE, Hybrid Dual SIM (Nano-SIM, dual stand-by), MTN Ghana / Telecel 5G Tested, Wi-Fi 6, Bluetooth 5.3",
      "Operating System": "Android 14 with One UI 6.1 (4 OS Upgrades + 5 Years Security Updates)",
      "Build & Durability": "Brushed metal side frame with glass front/back, IP67 dust/water resistant (1m for 30 mins)",
      "Security": "Samsung Knox Vault EAL5+ certified hardware enclave, In-display optical fingerprint",
      "Weight & Dimensions": "213 g | 161.1 x 77.4 x 8.2 mm"
    },
    manufacturingDetails: {
      brandName: "Samsung Galaxy A-Series",
      manufacturer: "Samsung Electronics Co., Ltd. (Suwon-si, Gyeonggi-do, Korea)",
      modelNumber: "SM-A556B/DS (African Dual SIM)",
      countryOfOrigin: "Manufactured in Vietnam",
      certifications: ["NCA Ghana Type Approved", "IP67 Certified", "CE", "RoHS"],
      boxContents: [
        "Samsung Galaxy A55 5G Phone",
        "USB Type-C to Type-C Cable",
        "SIM Ejection Pin",
        "Quick Start Guide",
        "Official 24-Month Warranty Card"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "24 Months Official Samsung Ghana Warranty",
      warrantyCoverage: "Full parts and labor protection across all authorized Samsung service centers nationwide.",
      deliveryEstimate: "Accra/Tema: 2–3 hours; Nationwide: 24–48 hours.",
      returnPolicy: "7-day return policy for unopened or defective devices."
    },
    features: ["50MP OIS Nightography", "Metal Key Island Frame", "Super AMOLED 120Hz", "IP67 Water Resistance"],
    isTrending: false,
    isOnSale: true,
    discount: 9,
    shipping: {
      local: true,
      weight: "0.21kg",
      dimensions: "16.1 x 7.7 x 0.8 cm"
    }
  },

  // Tecno Mobile
  {
    id: "PHO005",
    sku: "PHO-TECNO-C30P-005",
    name: "Tecno Camon 30 Pro 5G (512GB - Alps Snowy Silver)",
    brand: "Tecno",
    manufacturer: "Transsion Holdings Co., Ltd. Shenzhen, China",
    modelNumber: "CL8",
    countryOfOrigin: "Designed in France & China, Assembled by Transsion",
    category: "smartphones",
    subcategory: "tecno-mobile",
    price: 4200.00,
    originalPrice: 4650.00,
    currency: "GH₵",
    stock: 16,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=450&fit=crop"
    ],
    description: "Professional imaging pioneer: Equipped with flagship Sony IMX890 50MP OIS sensor, 50MP eye-tracking autofocus selfie, MediaTek Dimensity 8200 Ultimate 5G flagship chipset, massive 512GB internal storage, fluid 144Hz 1.5K AMOLED display, and blazing 70W Ultra Charge.",
    specifications: {
      "Storage Capacity": "512GB High-Speed UFS 3.1 ROM",
      "RAM": "12GB Physical RAM + up to 12GB Extended Memory Fusion (Total 24GB)",
      "Processor": "MediaTek Dimensity 8200 Ultimate 5G (4nm Octa-core up to 3.1 GHz, Mali-G610 MC6 GPU)",
      "Display": "6.78\" 1.5K AMOLED (2780 x 1264), 144Hz Ultra-Smooth Refresh, 10-bit 1.07 Billion Colors, 2160Hz PWM Dimming",
      "Rear Camera System": "Triple 50MP Studio System: 50MP Sony IMX890 (1/1.56\", ƒ/1.9, OIS, 4K 60fps HDR) + 50MP Ultra-Wide & Macro (114° FOV) + 2MP Depth, Action Cam Classic Dial with Breathing Light",
      "Front Camera": "50MP Eye-Tracking Autofocus Selfie with Dual-Color Temperature Front Flash",
      "Battery & Charging": "5,000 mAh battery with 70W Ultra Fast Charging (0 to 100% in 45 mins), 3 charging modes (Low Temp, Smart, Hyper)",
      "Network & SIM": "5G SA/NSA Dual SIM (2x Nano-SIM), MTN Ghana, Telecel & AT Ghana 5G/4G Optimized, Wi-Fi 6, Bluetooth 5.3",
      "Audio & Haptics": "Dual Stereo Speakers tuned by Dolby Atmos, Hi-Res Audio Certified, X-Axis Linear Haptic Motor",
      "Operating System": "HiOS 14 based on Android 14",
      "Weight & Dimensions": "189 g | 164.0 x 74.5 x 7.7 mm"
    },
    manufacturingDetails: {
      brandName: "Tecno Mobile",
      manufacturer: "Transsion Holdings Co., Ltd. (Building 1A, Shenzhen High-Tech Park, Guangdong, China)",
      modelNumber: "Camon 30 Pro 5G - CL8",
      countryOfOrigin: "Manufactured by Transsion Holdings",
      certifications: ["NCA Ghana Certified", "Carlcare Official Authorized", "CE", "RoHS"],
      boxContents: [
        "Tecno Camon 30 Pro 5G Phone",
        "Original 70W Ultra Fast Wall Charger",
        "Braided USB Type-C Cable",
        "Protective Matte Phone Case",
        "Tempered Screen Protector",
        "SIM Ejector Pin",
        "Carlcare 13-Month Ghana Warranty Card"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "13 Months Official Carlcare Ghana Warranty",
      warrantyCoverage: "Full nationwide repair coverage handled through Carlcare Service Centers across Accra (Circle, Kwame Nkrumah Ave), Kumasi, Tamale, and Takoradi.",
      deliveryEstimate: "Greater Accra: 2–4 hours; Regional: 24–48 hours.",
      returnPolicy: "7-day replacement guarantee."
    },
    features: ["Sony IMX890 50MP OIS", "Dimensity 8200 5G", "70W Ultra Fast Charge", "13-Month Carlcare Warranty"],
    isTrending: true,
    isOnSale: true,
    discount: 10,
    shipping: {
      local: true,
      weight: "0.19kg",
      dimensions: "16.4 x 7.5 x 0.8 cm"
    }
  },

  {
    id: "PHO006",
    sku: "PHO-TECNO-SP20P-006",
    name: "Tecno Spark 20 Pro (256GB - Moonlit Black)",
    brand: "Tecno",
    manufacturer: "Transsion Holdings Co., Ltd. Shenzhen, China",
    modelNumber: "KJ6",
    countryOfOrigin: "Manufactured by Transsion Holdings",
    category: "smartphones",
    subcategory: "tecno-mobile",
    price: 1850.00,
    originalPrice: 2050.00,
    currency: "GH₵",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=450&fit=crop"
    ],
    description: "The undisputed value champion: Armed with 108MP ultra-sensing main camera with 3x lossless zoom, MediaTek Helio G99 6nm gaming processor, massive 256GB storage, smooth 120Hz IPS display with Dynamic Port notifications, stereo dual speakers with DTS sound, and 5000mAh battery with 33W fast charging.",
    specifications: {
      "Storage Capacity": "256GB Internal ROM (Expandable up to 1TB via Dedicated MicroSD slot)",
      "RAM": "8GB Physical RAM + 8GB Memory Fusion Expansion (Total 16GB)",
      "Processor": "MediaTek Helio G99 (6nm Octa-core up to 2.2 GHz, Arm Mali-G57 MC2 GPU)",
      "Display": "6.78\" FHD+ (2460 x 1080) Punch-hole Display, 120Hz Adaptive Refresh, Dynamic Port notification bar",
      "Rear Camera System": "108MP Ultra-Sensing Main Camera (1/1.67\" sensor, ƒ/1.75, 3x in-sensor lossless zoom) + AI Auxiliary Lens with Quad-LED Flash",
      "Front Camera": "32MP Glowing Selfie with Dual Micro-slit Flash (3 adjustable brightness modes)",
      "Battery & Charging": "5,000 mAh all-day battery, 33W Fast Charge (Ghana 3-pin adapter included in box)",
      "Network & SIM": "4G LTE / 3G / 2G, Triple Card Slot (2x Nano-SIM + 1x MicroSD), VoLTE enabled on MTN Ghana, Telecel & AT",
      "Audio": "DTS Stereo Dual Speakers with 400% Volume Boost and Volume Algorithm",
      "Operating System": "HiOS 13.5 based on Android 13 (Upgradable to Android 14)",
      "Durability": "IP53 splash and dust resistance, Side-mounted fast fingerprint sensor",
      "Weight & Dimensions": "190 g | 168.6 x 76.6 x 8.4 mm"
    },
    manufacturingDetails: {
      brandName: "Tecno Mobile Spark Series",
      manufacturer: "Transsion Holdings Co., Ltd. (Shenzhen, China)",
      modelNumber: "KJ6 (Tecno Spark 20 Pro)",
      countryOfOrigin: "Manufactured in China",
      certifications: ["NCA Ghana Type Approved", "Carlcare Warranty Authorized", "CE", "FCC"],
      boxContents: [
        "Tecno Spark 20 Pro Phone",
        "33W Fast Power Brick (Ghana 3-Pin BS 1363)",
        "USB Type-C Cable",
        "Protective Clear Case",
        "Pre-applied Screen Protector",
        "SIM Eject Tool",
        "13-Month Carlcare Warranty Card"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "13 Months Official Carlcare Warranty",
      warrantyCoverage: "Full genuine warranty covering mainboard, display, and camera across 40+ Carlcare service centres in Ghana.",
      deliveryEstimate: "Greater Accra: 2–3 hours; Other regions: 24–48 hours nationwide.",
      returnPolicy: "7-day return guarantee."
    },
    features: ["108MP Ultra-Sensing Camera", "Helio G99 Gaming Chipset", "Stereo Dual Speakers DTS", "33W Fast Charge Included"],
    isTrending: true,
    isOnSale: true,
    discount: 10,
    shipping: {
      local: true,
      weight: "0.19kg",
      dimensions: "16.9 x 7.7 x 0.8 cm"
    }
  },

  // ========================================
  // LAPTOPS
  // ========================================
  
  // Student Laptops
  {
    id: "LAP001",
    sku: "LAP-HP-15-001",
    name: "HP Pavilion 15 Student Laptop",
    brand: "HP",
    manufacturer: "HP Inc. Palo Alto, California, USA",
    modelNumber: "15-eg0021nr",
    countryOfOrigin: "Designed in USA, Assembled in China",
    category: "computers",
    subcategory: "student-laptops",
    price: 4500.00,
    originalPrice: 5200.00,
    currency: "GH₵",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=450&fit=crop"
    ],
    description: "Perfect for students and daily productivity with reliable 11th Gen Intel performance, long-lasting battery life, and crystal-clear FHD anti-glare display. Ideal for assignments, university research, and multimedia projects.",
    specifications: {
      "Processor": "Intel Core i5-1135G7 (4 Cores, 8 Threads, up to 4.20 GHz)",
      "RAM": "8GB DDR4-3200 MHz SDRAM",
      "Storage": "512GB PCIe NVMe M.2 SSD",
      "Display": "15.6\" Full HD (1920 x 1080) Micro-edge Anti-glare",
      "Graphics": "Intel Iris Xe Graphics",
      "Battery Life": "Up to 8 hours (41 Wh Li-ion, fast charge 50% in 45 mins)",
      "Operating System": "Windows 11 Home 64-bit",
      "Weight": "1.75 kg",
      "Connectivity": "Wi-Fi 6 (802.11ax), Bluetooth 5.0",
      "Ports": "1x USB Type-C (10Gbps), 2x USB Type-A (5Gbps), 1x HDMI 2.0, Headphone/Mic Combo"
    },
    manufacturingDetails: {
      brandName: "HP",
      manufacturer: "HP Inc. (1501 Page Mill Road, Palo Alto, CA 94304)",
      modelNumber: "15-eg0021nr / Product ID: 350E2UA#ABA",
      countryOfOrigin: "Designed in USA, Assembled in China",
      certifications: ["ENERGY STAR Certified", "EPEAT Silver Registered", "RoHS Compliant", "CE Mark"],
      boxContents: [
        "HP Pavilion 15 Laptop (Natural Silver)",
        "45W Smart AC Power Adapter",
        "UK/Ghana 3-Pin Power Cable",
        "Setup & Regulatory Guide",
        "1-Year Ghana Official Warranty Card"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "1 Year Official Manufacturer Warranty",
      warrantyCoverage: "Comprehensive parts & labor warranty covering motherboard, panel, and internal hardware faults.",
      deliveryEstimate: "Greater Accra: Same-Day Delivery (2–5 hrs); Kumasi, Takoradi & Regions: 24–48 hours via trackable courier.",
      returnPolicy: "7-day replacement guarantee for verified manufacturer defects or transit damage."
    },
    features: ["Lightweight Design", "Long Battery Life", "Fast SSD Storage", "HD Webcam with Noise Reduction"],
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
    brand: "Dell",
    manufacturer: "Dell Technologies Inc. Round Rock, Texas, USA",
    modelNumber: "Inspiron 5410-i7",
    countryOfOrigin: "Designed in USA, Assembled in China",
    category: "computers",
    subcategory: "business-laptops",
    price: 6800.00,
    originalPrice: 6800.00,
    currency: "GH₵",
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=450&fit=crop"
    ],
    description: "Professional enterprise-grade business laptop built for executives and power users. Featuring fingerprint reader security, robust aluminum lid finish, backlit keyboard, and high-speed multi-tasking.",
    specifications: {
      "Processor": "Intel Core i7-1165G7 (4 Cores, 8 Threads, up to 4.70 GHz)",
      "RAM": "16GB DDR4-3200 MHz Dual-Channel",
      "Storage": "1TB PCIe NVMe M.2 Solid State Drive",
      "Display": "14.0\" FHD (1920 x 1080) WVA Anti-Glare Narrow Border",
      "Graphics": "Intel Iris Xe Graphics with shared graphics memory",
      "Battery Life": "Up to 10 hours (54 Wh ExpressCharge)",
      "Operating System": "Windows 11 Pro 64-bit",
      "Weight": "1.44 kg",
      "Connectivity": "Intel Wi-Fi 6 2x2 (Gig+) and Bluetooth 5.1",
      "Ports": "1x USB 3.2 Gen 2 Type-C (DisplayPort/PowerDelivery), 2x USB 3.2 Gen 1 Type-A, 1x HDMI 1.4b, MicroSD Card Reader"
    },
    manufacturingDetails: {
      brandName: "Dell",
      manufacturer: "Dell Technologies (One Dell Way, Round Rock, Texas 78682, USA)",
      modelNumber: "Inspiron 5410-BZN7",
      countryOfOrigin: "Designed in USA, Assembled in China",
      certifications: ["ENERGY STAR 8.0", "MIL-STD-810H Tested", "RoHS", "WEEE", "CE Certified"],
      boxContents: [
        "Dell Inspiron 14 Laptop (Platinum Silver)",
        "65W Type-C AC Adapter",
        "Ghana Grounded Power Cord",
        "Dell Safety & Warranty Documentation"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "1 Year Dell ProSupport Onsite Warranty",
      warrantyCoverage: "Covers hardware malfunctions, logic board, and display panel through authorized Dell service centers in Ghana.",
      deliveryEstimate: "Greater Accra: 2–4 hours; Other regions: 24–48 hours nationwide.",
      returnPolicy: "7-day return policy for unopened items or replacement for verified hardware defects."
    },
    features: ["Fingerprint Reader", "Backlit Keyboard", "Enterprise Security", "Durable Aluminum Build"],
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
    brand: "ASUS",
    manufacturer: "ASUSTeK Computer Inc. Beitou District, Taipei, Taiwan",
    modelNumber: "FA506QM-HN005W",
    countryOfOrigin: "Designed in Taiwan, Assembled in China",
    category: "computers",
    subcategory: "gaming-laptops",
    price: 8900.00,
    originalPrice: 9500.00,
    currency: "GH₵",
    stock: 5,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&h=450&fit=crop"
    ],
    description: "Armed for battle: High-performance military-grade gaming rig powered by AMD Ryzen 7 and NVIDIA GeForce RTX 3060 graphics. Features fluid 144Hz IPS display, RGB gaming keyboard, and self-cleaning anti-dust cooling.",
    specifications: {
      "Processor": "AMD Ryzen 7 5800H (8 Cores, 16 Threads, 3.2 GHz base, up to 4.4 GHz boost)",
      "RAM": "16GB DDR4-3200 MHz (Expandable up to 32GB)",
      "Storage": "512GB PCIe 3.0 NVMe M.2 SSD + Open M.2 Slot for expansion",
      "Display": "15.6\" FHD (1920 x 1080) 144Hz IPS-level Adaptive-Sync",
      "Graphics": "NVIDIA GeForce RTX 3060 (6GB GDDR6 Dedicated VRAM)",
      "Battery Life": "Up to 6 hours gaming / 8 hours web browsing (90 Wh Li-ion)",
      "Operating System": "Windows 11 Home 64-bit",
      "Weight": "2.30 kg",
      "Connectivity": "Wi-Fi 6 (802.11ax) + Bluetooth 5.2, Gigabit Ethernet RJ-45",
      "Audio": "DTS:X Ultra 7.1 Virtual Surround Sound, Two-way AI Noise Cancelation"
    },
    manufacturingDetails: {
      brandName: "ASUS TUF Gaming",
      manufacturer: "ASUSTeK Computer Inc. (15, Li-Te Rd., Beitou District, Taipei 112, Taiwan)",
      modelNumber: "TUF-FA506QM",
      countryOfOrigin: "Designed in Taiwan, Assembled in China",
      certifications: ["MIL-STD-810H Military Standard Tested", "CE", "FCC", "RoHS", "WEEE"],
      boxContents: [
        "ASUS TUF Gaming A15 Laptop (Graphite Black)",
        "200W Dedicated Gaming Power Adapter",
        "Ghana Grounded Power Cable",
        "TUF Gaming Sticker Collection",
        "User Manual & Warranty Booklet"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "2 Years Global ASUS Manufacturer Warranty",
      warrantyCoverage: "Covers dedicated GPU, CPU, motherboard, high-refresh display panel, and internal thermal system.",
      deliveryEstimate: "Greater Accra: Express 2–4 hours; Kumasi, Sunyani, Takoradi: Next-day delivery.",
      returnPolicy: "7-day return/swap policy for certified manufacturing defects."
    },
    features: ["144Hz High-Refresh Display", "RGB Backlit Keyboard", "NVIDIA RTX 3060 6GB", "Military-Grade Durability"],
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
    name: "Samsung 24\" FHD Borderless Monitor",
    brand: "Samsung",
    manufacturer: "Samsung Electronics Co., Ltd. Suwon, South Korea",
    modelNumber: "LF24T350FHNXZA",
    countryOfOrigin: "Manufactured in Vietnam under Samsung QC",
    category: "computers",
    subcategory: "regular-monitors",
    price: 1200.00,
    originalPrice: 1400.00,
    currency: "GH₵",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600&h=450&fit=crop"
    ],
    description: "Sleek 3-sided borderless design delivers an expansive viewing experience. Features vivid IPS panel technology, AMD FreeSync smooth refresh, Flicker Free eye protection, and HDMI connectivity.",
    specifications: {
      "Display Size": "24\" Class (23.8\" Viewable diagonal)",
      "Resolution": "Full HD (1920 x 1080) 16:9",
      "Panel Type": "IPS (In-Plane Switching) Wide Viewing Angle 178°",
      "Refresh Rate": "75Hz with AMD FreeSync",
      "Response Time": "5ms (GTG)",
      "Brightness": "250 cd/m² (Typical)",
      "Contrast Ratio": "1000:1 (Static Contrast)",
      "Ports": "1x HDMI 1.4, 1x D-Sub (VGA)",
      "VESA Mount": "75 x 75 mm Mount Compatible",
      "Eye Care": "Eye Saver Mode, Flicker Free Technology"
    },
    manufacturingDetails: {
      brandName: "Samsung",
      manufacturer: "Samsung Electronics Co., Ltd. (129, Samsung-ro, Yeongtong-gu, Suwon-si, Gyeonggi-do, Korea)",
      modelNumber: "T35F Series (LF24T350FH)",
      countryOfOrigin: "Manufactured in Vietnam",
      certifications: ["ENERGY STAR", "TCO Certified", "Windows 10/11 Certified", "CE", "KC"],
      boxContents: [
        "Samsung 24\" IPS Monitor Panel",
        "Y-Shaped Minimalist Stand Base & Stem",
        "1.5m High-Speed HDMI Cable",
        "DC Power Adapter and Ghana Plug Cord",
        "Quick Setup Manual"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "3 Years Samsung Official Warranty",
      warrantyCoverage: "Full panel, power supply, and logic board protection handled through Samsung Ghana service centers.",
      deliveryEstimate: "Greater Accra: 2–5 hours; Regional delivery: 24–48 hours in shock-absorbent packaging.",
      returnPolicy: "7-day dead-pixel guarantee and replacement policy."
    },
    features: ["3-Sided Borderless Design", "Vivid IPS Panel", "75Hz with AMD FreeSync", "Flicker-Free Eye Care"],
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
    name: "LG 27\" UltraGear Gaming Monitor",
    brand: "LG",
    manufacturer: "LG Electronics Inc. Yeouido-dong, Seoul, South Korea",
    modelNumber: "27GN600-B",
    countryOfOrigin: "Designed in South Korea, Assembled in Indonesia",
    category: "computers",
    subcategory: "gaming-monitors",
    price: 2800.00,
    originalPrice: 2800.00,
    currency: "GH₵",
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=450&fit=crop"
    ],
    description: "Total gaming immersion: 27-inch UltraGear gaming monitor featuring lightning-fast 144Hz refresh rate, 1ms MBR response time, HDR10 color fidelity, and NVIDIA G-SYNC / AMD FreeSync Premium compatibility.",
    specifications: {
      "Display Size": "27\" Class (27.0\" Diagonal)",
      "Resolution": "Full HD (1920 x 1080) IPS",
      "Refresh Rate": "144Hz Ultra-Fast Gaming Refresh",
      "Response Time": "1ms MBR (Motion Blur Reduction)",
      "Color Gamut": "sRGB 99% (CIE1931) with HDR10 Support",
      "Sync Technology": "AMD FreeSync Premium, NVIDIA G-SYNC Compatible",
      "Ports": "2x HDMI 2.0, 1x DisplayPort 1.4, 1x 3.5mm Headphone Out",
      "Stand Adjustments": "Tilt (-5° to 15°), 100 x 100 mm VESA Mountable",
      "Gaming Features": "Black Stabilizer, Dynamic Action Sync, Crosshair Overlay"
    },
    manufacturingDetails: {
      brandName: "LG UltraGear",
      manufacturer: "LG Electronics Inc. (128 Yeoui-daero, Yeongdeungpo-gu, Seoul, 07336, South Korea)",
      modelNumber: "27GN600-B.AUS",
      countryOfOrigin: "Designed in South Korea, Assembled in Indonesia",
      certifications: ["NVIDIA G-SYNC Compatible", "AMD FreeSync Premium", "CE", "ErP", "RoHS"],
      boxContents: [
        "LG 27\" UltraGear Gaming Monitor",
        "V-Wing Gaming Stand & Base",
        "DisplayPort Cable (1.5m)",
        "Power Adapter & Ghana Mains Cord",
        "Calibration Report & User Documentation"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "2 Years LG Ghana Authorized Warranty",
      warrantyCoverage: "Zero bright dot policy + full internal electronics repair and replacement.",
      deliveryEstimate: "Greater Accra: 2–4 hours; Regional capitals: Next business day.",
      returnPolicy: "7-day replacement guarantee on defective panels."
    },
    features: ["144Hz Refresh Rate", "1ms MBR Response", "HDR10 & sRGB 99%", "G-SYNC / FreeSync Premium"],
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
    name: "Logitech MK270 Wireless Keyboard & Mouse",
    brand: "Logitech",
    manufacturer: "Logitech Europe S.A. Lausanne, Switzerland",
    modelNumber: "920-004536",
    countryOfOrigin: "Designed in Switzerland, Assembled in China",
    category: "accessories",
    subcategory: "wireless",
    price: 450.00,
    originalPrice: 550.00,
    currency: "GH₵",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=450&fit=crop"
    ],
    description: "The world's most trusted wireless combo. Enjoy reliable 2.4GHz lag-free wireless connection up to 10 meters, spill-resistant keyboard design, 8 multimedia hotkeys, and extended battery life.",
    specifications: {
      "Wireless Connectivity": "Advanced 2.4GHz with nano USB receiver (10m range)",
      "Keyboard Layout": "Full-size with numeric keypad and 8 shortcut keys",
      "Mouse Sensor": "High-definition optical tracking (1000 DPI)",
      "Battery Life": "Keyboard: up to 36 months; Mouse: up to 12 months",
      "Batteries Required": "2x AAA (Keyboard), 1x AA (Mouse) - Included",
      "Durability": "Spill-resistant design tested up to 60ml liquid",
      "Compatibility": "Windows 11, 10, ChromeOS, macOS, Linux"
    },
    manufacturingDetails: {
      brandName: "Logitech",
      manufacturer: "Logitech Europe S.A. (EPFL - Quartier de l'Innovation, Daniel Borel Innovation Center, 1015 Lausanne, Switzerland)",
      modelNumber: "MK270 Combo (M-R0049 / Y-R0042)",
      countryOfOrigin: "Designed in Switzerland, Assembled in China",
      certifications: ["CE", "FCC", "IC", "RoHS Compliant", "WEEE"],
      boxContents: [
        "Logitech Full-Size Wireless Keyboard with Foldout Legs",
        "Compact Contoured Wireless Optical Mouse",
        "Plug-and-Forget Nano USB Receiver",
        "Pre-installed Duracell Batteries",
        "User Information Leaflet"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "3 Years Limited Hardware Warranty",
      warrantyCoverage: "Direct hardware replacement for connectivity, key switch, or optical sensor faults.",
      deliveryEstimate: "Greater Accra: 2–4 hours; Nationwide Ghana: 24–48 hours.",
      returnPolicy: "7-day return guarantee."
    },
    features: ["2.4GHz Wireless up to 10m", "36-Month Keyboard Battery", "8 Multimedia Hotkeys", "Spill-Resistant Build"],
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
    name: "HAVIT RGB 5-Fan Laptop Cooling Pad",
    brand: "HAVIT",
    manufacturer: "Guangzhou Havit Technology Co., Ltd. Guangzhou, China",
    modelNumber: "HV-F2082",
    countryOfOrigin: "Manufactured in China",
    category: "accessories",
    subcategory: "laptop-cooling-pads",
    price: 180.00,
    originalPrice: 180.00,
    currency: "GH₵",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=450&fit=crop"
    ],
    description: "High-airflow laptop chiller engineered for Ghana's tropical climate. Features 5 ultra-quiet fans (1 large central 120mm fan + 4 auxiliary 70mm fans), dynamic RGB edge lighting, and 3 ergonomic height settings.",
    specifications: {
      "Fan Configuration": "1x 120mm high-flow center fan + 4x 70mm corner fans",
      "Fan Speed": "1100 ±10% RPM (whisper quiet under 26 dBA)",
      "Compatibility": "Designed for 12\" to 17.3\" laptops (MacBook, HP, Dell, ASUS)",
      "Power Connection": "Dual USB 2.0 pass-through ports (powers from laptop)",
      "Height Adjustment": "3-Level ergonomic incline settings",
      "Surface Material": "Heat-dissipating perforated metal mesh + ABS base",
      "Lighting": "Multi-mode RGB ambient perimeter lighting"
    },
    manufacturingDetails: {
      brandName: "HAVIT Gaming",
      manufacturer: "Guangzhou Havit Technology Co., Ltd. (1307 Poly World Trade Center, Guangzhou, China)",
      modelNumber: "HV-F2082 RGB CoolPad",
      countryOfOrigin: "Manufactured in China",
      certifications: ["CE", "FCC", "RoHS"],
      boxContents: [
        "HAVIT 5-Fan RGB Laptop Cooling Pad",
        "Braided USB-A to USB-A Power Cable",
        "Anti-Skid Front Retention Baffles",
        "User Documentation"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "1 Year Official Replacement Warranty",
      warrantyCoverage: "Full coverage for fan motors, LED strip, and USB pass-through ports.",
      deliveryEstimate: "Greater Accra: 2–4 hours; Regional capitals: 24–48 hours.",
      returnPolicy: "7-day return guarantee."
    },
    features: ["5 High-Speed Quiet Fans", "Dual USB Pass-Through", "3 Ergonomic Heights", "Perforated Metal Mesh"],
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
    name: "Redragon H510 Zeus Gaming Headset",
    brand: "Redragon",
    manufacturer: "Eastern Times Technology Co., Ltd. Dongguan, China",
    modelNumber: "H510-ZEUS-PRO",
    countryOfOrigin: "Designed in USA & China, Manufactured in China",
    category: "accessories",
    subcategory: "headsets-speakers",
    price: 320.00,
    originalPrice: 400.00,
    currency: "GH₵",
    stock: 28,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=450&fit=crop"
    ],
    description: "Pro-level studio audio immersion for gamers and music producers. Featuring 53mm neodymium dynamic audio drivers, detachable noise-canceling condenser microphone, 7.1 virtual surround sound, and memory foam ear pads.",
    specifications: {
      "Audio Drivers": "53mm Neodymium drivers with composite diaphragm",
      "Frequency Response": "20Hz – 20,000Hz",
      "Impedance": "64Ω ±15%",
      "Sensitivity": "110 ±3dB",
      "Microphone": "Detachable omnidirectional with noise cancellation",
      "Connectivity": "USB Audio Box with 7.1 Virtual Surround + 3.5mm Gold-Plated Jack",
      "Compatibility": "PC, Mac, PS5, Xbox Series X/S, Nintendo Switch, Mobile",
      "Ear Cushions": "Premium memory foam wrapped in breathable leatherette"
    },
    manufacturingDetails: {
      brandName: "Redragon",
      manufacturer: "Eastern Times Technology Co., Ltd. (Nan Shan District, Shenzhen & Dongguan Facility, China)",
      modelNumber: "H510-ZEUS-BK",
      countryOfOrigin: "Manufactured in China",
      certifications: ["CE", "FCC", "RoHS", "Hi-Res Audio Certified"],
      boxContents: [
        "Redragon H510 Zeus Gaming Headset",
        "Detachable Noise-Canceling Microphone with Windscreen Pop Filter",
        "USB In-line Audio Control Box (Mute/Volume/7.1)",
        "3.5mm Braided Audio Cable (1.2m)",
        "3.5mm Y-Splitter Cable for PC",
        "Storage Carry Bag"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "1 Year Redragon Official Warranty",
      warrantyCoverage: "Covers dynamic drivers, microphone electronics, and internal cabling.",
      deliveryEstimate: "Greater Accra: 2–4 hours; Regional: 24–48 hours.",
      returnPolicy: "7-day return guarantee."
    },
    features: ["53mm Neodymium Drivers", "7.1 Virtual Surround Sound", "Detachable Noise-Canceling Mic", "Multi-Platform Compatibility"],
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
    name: "Universal Laptop Power Adapter 65W",
    brand: "Anker",
    manufacturer: "Anker Innovations Limited. Changsha, Hunan, China",
    modelNumber: "A2054-UNIV",
    countryOfOrigin: "Designed in USA, Manufactured in China",
    category: "cables-power",
    subcategory: "laptop-chargers",
    price: 280.00,
    originalPrice: 350.00,
    currency: "GH₵",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=450&fit=crop"
    ],
    description: "All-in-one charging solution: High-efficiency 65W universal laptop charger bundled with 8 interchangeable barrel tips compatible with HP, Dell, Lenovo, Acer, ASUS, and Toshiba laptops. Built-in MultiProtect surge and heat sensors.",
    specifications: {
      "Input Voltage": "100-240V AC ~ 50/60Hz (Worldwide travel compatible)",
      "Output Rating": "19V/3.42A, 19.5V/3.33A, 20V/3.25A (65W Max)",
      "Adapters Included": "8 Interlocking barrel tips (4.5mm blue tip, 7.4mm big pin, yellow tip, etc.)",
      "Cable Length": "Total 2.7m reach (1.5m DC cord + 1.2m AC power cord)",
      "Safety Circuit": "Over-voltage, short-circuit, over-current & thermal protection",
      "Plug Standard": "Ghana standard BS 1363 3-Pin fused plug"
    },
    manufacturingDetails: {
      brandName: "Anker Power",
      manufacturer: "Anker Innovations Limited (Room 1318-19, Hollywood Plaza, 610 Nathan Road, Mongkok, Kowloon)",
      modelNumber: "A2054-GH65",
      countryOfOrigin: "Manufactured in China",
      certifications: ["CE Certified", "UL Listed", "FCC", "RoHS", "BS 1363 Fused"],
      boxContents: [
        "65W Universal Power Brick with Reinforced Strain Relief",
        "8-Piece Color-Coded Precision Barrel Tips",
        "Ghana Fused 3-Pin AC Mains Cable",
        "Tip Compatibility Manual & Guide"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "18 Months Official Anker Replacement Warranty",
      warrantyCoverage: "Full replacement against power surges, internal transformer failure, and barrel tip breakage.",
      deliveryEstimate: "Greater Accra: 2–3 hours; Nationwide: 24–48 hours.",
      returnPolicy: "7-day return guarantee."
    },
    features: ["Universal 8-Tip Compatibility", "MultiProtect Safety System", "2.7m Extra Long Reach", "Ghana Fused 3-Pin Plug"],
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
    name: "Baseus 100W PD Braided USB-C Cable (1.2m)",
    brand: "Baseus",
    manufacturer: "Shenzhen Times Innovation Technology Co., Ltd. Shenzhen, China",
    modelNumber: "CATKLF-GG1",
    countryOfOrigin: "Manufactured in China",
    category: "cables-power",
    subcategory: "usb-cables",
    price: 85.00,
    originalPrice: 85.00,
    currency: "GH₵",
    stock: 100,
    images: [
      "src/assets/images/usb_c_cable.jpg",
      "src/assets/images/usb_c_cable_2.jpg",
      "src/assets/images/usb_c_connectors.jpg"
    ],
    description: "Heavy-duty ultra-fast 100W Power Delivery cable featuring E-Marker intelligent power regulation chip. Fast-charges MacBook Pro, Dell XPS, HP laptops, and smartphones at maximum rated speed with 480Mbps data sync.",
    specifications: {
      "Max Power Delivery": "100W (20V/5A) Power Delivery 3.0 / Quick Charge 4.0+",
      "Smart Chip": "Integrated E-Marker chip for auto power regulation",
      "Data Transfer Rate": "480 Mbps high-speed data transfer",
      "Cable Length": "1.2 meters (3.9 feet)",
      "Braiding Material": "High-density nylon weave with zinc alloy connector shells",
      "Bend Testing": "Tested to withstand over 20,000+ 90-degree bend cycles",
      "Compatibility": "Laptops (MacBook, Dell, HP, ThinkPad), iPad Pro, Samsung Galaxy, Pixel"
    },
    manufacturingDetails: {
      brandName: "Baseus",
      manufacturer: "Shenzhen Times Innovation Technology Co., Ltd. (5th Floor, Building B, Baseus Intelligence Park, Bantian, Longgang, Shenzhen)",
      modelNumber: "CATKLF-100W",
      countryOfOrigin: "Manufactured in China",
      certifications: ["USB-IF Certified", "CE", "FCC", "RoHS Compliant"],
      boxContents: [
        "Baseus 100W USB-C to USB-C Fast Charging Cable (1.2m)",
        "Integrated Reusable Hook-and-Loop Cable Tie",
        "Authenticity Verification Hologram & Card"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "1 Year Official Warranty",
      warrantyCoverage: "Free replacement for internal conductor failure or connector pin issues.",
      deliveryEstimate: "Greater Accra: 2–3 hours; Other regions: 24–48 hours.",
      returnPolicy: "7-day return guarantee."
    },
    features: ["100W Fast Power Delivery", "E-Marker Smart Chip", "20,000+ Bend Durability", "Zinc Alloy Connectors"],
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
    name: "Kingston 8GB DDR4 3200MHz SODIMM RAM",
    brand: "Kingston",
    manufacturer: "Kingston Technology Company, Inc. Fountain Valley, California, USA",
    modelNumber: "KVR32S22S8/8",
    countryOfOrigin: "Designed in USA, Assembled in Taiwan",
    category: "pc-components",
    subcategory: "ram",
    price: 420.00,
    originalPrice: 480.00,
    currency: "GH₵",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=450&fit=crop"
    ],
    description: "Instantly supercharge your laptop's multi-tasking speed. Genuine Kingston ValueRAM standard 8GB 3200MHz DDR4 Non-ECC memory module engineered and 100% factory-tested to JEDEC industry specifications.",
    specifications: {
      "Memory Capacity": "8GB (Single Module 1Rx8)",
      "Memory Type": "DDR4 SODIMM (260-Pin for Laptops & Mini PCs)",
      "Frequency Speed": "3200 MHz (PC4-25600, backwards compatible with 2666/2400MHz)",
      "CAS Latency": "CL22 (22-22-22)",
      "Operating Voltage": "1.2V (standard low energy consumption)",
      "Module Form Factor": "SODIMM standard height 30.00mm",
      "Compatibility": "All modern Intel & AMD laptop motherboards"
    },
    manufacturingDetails: {
      brandName: "Kingston ValueRAM",
      manufacturer: "Kingston Technology Corporation (17600 Newhope Street, Fountain Valley, CA 92708, USA)",
      modelNumber: "KVR32S22S8/8",
      countryOfOrigin: "Designed in USA, Assembled in Taiwan",
      certifications: ["JEDEC Standard Compliant", "RoHS", "WEEE", "CE Certified"],
      boxContents: [
        "Kingston 8GB DDR4 3200MHz SODIMM Memory Module in Anti-Static Clamshell",
        "Installation & Handling Guide",
        "Genuine Holographic Security Seal"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "Lifetime Manufacturer Limited Warranty",
      warrantyCoverage: "Free replacement for any memory cell degradation or JEDEC timing fault.",
      deliveryEstimate: "Greater Accra: Same-Day Delivery; Nationwide: 24–48 hours.",
      returnPolicy: "7-day compatibility swap policy (bring your laptop to our East Legon hub for free testing)."
    },
    features: ["3200MHz High-Speed Clock", "100% Factory Tested", "Low 1.2V Power Draw", "Lifetime Warranty"],
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
    name: "Samsung 870 EVO 500GB 2.5\" SATA SSD",
    brand: "Samsung",
    manufacturer: "Samsung Electronics Co., Ltd. Suwon, South Korea",
    modelNumber: "MZ-77E500B/AM",
    countryOfOrigin: "Manufactured in South Korea",
    category: "pc-components",
    subcategory: "internal-ssds",
    price: 650.00,
    originalPrice: 750.00,
    currency: "GH₵",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=450&fit=crop"
    ],
    description: "The gold standard of SATA SSDs: Unleash peak SATA performance up to 560MB/s sequential read speeds. Powered by Samsung 6th Gen V-NAND and MKX controller, offering unbeatable reliability for everyday computing and heavy workflows.",
    specifications: {
      "Storage Capacity": "500GB",
      "Form Factor": "2.5 Inch SATA III (6 Gb/s, compatible with SATA II/I)",
      "Sequential Read Speed": "Up to 560 MB/s",
      "Sequential Write Speed": "Up to 530 MB/s",
      "Memory Architecture": "Samsung V-NAND 3-bit MLC (TLC) with Samsung MKX Controller",
      "Cache Memory": "Samsung 512MB Low Power DDR4 SDRAM",
      "Endurance Rating": "300 Terabytes Written (TBW)",
      "Data Security": "AES 256-bit Hardware Encryption (Class 0), TCG/Opal, IEEE1667"
    },
    manufacturingDetails: {
      brandName: "Samsung Solid State Drive",
      manufacturer: "Samsung Electronics Co., Ltd. (129, Samsung-ro, Suwon-si, Gyeonggi-do, Korea)",
      modelNumber: "870 EVO 500GB (MZ-77E500)",
      countryOfOrigin: "Made in Korea",
      certifications: ["CE", "FCC", "VCCI", "RCM", "RoHS", "KCC"],
      boxContents: [
        "Samsung 870 EVO 500GB 2.5\" Internal Solid State Drive",
        "Samsung Magician Software Activation Guide",
        "Warranty Statement and Safety Manual"
      ]
    },
    warrantyAndShipping: {
      warrantyPeriod: "5 Years Official Limited Warranty or 300 TBW",
      warrantyCoverage: "Full drive replacement covering controller, NAND flash cells, and data retention integrity.",
      deliveryEstimate: "Greater Accra: 2–4 hours; Regional: 24–48 hours.",
      returnPolicy: "7-day return guarantee for sealed packaging."
    },
    features: ["560MB/s Sequential Read", "Samsung 6th Gen V-NAND", "300 TBW High Endurance", "AES 256-bit Hardware Encryption"],
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
    id: "smartphones",
    name: "📱 Smartphones & Mobile",
    icon: "📱",
    subcategories: [
      { id: "all-smartphones", name: "All Mobile Phones" },
      { id: "iphone-apple", name: "Apple iPhone" },
      { id: "samsung-galaxy", name: "Samsung Galaxy" },
      { id: "tecno-mobile", name: "Tecno Mobile" }
    ]
  },
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
    product.sku.toLowerCase().includes(searchTerm) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
    (product.modelNumber && product.modelNumber.toLowerCase().includes(searchTerm)) ||
    (product.category && product.category.toLowerCase().includes(searchTerm)) ||
    (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm))
  );
}

function getProductById(id) {
  return products.find(product => product.id === id);
}

// Export for use in Node.js backend & browser environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    products,
    categories,
    getProductsByCategory,
    getProductsBySubcategory,
    getTrendingProducts,
    getOnSaleProducts,
    searchProducts,
    getProductById
  };
}