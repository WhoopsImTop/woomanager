import axios from "axios";
import store from "../store";

export default class ScanClass {
    constructor(ean) {
        this.ean = ean;
        this.timestamp = new Date().toLocaleTimeString("de-DE");
        this.status = "";
        this.todoID = null;
        this.Anzahl = 1;
    }

    checkProductsforEan() {
        return new Promise((resolve, reject) => {
            const product = store.state.products.find(
                (product) => product.ean_code === this.ean
            );
            console.log(product);
            try {
                if (product) {
                    product.stock_quantity = product.stock_quantity - 1;
                    product.updateProduct(product);
                    this.status = "gefunden";
                    store.state.foundScans.unshift(product);
                    store.state.scans.unshift(this);
                    resolve(this);
                } else {
                    this.status = "nicht gefunden";
                    this.uploadFailedEAN();
                    store.state.foundScans.unshift(this);
                    store.state.scans.unshift(this);
                    resolve(this);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    updateProduct(product) {
        return new Promise((resolve, reject) => {
            axios.put(
                    `${localStorage.getItem("shopURL")}/wp-json/wc/v3/products/${
          product.id
        }?consumer_key=${localStorage.getItem(
          "ck"
        )}&consumer_secret=${localStorage.getItem("cs")}`
                ),
                product
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    uploadFailedEAN() {
        store.state.socket.emit("addTodo", {
            EAN: this.ean,
            Status: this.status,
        });
    }

    deleteScan() {
        if (this.status === "nicht gefunden") {
            return new Promise((resolve, reject) => {
                axios
                    .patch(`https://bindis.rezept-zettel.de/api/scans/${this.todoID}`, {
                        Anzahl: this.Anzahl - 1,
                    })
                    .then((response) => {
                        resolve(response);
                        store.state.scans.splice(store.state.scans.indexOf(this), 1);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        } else {
            const product = store.state.products.find(
                (product) => product.ean_code === this.ean
            );
            product.stock_quantity = product.stock_quantity + 1;
            product.updateProduct(product);
            store.state.scans.splice(store.state.scans.indexOf(this), 1);
            store.state.foundScans.splice(store.state.foundScans.indexOf(this), 1);
        }
    }
}