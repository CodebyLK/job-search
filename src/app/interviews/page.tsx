import { InterviewList } from "@/features/interviews/InterviewList";
import { MasterBank } from "@/features/interviews/MasterBank";

export default function InterviewsPage() {
    return (
        <div className="p-8 w-full max-w-7xl mx-auto pb-24">
            <InterviewList />
            <MasterBank />
        </div>
    );
}