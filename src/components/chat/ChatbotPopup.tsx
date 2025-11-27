import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkle, X } from '@phosphor-icons/react';
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
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] h-[600px] max-h-[calc(100vh-140px)]"
          >
            <Card className="h-full flex flex-col shadow-2xl border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Sparkle className="w-5 h-5 text-primary-foreground" weight="fill" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">AI Multi-Agent Assistant</h3>
                    <p className="text-[10px] text-muted-foreground">5 specialized agents ready to help</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <ChatInterface 
                  messages={messages || []}
                  setMessages={setMessages}
                  onAddToCart={onAddToCart}
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Sparkle className="w-6 h-6" weight="fill" />
          )}
        </Button>
      </motion.div>
    </>
  );
}
