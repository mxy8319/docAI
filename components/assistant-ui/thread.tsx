import {
  ComposerAddAttachment,
} from "@/components/assistant-ui/attachment";
import { CitationMarkdownText } from "@/components/assistant-ui/citation-markdown-text";
import { RagSourceChips } from "@/components/assistant-ui/rag-source-chips";
import {
  Reasoning,
  ReasoningContent,
  ReasoningRoot,
  ReasoningText,
  ReasoningTrigger,
} from "@/components/assistant-ui/reasoning";
import {
  ToolGroupContent,
  ToolGroupRoot,
  ToolGroupTrigger,
} from "@/components/assistant-ui/tool-group";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  SuggestionPrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RefreshCwIcon,
  SquareIcon,
  SparklesIcon,
} from "lucide-react";
import type { FC } from "react";

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root @container flex h-full min-h-0 flex-col bg-surface"
      style={{
        ["--thread-max-width" as string]: "44rem",
        ["--composer-radius" as string]: "12px",
        ["--composer-padding" as string]: "8px",
      }}
    >
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        data-slot="aui_thread-viewport"
        className="relative flex min-h-0 flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth"
      >
        <div className="mx-auto flex min-h-0 w-full max-w-(--thread-max-width) flex-1 flex-col px-4 pt-4 md:px-6 lg:px-8">
          <AuiIf condition={(s) => s.thread.isEmpty}>
            <ThreadWelcome />
          </AuiIf>

          <div
            data-slot="aui_message-group"
            className="mb-10 flex flex-col gap-y-6 empty:hidden"
          >
            <ThreadPrimitive.Messages>
              {() => <ThreadMessage />}
            </ThreadPrimitive.Messages>
          </div>

          <ThreadPrimitive.ViewportFooter className="aui-thread-viewport-footer sticky bottom-0 mt-auto flex flex-col gap-4 overflow-visible rounded-t-2xl bg-surface-container-lowest pb-4 md:pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <ThreadScrollToBottom />
            <Composer />
          </ThreadPrimitive.ViewportFooter>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadMessage: FC = () => {
  const role = useAuiState((s) => s.message.role);
  const isEditing = useAuiState((s) => s.message.composer.isEditing);

  if (isEditing) return <EditComposer />;
  if (role === "user") return <UserMessage />;
  return <AssistantMessage />;
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-3 disabled:invisible border-outline/30 bg-surface-container-lowest hover:bg-surface-container-low"
      >
        <ArrowDownIcon className="h-4 w-4 text-on-surface" />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <div className="aui-thread-welcome-root my-auto flex grow flex-col">
      <div className="aui-thread-welcome-center flex w-full grow flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <SparklesIcon className="h-10 w-10 text-primary" />
        </div>
        <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-4">
          <h1 className="aui-thread-welcome-message-inner mb-2 font-semibold text-2xl text-on-surface">
            Afternoon, Sarah.
          </h1>
          <p className="aui-thread-welcome-message-inner text-lg text-on-surface-variant">
            Your forest of knowledge is ready for exploration. What shall we find today?
          </p>
        </div>
      </div>
      <ThreadSuggestions />
    </div>
  );
};

const ThreadSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions mx-auto grid w-full max-w-lg grid-cols-1 gap-3 pb-4 md:grid-cols-2">
      <ThreadPrimitive.Suggestions>
        {() => <ThreadSuggestionItem />}
      </ThreadPrimitive.Suggestions>
    </div>
  );
};

