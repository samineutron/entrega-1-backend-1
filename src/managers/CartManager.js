const fs = require('fs').promises;

class CartManager {
    constructor(path) {
        this.path = path;
    }

    async getCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async saveCarts(carts) {
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    }

    async createCart() {
        const carts = await this.getCarts();

        const newId =
            carts.length > 0
            ? Math.max(...carts.map(cart => Number(cart.id))) + 1
            : 1;

        const newCart = {
            id: newId,
            products: []
        };

        carts.push(newCart);
        await this.saveCarts(carts);

        return newCart;
    }

    async getCartById(cid) {
        const carts = await this.getCarts();
        return carts.find(cart => String(cart.id) === String(cid));
    }

    async addProductToCart(cid, pid) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(cart => String(cart.id) === String(cid));

        if (cartIndex === -1) return null;

        const productIndex = carts[cartIndex].products.findIndex(
            item => String(item.product) === String(pid)
        );

        if (productIndex === -1) {
            carts[cartIndex].products.push({
                product: pid,
                quantity: 1
        });
        } else {
            carts[cartIndex].products[productIndex].quantity += 1;
        }

        await this.saveCarts(carts);
        return carts[cartIndex];
    }
}

module.exports = CartManager;