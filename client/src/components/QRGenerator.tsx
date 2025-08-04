import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { FiCode, FiDownload } from "react-icons/fi";

interface QRGeneratorProps {
	userId: string;
	userName: string;
}

const QRGenerator = ({ userId, userName }: QRGeneratorProps) => {
	const [qrCodeData, setQrCodeData] = useState("");

	useEffect(() => {
		generateQRCode();
	}, [userId]);

	const generateQRCode = async () => {
		try {
			const qrData = JSON.stringify({
				userId,
				type: "attendance",
				userName,
			});
			const qrCodeDataURL = await QRCode.toDataURL(qrData, {
				errorCorrectionLevel: "M",
				margin: 1,
				color: {
					dark: "#000000",
					light: "#FFFFFF",
				},
				width: 200,
			});
			setQrCodeData(qrCodeDataURL);
		} catch (error) {
			console.error("QR code generation error:", error);
		}
	};

	const downloadQRCode = () => {
		const link = document.createElement("a");
		link.href = qrCodeData;
		link.download = `${userName}-attendance-qr.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="text-center">
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center">
					<FiCode className="mr-2" />
					Attendance QR Code
				</h3>
				<p className="text-sm text-gray-600">
					Scan this code to check in to the gym
				</p>
			</div>

			{qrCodeData && (
				<div className="inline-block bg-white p-4 rounded-lg shadow-lg">
					<img
						src={qrCodeData}
						alt={`QR Code for ${userName}`}
						className="mx-auto"
					/>
					<div className="mt-4 space-y-2">
						<p className="text-sm font-medium text-gray-900">
							{userName}
						</p>
						<button
							onClick={downloadQRCode}
							className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
						>
							<FiDownload className="mr-2 w-4 h-4" />
							Download QR Code
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default QRGenerator;
