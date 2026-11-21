import { supabase } from './supabase'

let productsRequest

export async function getProducts() {
    if (!productsRequest) {
        productsRequest = supabase
            .from('products')
            .select('id, name, category, price, stock, description, image_url')
            .then(({ data, error }) => {
                if (error) throw error
                return data
            })
            .catch((error) => {
                productsRequest = undefined
                throw error
            })
    }

    return productsRequest
}