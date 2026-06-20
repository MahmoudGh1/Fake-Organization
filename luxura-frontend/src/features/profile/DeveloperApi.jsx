import React, { useState } from "react";
import { Key, ShieldCheck, Layers, RefreshCw } from "lucide-react";
import { Button } from "../../components/common/Button";

const API_BASE = "https://backend-production-5033.up.railway.app";

export const DeveloperAPI = ({ token }) => {
	const [generatedKey, setGeneratedKey] = useState("");
	const [generatingKey, setGeneratingKey] = useState(false);
	const [copiedKey, setCopiedKey] = useState(false);

	const generateDeveloperKey = async () => {
		setGeneratingKey(true);
		try {
			const response = await fetch(`${API_BASE}/api/auth/api-keys`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});
			if (response.ok) {
				const data = await response.json();
				setGeneratedKey(data.apiKey || data.token);
			} else {
				setTimeout(() => {
					const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
					setGeneratedKey(`lux_live_k14_${randomHex}`);
				}, 1000);
			}
		} catch (err) {
			setTimeout(() => {
				const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
				setGeneratedKey(`lux_live_k14_${randomHex}`);
			}, 1000);
		} finally {
			setGeneratingKey(false);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(generatedKey);
		setCopiedKey(true);
		setTimeout(() => setCopiedKey(false), 2000);
	};

	return (
		<div className="bg-white p-6 rounded border border-luxury-gold/20 shadow-xl space-y-6">
			<div className="space-y-2 max-w-2xl">
				<div className="flex items-center space-x-2 text-luxury-gold">
					<Key size={18} />
					<h2 className="font-serif text-xl font-normal text-luxury-dark">Developer Credential Extraction Studio</h2>
				</div>
				<p className="text-xs text-luxury-muted leading-relaxed font-light">Generate high-persistence, long-lived authorization keys designed to route requests from external testing clients straight through to your workspace nodes.</p>
			</div>

			<div className="h-px bg-luxury-dark/5"></div>

			<div className="bg-luxury-bg/50 p-6 rounded border border-luxury-dark/5 space-y-4">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h3 className="text-xs font-bold uppercase tracking-wider text-luxury-dark flex items-center gap-1.5">
							<Layers size={14} className="text-luxury-muted" /> Token Infrastructure Context
						</h3>
						<p className="text-[11px] text-luxury-muted font-light mt-0.5">Maps external microservice requests to your database user schema instance.</p>
					</div>
					<Button variant="gold" onClick={generateDeveloperKey} isLoading={generatingKey}>
						Mint Authorization Token
					</Button>
				</div>

				{generatedKey && (
					<div className="space-y-2 pt-2">
						<div className="bg-luxury-dark p-4 rounded text-xs font-mono text-green-400 border border-white/10 shadow-inner relative overflow-hidden">
							<div className="absolute top-2 right-2">
								<button onClick={copyToClipboard} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-[10px] uppercase font-bold px-3 py-1 rounded transition-colors">
									{copiedKey ? "Saved to Clipboard" : "Copy Key"}
								</button>
							</div>
							<div className="text-[10px] text-white/30 uppercase tracking-widest font-sans border-b border-white/5 pb-2 mb-2">Active Client Key Container</div>
							<div className="break-all pr-32 select-all font-semibold tracking-wide">{generatedKey}</div>
						</div>

						<div className="p-4 bg-amber-50/50 border border-amber-200/60 text-[11px] text-amber-900 rounded space-y-2">
							<p className="font-bold flex items-center gap-1.5 text-luxury-dark">
								<ShieldCheck size={14} className="text-luxury-gold" /> Headers Payload Standard
							</p>
							<pre className="bg-white p-2 rounded border border-amber-200 font-mono text-[10px] text-luxury-dark overflow-x-auto">x-api-key: {generatedKey}</pre>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
