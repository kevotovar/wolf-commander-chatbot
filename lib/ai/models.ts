export const DEFAULT_CHAT_MODEL: string = 'chat-model';

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Modelo de chat',
    description: 'Modelo principal para todos los chats',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Modelo de razonamiento',
    description: 'Usa razonamiento avanzado',
  },
  {
    id: 'search-model',
    name: 'Modelo de búsqueda',
    description: 'Usa búsqueda avanzada',
  },
];
