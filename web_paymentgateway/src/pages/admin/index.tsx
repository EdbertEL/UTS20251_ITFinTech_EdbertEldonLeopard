import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Order, MongoOrder } from '@/types';
import clientPromise from '@/lib/mongodb';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'; // Import icons for the dropdown

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper function to style the status badge
const getStatusBadge = (status: Order['status']) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TransactionsPage({ orders }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // State to keep track of the currently expanded order ID
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Function to toggle the expanded row
  const handleRowClick = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null); // Collapse if it's already open
    } else {
      setExpandedOrderId(orderId); // Expand the new one
    }
  };

  return (
    <AdminLayout pageTitle="Transactions">
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 w-12"></th> {/* Empty header for dropdown icon */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const isExpanded = expandedOrderId === order._id;

                return (
                  // Use React.Fragment to group the two rows for each order
                  <>
                    {/* Main Summary Row */}
                    <tr key={order._id} onClick={() => handleRowClick(order._id)} className="cursor-pointer hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" title={order._id}>{order._id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-CA')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName || 'Guest / Old Order'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalItems}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(order.status)}`}>{order.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{isExpanded ? <FiChevronUp /> : <FiChevronDown />}</td>
                    </tr>

                    {/* Collapsible Details Row */}
                    {isExpanded && (
                      <tr key={`${order._id}-details`}>
                        <td colSpan={7} className="p-0">
                          <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Products List */}
                            <div className="md:col-span-2">
                              <h4 className="font-semibold text-gray-700 mb-2">Products Ordered</h4>
                              <ul className="space-y-2 text-gray-500">
                                {order.items.map((item) => (
                                  <li key={item.productId} className="flex justify-between border-b pb-1">
                                    <span>{item.name} (x{item.quantity})</span>
                                    <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {/* Order Details */}
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Order Details</h4>
                              <div className="space-y-1 text-gray-500 text-sm">
                                <p><strong>Address:</strong> {order.shippingAddress}</p>
                                <p><strong>Order Time:</strong> {new Date(order.createdAt).toLocaleTimeString('en-GB')}</p>
                                <p><strong>Subtotal:</strong> {formatCurrency(order.subtotal)}</p>
                                <p><strong>Tax (10%):</strong> {formatCurrency(order.tax)}</p>
                                <p><strong>Shipping:</strong> {formatCurrency(order.shipping)}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

// getServerSideProps remains the same - no changes needed here
export const getServerSideProps: GetServerSideProps<{ orders: Order[] }> = async () => {
  // ... (Your existing, correct getServerSideProps logic)
  try {
    const client = await clientPromise;
    const db = client.db('paymentDB');
    const ordersCollection = db.collection<MongoOrder>('orders');
    const rawOrders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();

    const orders: Order[] = rawOrders.map((order) => ({
      ...order,
      _id: order._id.toString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    return { props: { orders } };
  } catch (error) {
    console.error("Error in getServerSideProps for admin index:", error);
    return { props: { orders: [] } };
  }
};