const ThreadSuggestionItem: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestion-display fade-in slide-in-from-bottom-2 animate-in fill-mode-both duration-200">
      <SuggestionPrimitive.Trigger send asChild>
        <Button
          variant="outline"
          className="aui-thread-welcome-suggestion h-auto w-full flex-wrap items-start justify-start gap-2 rounded-xl border-outline/30 bg-surface-container-lowest px-4 py-3 text-start text-sm transition-all hover:border-primary/50 hover:bg-primary/5"
        >
          <FileTextIcon className="h-4 w-4 shrink-0 text-primary" />
          <div className="flex flex-col items-start">
            <SuggestionPrimitive.Title className="aui-thread-welcome-suggestion-text-1 font-medium text-on-surface" />
            <SuggestionPrimitive.Description className="aui-thread-welcome-suggestion-text-2 text-on-surface-variant empty:hidden" />
          </div>
        </Button>
      </SuggestionPrimitive.Trigger>
    </div>
  );
};

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col">
      <div
        data-slot="aui_composer-shell"
        className="flex items-center gap-3 rounded-xl border border-outline/20 bg-surface-container-lowest px-4 py-2.5 shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md"
      >
        <ComposerAddAttachment />
        <ComposerPrimitive.Input
          placeholder="Ask anything about your documents..."
          className="aui-composer-input flex-1 resize-none bg-transparent py-2 text-base text-on-surface outline-none placeholder:text-on-surface-variant"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <ComposerAction />
      </div>
      <p className="mt-2 text-center text-xs text-on-surface-variant">
        DocAI may provide incomplete information. Verify key findings.
      </p>
    </ComposerPrimitive.Root>
  );
};

