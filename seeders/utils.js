const { default: faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const cluster = require('cluster');
const os = require('os');
const { Products } = require('database/models/products');
const { ReferencedOrders } = require('database/models/referencedOrders');
const { UnshardedOrders } = require('database/models/unshardedOrders');
const dotenv = require('dotenv');
const {
    UnshardedReferencedOrders
} = require('database/models/unshardedReferencedOrders');
const { getMongoUri } = require('utils/mongoConstants');

const totalCPUs = os.cpus().length;
function createProduct(dontCreate) {
    const product = {
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price()) * 100,
        category: faker.commerce.department()
    };
    if (dontCreate) {
        return product;
    }
    return Products.create(product);
}

function createOrderWithProductReferenced(products) {
    const totalPrice = products.reduce(
        (total, product) => total + product.price,
        0
    );
    const order = {
        purchasedProducts: products.map(p => p._id),
        totalPrice
    };
    return ReferencedOrders.create(order);
}

function createOrder(products, dontCreate, referenced) {
    const totalPrice = products.reduce(
        (total, product) => total + product.price,
        0
    );
    const order = {
        purchasedProducts: products,
        totalPrice
    };
    if (dontCreate) {
        return order;
    }
    let model = UnshardedOrders;
    if (referenced) {
        model = UnshardedReferencedOrders;
    }
    return model.create(order);
}
function connectToMongo() {
    const envName = process.env.ENVIRONMENT_NAME || 'local';
    console.log('connecting to mongo', envName);
    dotenv.config({ path: `.env.${envName}` });
    return mongoose.connect(getMongoUri());
}
async function runSeeders(func) {
    let runInClusterMode = false;
    if (process.argv.length >= 3) {
        const runInClusterModeFlag = process.argv[2];
        try {
            runInClusterMode = JSON.parse(runInClusterModeFlag);
        } catch (err) {
            // no need to handle
        }
    }
    if (runInClusterMode && cluster.isMaster) {
        console.log(`Number of CPUs is ${totalCPUs}`);
        console.log(`Master ${process.pid} is running`);

        // Fork workers.
        for (let i = 0; i < totalCPUs; i++) {
            cluster.fork();
        }
    } else {
        await func();
    }

    if (!runInClusterMode) {
        console.log('done');
        process.exit(1);
    }
}
module.exports = {
    createProduct,
    createOrder,
    createOrderWithProductReferenced,
    connectToMongo,
    runSeeders
};
