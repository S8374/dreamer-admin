import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useTranslateTextMutation } from "@/lib/redux/api/translationApi";
import { toast } from "sonner";

interface AutoTranslateButtonProps {
  sourceText: string;
  onTranslate: (translatedText: string) => void;
  className?: string;
}

export function AutoTranslateButton({
  sourceText,
  onTranslate,
  className,
}: AutoTranslateButtonProps) {
  const [translateText, { isLoading }] = useTranslateTextMutation();

  const handleTranslate = async () => {
    if (!sourceText || sourceText.trim() === "") {
      toast.error("Please enter English text first before translating.");
      return;
    }

    try {
      const response = await translateText({ text: sourceText, targetLang: "es" }).unwrap();
      if (response.data?.translatedText) {
        onTranslate(response.data.translatedText);
        toast.success("Translated to Spanish!");
      } else {
        toast.error("Translation failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to translate text.");
    }
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md font-medium text-xs h-7 px-2 border bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border-purple-200 text-purple-700 hover:text-purple-800 transition-all ${className || ""}`}
      onClick={handleTranslate}
      disabled={isLoading || !sourceText}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
      )}
      Auto-Translate
    </button>
  );
}
