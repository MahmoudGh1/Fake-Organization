import React from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { Button } from "../../components/common/Button";

export const OrderCRUD = ({ orders, loading, onCancelOrder }) => {
	if (loading) {
		return (
			<div className="p-12 text-center text-xs text-luxury-muted font-light flex items-center justify-center space-x-2 bg-white rounded border border-luxury-dark/5">
				<RefreshCw size={14} className="animate-spin text-luxury-gold" />
				<span>Synchronizing Database Node Clusters...</span>
			</div>
		);
	}

	if (orders.length === 0) {
		return <div className="p-12 text-center text-xs text-luxury-muted font-light bg-white rounded border border-luxury-dark/5">No active database records found under this profile signature.</div>;
	}

	return (
		<div className="bg-white rounded border border-luxury-dark/5 shadow-md overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="bg-luxury-dark text-white text-[10px] uppercase font-bold tracking-wider border-b border-luxury-dark/10">
							<th className="p-4">Manifest Document ID</th>
							<th className="p-4">Allocated Elements</th>
							<th className="p-4">Ledger Total</th>
							<th className="p-4">Logistics State</th>
							<th className="p-4 text-right">Database Operations</th>
						</tr>
					</thead>
					<tbody className="text-xs divide-y divide-luxury-dark/5">
						{orders.map((order) => (
							<tr key={order._id} className="hover:bg-luxury-bg/30 transition-colors">
								<td className="p-4 font-mono font-medium text-luxury-dark">{order._id}</td>
								<td className="p-4 font-light text-luxury-muted space-y-1">
									{order.items?.map((item, idx) => (
										<div key={idx}>
											• {item.name || `Product Element ID: ${item.productId}`} <span className="font-mono text-[11px] font-semibold text-luxury-dark">x{item.quantity}</span>
										</div>
									))}
								</td>
								<td className="p-4 font-bold text-luxury-dark">${order.totalAmount?.toLocaleString()}</td>
								<td className="p-4">
									<span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${order.status === "Delivered" ? "bg-green-100 text-green-800" : order.status === "Shipped" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>{order.status}</span>
								</td>
								<td className="p-4 text-right">
									<Button variant="danger" onClick={() => onCancelOrder(order._id)} className="inline-flex h-8 px-2.5">
										<Trash2 size={12} className="mr-1" />
										<span>Purge Document</span>
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
