import { supabase } from './supabase'

export async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, category, price, stock, description, image_url')
        .gt('stock', 0)
        .order('name')

    if (error) throw error
    return data
}