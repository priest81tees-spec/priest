// Product data for PRIEST store
// products.js
const products = [
    {
        id: "1",
        name: "PRIEST White Tee",
        price: 150.00,
        category: "T-Shirts",
        description: "White tee with crown and cityscape design. Power rises in every street territory.",
        image: "img/white.jpeg",
        sizes: ["S", "M", "L", "XL"],
        color: "White"
    },
    {
        id: "2",                     // 🔹 changed from "1" to "2"
        name: "PRIEST Black Tee",
        price: 150.00,
        category: "T-Shirts",
        description: "Premium black cotton tee featuring intricate praying hands graphic with urban skyline backdrop.",
        image: "img/Black.jpeg",
        sizes: ["S", "M", "L", "XL", "XXL"],
        color: "Black"
    },
];

// Expose globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
}