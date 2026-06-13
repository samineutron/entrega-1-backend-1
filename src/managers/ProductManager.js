const fs = require('fs').promises;

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async getProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async saveProducts(products) {
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    }

    async getProductById(pid) {
        const products = await this.getProducts();
        return products.find(product => String(product.id) === String(pid));
    }

    async addProduct(productData) {
        const products = await this.getProducts();

        const {
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        } = productData;

        if (
            !title ||
            !description ||
            !code ||
            price === undefined ||
            status === undefined ||
            stock === undefined ||
            !category ||
            !Array.isArray(thumbnails)
        ) {
            throw new Error('Faltan campos obligatorios o thumbnails no es un array');
        }

        const existsCode = products.some(product => product.code === code);
        if (existsCode) {
            throw new Error('El code ya existe');
        }

        const newId =
            products.length > 0
            ? Math.max(...products.map(product => Number(product.id))) + 1
            : 1;

        const newProduct = {
            id: newId,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        };

        products.push(newProduct);
        await this.saveProducts(products);

        return newProduct;
    }

    async updateProduct(pid, updates) {
        const products = await this.getProducts();
        const index = products.findIndex(product => String(product.id) === String(pid));

        if (index === -1) return null;

        delete updates.id;

        products[index] = {
            ...products[index],
            ...updates,
            id: products[index].id
        };

        await this.saveProducts(products);
        return products[index];
    }

    async deleteProduct(pid) {
        const products = await this.getProducts();
        const filteredProducts = products.filter(product => String(product.id) !== String(pid));

        if (products.length === filteredProducts.length) {
            return false;
        }

        await this.saveProducts(filteredProducts);
        return true;
    }
}

module.exports = ProductManager;