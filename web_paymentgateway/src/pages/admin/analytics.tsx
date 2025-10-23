import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Order, MongoOrder } from '@/types';
import clientPromise from '@/lib/mongodb';
import { format } from 'date-fns';

// Import necessary components from Chart.js and the React wrapper
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register the components you will use with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage({ orders }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [timeframe, setTimeframe] = useState<'day' | 'month'>('day');
  const [metric, setMetric] = useState<'revenue' | 'purchases'>('revenue');
    
  const [chartData, setChartData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  });

  
  // This effect will re-calculate the chart data whenever the user changes the filters
  useEffect(() => {
    const processData = () => {
      const dataMap = new Map<string, { revenue: number; purchases: number }>();
      const dateFormat = timeframe === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM';
      
      // Aggregate data by the selected timeframe
      for (const order of orders) {
        const dateKey = format(new Date(order.createdAt), dateFormat);
        if (!dataMap.has(dateKey)) {
          dataMap.set(dateKey, { revenue: 0, purchases: 0 });
        }
        const current = dataMap.get(dateKey)!;
        current.revenue += order.totalAmount;
        current.purchases += 1;
      }
      
      // Sort the keys (dates) chronologically
      const sortedKeys = Array.from(dataMap.keys()).sort();
      
      // Prepare data for Chart.js
      const labels = sortedKeys;
      const data = sortedKeys.map(key => dataMap.get(key)![metric]);
      
      setChartData({
        labels,
        datasets: [{
          label: `${metric === 'revenue' ? 'Revenue' : 'Total Purchases'} per ${timeframe}`,
          data,
          backgroundColor: 'rgba(79, 70, 229, 0.7)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1,
        }],
      });
    };

    if (orders.length > 0) {
      processData();
    }
  }, [orders, timeframe, metric]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Analytics by ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
        font: { size: 18 },
      },
    },
  };

  return (
    <AdminLayout pageTitle="Analytics">
      <div className="p-6 bg-white rounded-lg shadow space-y-6">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex rounded-md shadow-sm">
            <button onClick={() => setMetric('revenue')} className={`px-4 py-2 text-sm font-medium rounded-l-md ${metric === 'revenue' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Revenue</button>
            <button onClick={() => setMetric('purchases')} className={`-ml-px px-4 py-2 text-sm font-medium rounded-r-md ${metric === 'purchases' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Total Purchases</button>
          </div>
          <div className="flex rounded-md shadow-sm">
            <button onClick={() => setTimeframe('day')} className={`px-4 py-2 text-sm font-medium rounded-l-md ${timeframe === 'day' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Daily</button>
            <button onClick={() => setTimeframe('month')} className={`-ml-px px-4 py-2 text-sm font-medium rounded-r-md ${timeframe === 'month' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Monthly</button>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-96">
          {orders.length > 0 ? (
            <Bar options={chartOptions} data={chartData} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No data available to display.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// Fetch data on the server-side, just like on the transactions page
export const getServerSideProps: GetServerSideProps<{ orders: Order[] }> = async () => {
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
    console.error("Error in getServerSideProps for analytics:", error);
    return { props: { orders: [] } };
  }
};