import { SubmitFlow } from "@/components/submit-flow";
import { currentChallenge } from "@/lib/data";

export default function SubmitPage() {
  return (
    <div className="flex justify-center">
       <SubmitFlow challengeTopic={currentChallenge.title} challengeDescription={currentChallenge.description} />
    </div>
  );
}