const ComposerAction: FC = () => {
  return (
    <div className="aui-composer-action-wrapper flex items-center">
      <AuiIf condition={(s) => !s.thread.isRunning}>
        <ComposerPrimitive.Send asChild>
          <Button
            type="button"
            variant="default"
            size="icon"
            className="aui-composer-send h-10 w-10 rounded-xl bg-primary text-on-primary shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
            aria-label="Send message"
          >
            <ArrowRightIcon className="aui-composer-send-icon h-5 w-5" />
          </Button>
        </ComposerPrimitive.Send>
      </AuiIf>
      <AuiIf condition={(s) => s.thread.isRunning}>
        <ComposerPrimitive.Cancel asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="aui-composer-cancel h-10 w-10 rounded-xl border-outline/30"
            aria-label="Stop generating"
          >
            <SquareIcon className="aui-composer-cancel-icon h-4 w-4 fill-current" />
          </Button>
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantMessage: FC = () => {
  const ACTION_BAR_PT = "pt-1.5";
  const ACTION_BAR_HEIGHT = `-mb-7.5 min-h-7.5 ${ACTION_BAR_PT}`;

  return (
    <MessagePrimitive.Root
      data-slot="aui_assistant-message-root"
      data-role="assistant"
      className="fade-in slide-in-from-bottom-1 relative animate-in duration-150"
    >
      <div className="flex gap-3">
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <SparklesIcon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <div
            data-slot="aui_assistant-message-content"
            className="wrap-break-word rounded-2xl bg-surface-container-lowest px-5 py-4 text-base leading-relaxed"
          >
            <MessagePrimitive.GroupedParts
              groupBy={(part) => {
                if (part.type === "reasoning")
                  return ["group-chainOfThought", "group-reasoning"];
                if (part.type === "tool-call")
                  return ["group-chainOfThought", "group-tool"];
                return null;
              }}
            >
              {({ part, children }) => {
                switch (part.type) {
                  case "group-chainOfThought":
                    return <div data-slot="aui_chain-of-thought">{children}</div>;
                  case "group-reasoning": {
                    const running = part.status.type === "running";
                    return (
                      <ReasoningRoot defaultOpen={running}>
                        <ReasoningTrigger active={running} />
                        <ReasoningContent aria-busy={running}>
                          <ReasoningText>{children}</ReasoningText>
                        </ReasoningContent>
                      </ReasoningRoot>
                    );
                  }
                  case "group-tool":
                    return (
                      <ToolGroupRoot>
                        <ToolGroupTrigger
                          count={part.indices.length}
                          active={part.status.type === "running"}
                        />
                        <ToolGroupContent>{children}</ToolGroupContent>
                      </ToolGroupRoot>
                    );
                  case "text":
                    return <CitationMarkdownText />;
                  case "reasoning":
                    return <Reasoning {...part} />;
                  case "tool-call":
                    return part.toolUI ?? <ToolFallback {...part} />;
                  default:
                    return null;
                }
              }}
            </MessagePrimitive.GroupedParts>
            <RagSourceChips />
            <MessageError />
          </div>

          <div
            data-slot="aui_assistant-message-footer"
            className={cn("flex items-center", ACTION_BAR_HEIGHT)}
          >
            <BranchPicker />
            <AssistantActionBar />
          </div>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-assistant-action-bar-root flex gap-1 text-on-surface-variant"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy" className="h-8 w-8 rounded-lg p-2 transition-colors hover:bg-surface-container-low">
          <AuiIf condition={(s) => s.message.isCopied}>
            <CheckIcon className="h-4 w-4" />
          </AuiIf>
          <AuiIf condition={(s) => !s.message.isCopied}>
            <CopyIcon className="h-4 w-4" />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh" className="h-8 w-8 rounded-lg p-2 transition-colors hover:bg-surface-container-low">
          <RefreshCwIcon className="h-4 w-4" />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
      <ActionBarMorePrimitive.Root>
        <ActionBarMorePrimitive.Trigger asChild>
          <TooltipIconButton
            tooltip="More"
            className="h-8 w-8 rounded-lg p-2 transition-colors hover:bg-surface-container-low"
          >
            <MoreHorizontalIcon className="h-4 w-4" />
          </TooltipIconButton>
        </ActionBarMorePrimitive.Trigger>
        <ActionBarMorePrimitive.Content
          side="bottom"
          align="start"
          className="aui-action-bar-more-content z-50 min-w-32 overflow-hidden rounded-lg border border-outline/20 bg-surface-container-lowest p-1 shadow-lg"
        >
          <ActionBarPrimitive.ExportMarkdown asChild>
            <ActionBarMorePrimitive.Item className="aui-action-bar-more-item flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-surface-container-low">
              <DownloadIcon className="h-4 w-4" />
              Export as Markdown
            </ActionBarMorePrimitive.Item>
          </ActionBarPrimitive.ExportMarkdown>
        </ActionBarMorePrimitive.Content>
      </ActionBarMorePrimitive.Root>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      data-slot="aui_user-message-root"
      className="fade-in slide-in-from-bottom-1 flex animate-in justify-end duration-150"
      data-role="user"
    >
      <div className="flex gap-3">
        <div className="max-w-[75%]">
          <div className="aui-user-message-content wrap-break-word rounded-2xl bg-tertiary-container px-5 py-3.5 text-base text-on-tertiary-container empty:hidden">
            <MessagePrimitive.Parts />
          </div>
        </div>
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-highest">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <BranchPicker
          data-slot="aui_user-branch-picker"
          className="-me-1"
        />
      </div>
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit h-8 w-8 rounded-lg p-2 transition-colors hover:bg-surface-container-low">
          <PencilIcon className="h-4 w-4" />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root
      data-slot="aui_edit-composer-wrapper"
      className="flex flex-col px-2"
    >
      <ComposerPrimitive.Root className="aui-edit-composer-root ms-auto flex w-full max-w-[85%] flex-col rounded-xl border border-outline/20 bg-surface-container-lowest">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input min-h-14 w-full resize-none bg-transparent p-4 text-base text-on-surface outline-none"
          autoFocus
        />
        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm" className="text-on-surface-variant">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm" className="bg-primary text-on-primary">
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root -ms-2 me-2 inline-flex items-center text-on-surface-variant text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous" className="h-6 w-6 p-1">
          <ChevronLeftIcon className="h-3 w-3" />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next" className="h-6 w-6 p-1">
          <ChevronRightIcon className="h-3 w-3" />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
