import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { FiCamera, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

interface AttendanceQRScannerProps {
	onScanSuccess: (userId: string, userName?: string) => void;
	onClose: () => void;
	isVisible: boolean;
}

const AttendanceQRScanner = ({
	onScanSuccess,
	onClose,
	isVisible,
}: AttendanceQRScannerProps) => {
	const [scanning, setScanning] = useState(true);

	const handleScan = (result: any) => {
		if (!result || !result[0]?.rawValue) return;

		try {
			setScanning(false);

			// Try to parse as JSON first (new format)
			try {
				const parsedData = JSON.parse(result[0].rawValue);
				if (parsedData.userId && parsedData.type === "attendance") {
					onScanSuccess(parsedData.userId, parsedData.userName);
					toast.success(
						`Successfully scanned QR code for ${
							parsedData.userName || "user"
						}!`
					);
					onClose();
					return;
				}
			} catch (jsonError) {
				// If JSON parsing fails, try to use the raw value as userId
				const userId = result[0].rawValue.trim();
				if (userId) {
					onScanSuccess(userId);
					toast.success("Successfully scanned QR code!");
					onClose();
					return;
				}
			}

			toast.error("Invalid QR code format");
			setScanning(true);
		} catch (error) {
			console.error("QR scan error:", error);
			toast.error("Error processing QR code");
			setScanning(true);
		}
	};

	const handleError = (error: any) => {
		console.error("QR Scanner error:", error);
		// Don't show error toast for camera permission issues initially
	};

	if (!isVisible) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
				<div className="p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900 flex items-center">
							<FiCamera className="mr-2" />
							Scan Attendance QR Code
						</h3>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
							title="Close scanner"
						>
							<FiX className="w-6 h-6" />
						</button>
					</div>

					<div className="mb-4">
						<p className="text-sm text-gray-600 text-center">
							Position the QR code within the camera frame to
							check in
						</p>
					</div>

					{scanning && (
						<div className="bg-black rounded-lg overflow-hidden">
							<Scanner
								onScan={handleScan}
								onError={handleError}
								allowMultiple={false}
							/>
						</div>
					)}

					{!scanning && (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
							<p className="text-gray-600">
								Processing QR code...
							</p>
						</div>
					)}

					<div className="mt-4 text-center">
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AttendanceQRScanner;
