import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkle } from '@phosphor-icons/react';
import { ChatInterface } from './ChatInterface';
import { Message, CartItem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

type ChatbotPopupProps = {
  onAddToCart: (item: CartItem) => void;
};

export function ChatbotPopup({ onAddToCart }: ChatbotPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useKV<Message[]>('chatbot-messages', []);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Sparkle className="w-6 h-6" weight="fill" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl h-[80vh] p-0 gap-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Sparkle className="w-5 h-5 text-primary-foreground" weight="fill" />
              </div>
              AI Assistant
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <ChatInterface 
              messages={messages || []}
              setMessages={setMessages}
              onAddToCart={onAddToCart}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
