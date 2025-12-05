import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = 'fr' | 'en';

interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    message: string;
    setMessage: (message: string) => void;
    language: Language;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    // Detect language: default to 'en' if not 'fr'
    const [language] = useState<Language>(() => {
        if (typeof navigator !== 'undefined') {
            return navigator.language.startsWith('fr') ? 'fr' : 'en';
        }
        return 'en';
    });

    return (
        <ChatContext.Provider value={{ isOpen, setIsOpen, message, setMessage, language }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
