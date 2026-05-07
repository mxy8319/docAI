
import AssistantChat from "./components/AssistantChat";
import DocPreview from "./components/DocPreview";
import { Header } from "./components/Header";

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex">
        <div className="flex-[3] flex">
          <AssistantChat />
        </div>
        <div className="flex-[1] border-l border-outline/20 bg-surface-container-lowest">
          <DocPreview />
        </div>
      </div>
    </div>
  );
}