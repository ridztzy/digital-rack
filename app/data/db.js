// app/data/db.js

// Mock Data untuk Produk
export const products = [
  {
    id: 1,
    name: 'Template Desain Grafis Pro',
    description: 'Koleksi template premium untuk Photoshop dan Illustrator.',
    price: 'Rp 150.000',
    imageUrl: 'https://placehold.co/600x400/3B82F6/FFFFFF?text=Template',
  },
  {
    id: 2,
    name: 'E-book "AI untuk Bisnis"',
    description: 'Panduan lengkap memanfaatkan AI untuk meningkatkan profit.',
    price: 'Rp 99.000',
    imageUrl: 'https://placehold.co/600x400/2563EB/FFFFFF?text=E-book',
  },
  {
    id: 3,
    name: 'Lisensi Software "Analytic Pro"',
    description: 'Lisensi seumur hidup untuk software analisis data terbaik.',
    price: 'Rp 450.000',
    imageUrl: 'https://placehold.co/600x400/1E40AF/FFFFFF?text=Software',
  },
];

// Mock Data untuk Testimoni
export const testimonials = [
  {
    id: 1,
    quote: 'Produknya sangat membantu pekerjaan saya sebagai desainer. Akses instan dan kualitasnya luar biasa!',
    name: 'Andi Pratama',
    title: 'Graphic Designer',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  },
  {
    id: 2,
    quote: 'Pembelian sangat mudah dan cepat. Customer support-nya juga sangat responsif saat saya ada pertanyaan.',
    name: 'Citra Lestari',
    title: 'Digital Marketer',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
  },
];

// Mock Data untuk FAQ
export const faqData = [
    {
        question: "Bagaimana cara mengunduh produk setelah pembelian?",
        answer: "Setelah pembayaran berhasil, Anda akan langsung menerima email berisi link unduhan produk. Link tersebut juga akan tersedia di halaman riwayat pembelian Anda."
    },
    {
        question: "Metode pembayaran apa saja yang didukung?",
        answer: "Kami mendukung berbagai metode pembayaran, termasuk transfer bank, kartu kredit (Visa, Mastercard), dan e-wallet (GoPay, OVO, Dana)."
    },
    {
        question: "Apakah ada garansi atau kebijakan pengembalian?",
        answer: "Karena sifat produk digital, kami tidak menawarkan pengembalian dana. Namun, jika Anda mengalami masalah teknis dengan produk, tim support kami siap membantu Anda 24/7."
    },
    {
        question: "Apakah lisensi produk bisa digunakan untuk komersial?",
        answer: "Ya, sebagian besar produk kami datang dengan lisensi komersial. Harap periksa detail lisensi pada halaman masing-masing produk untuk informasi lebih lengkap."
    }
];
