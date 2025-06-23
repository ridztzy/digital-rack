// app/admin/(dashboard)/products/page.js
import { PlusCircle } from 'lucide-react';
import { products } from '../../data';

export default function ProductsPage() {
    const getStatusClass = (status) => {
        return status === 'Aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Manajemen Produk</h2>
                <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <PlusCircle size={20} className="mr-2" />
                    Tambah Produk
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="p-4">Nama Produk</th>
                                <th className="p-4">Harga</th>
                                <th className="p-4">Jenis</th>
                                <th className="p-4">File</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-300">
                            {products.map(product => (
                                <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 font-semibold">{product.name}</td>
                                    <td className="p-4">{product.price}</td>
                                    <td className="p-4">{product.type}</td>
                                    <td className="p-4"><a href="#" className="text-blue-500 hover:underline">{product.file}</a></td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(product.status)}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium">
                                        <button className="text-blue-500 hover:text-blue-700 mr-4">Edit</button>
                                        <button className="text-red-500 hover:text-red-700">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
