import TrainerAvailabilityOverview from "../components/TrainerAvailabilityOverview";
import SubscriptionGuard from "../components/SubscriptionGuard";

const TrainersPage = () => {
	return (
		<SubscriptionGuard>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<TrainerAvailabilityOverview />
				</div>
			</div>
		</SubscriptionGuard>
	);
};

export default TrainersPage;
