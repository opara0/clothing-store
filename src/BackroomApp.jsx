import { Navigate, Route, Routes } from 'react-router'
import Backroom from './components/Backroom'
import Orders from './components/admin components/Orders'
import Products from './components/admin components/Products'
import OrderDetail from './components/admin components/OrderDetail'

export default function BackroomApp() {
    return (
        <Routes>
            <Route path="/" element={<Backroom><Products /></Backroom>} />
            <Route path="/products" element={<Backroom><Products /></Backroom>} />
            <Route path="/orders" element={<Backroom><Orders /></Backroom>} />
            <Route path="/orders/:id" element={<Backroom><OrderDetail /></Backroom>} />
            <Route path="/add-product" element={<Backroom />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
    )
}
